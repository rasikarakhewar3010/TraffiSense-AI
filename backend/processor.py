import cv2
import numpy as np
from ultralytics import YOLO
import math
from collections import defaultdict, deque, OrderedDict
import base64
import logging
import os
import threading
import queue
import time
import asyncio
from cloud_storage import cloud_storage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
TRACK_HISTORY_LEN = 40
SKIP_FRAMES = 3  # Increase skip to 3 for significantly faster processing (approx 3x speedup)
MIN_TRACK_FRAMES = 5
MIN_SPEED_THRESHOLD = 5
WRONG_WAY_ANGLE_DIFF = 120
FLOW_SMOOTHING_ALPHA = 0.05
DISPLAY_WIDTH = 640
VIOLATION_COOLDOWN = 30 # Hysteresis frames

class AsyncVideoWriter:
    """
    Dedicated worker thread for handling blocking I/O (video encoding/writing).
    Decouples processing FPS from disk I/O latency.
    """
    def __init__(self):
        self.queue = queue.Queue(maxsize=200) # Limit memory usage, throttle if disk is too slow
        self.running = True
        self.thread = threading.Thread(target=self._worker, daemon=True, name="VideoWriterThread")
        self.thread.start()

    def _worker(self):
        while self.running or not self.queue.empty():
            try:
                # Timeout to allow checking self.running periodically
                # Using 0.1s ensures we don't block shutdown too long
                task = self.queue.get(timeout=0.1)
                cmd, writer, frame = task
                
                if cmd == 'write':
                    if writer and writer.isOpened():
                        writer.write(frame)
                elif cmd == 'release':
                    if writer:
                        writer.release()
                
                self.queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"AsyncWriter Error: {e}")

    def write(self, writer, frame):
        if not self.running: return
        try:
            # Block if queue is full to prevent OOM, effectively throttling Main loop to I/O speed if I/O is very slow
            self.queue.put(('write', writer, frame), timeout=2.0) 
        except queue.Full:
            logger.warning("Video Writer Queue Full - Dropping frame to maintain system stability")

    def release(self, writer):
        try:
            self.queue.put(('release', writer, None), timeout=2.0)
        except:
            pass

    def stop(self):
        self.running = False
        if self.thread.is_alive():
            self.thread.join(timeout=2.0)

class VideoProcessor:
    def __init__(self):
        logger.info("Initializing VideoProcessor with High-Performance configuration...")
        # Using Nano model (n) for extreme speed as requested
        self.model = YOLO('yolov8n.pt') 
        
        # Async I/O Handler
        self.async_writer = AsyncVideoWriter()
        
        self.CLASS_NAMES = {2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck"}
        
        # Optimized State Stores
        self.track_history = defaultdict(lambda: deque(maxlen=TRACK_HISTORY_LEN))
        
        # O(1) Lookup for recent directions using OrderedDict as LRU cache
        self.recent_track_directions = OrderedDict() 
        self.MAX_DIRECTION_HISTORY = 100
        
        # Stats & State
        self.reset_stats()
        
        # Pre-allocate reuse headers for optimization
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        
        logger.info("VideoProcessor optimized and ready.")

    def reset_stats(self):
        self.stats = {
            "total_vehicles": set(),
            "forward_vehicles": set(),
            "backward_vehicles": set(),
            "stationary_vehicles": set(),
            "violated_vehicles": set(),
            "violation_details": []
        }
        self.vehicle_max_speeds = {}
        self.vehicle_classes = {}
        self.violation_timers = {} # id -> frames
        self.frame_buffer = deque(maxlen=60)

    def _calculate_majority_direction(self):
        if len(self.recent_track_directions) < 3:
            return None
        
        # Vectorized histogram calculation using numpy
        angles = np.array(list(self.recent_track_directions.values()))
        # Sector calculation: (angle + 22.5) // 45 % 8
        sectors = ((angles + 22.5) // 45).astype(int) % 8
        counts = np.bincount(sectors, minlength=8)
        max_sector = counts.argmax()
        return float(max_sector * 45)

    def _add_timestamp(self, img, ts):
        # Mutate copy strictly needed for I/O
        img_copy = img.copy() 
        # Time
        cv2.putText(img_copy, f"Time: {ts:.1f}s", (10, 30), 
                   self.font, 0.7, (255, 255, 255), 2)
        # Turbo Indicator
        cv2.putText(img_copy, "TURBO CORE", (img_copy.shape[1] - 150, 30), 
                   self.font, 0.6, (0, 255, 255), 2) # Yellow/Cyan
        return img_copy

    async def process_video(self, video_path: str, manual_direction: float = None):
        logger.info(f"Processing: {video_path}")
        cap = cv2.VideoCapture(video_path)
        
        # Metadata
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        base_video_name = os.path.splitext(os.path.basename(video_path))[0]
        
        # Directories
        VIOLATIONS_DIR = "generated_violations"
        PROCESSED_DIR = "processed_videos"
        os.makedirs(VIOLATIONS_DIR, exist_ok=True)
        os.makedirs(PROCESSED_DIR, exist_ok=True)

        # Full Video Writer
        input_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        effective_fps = input_fps / SKIP_FRAMES
        target_frame_time = 1.0 / input_fps # For pacing
        
        full_video_path = os.path.join(PROCESSED_DIR, f"processed_{base_video_name}.mp4")
        
        # Deferred Initialization
        full_video_writer = None 
        
        # Active local violations: {id: {writer, start_ts...}}
        active_violations = {}

        self.reset_stats()
        
        try:
            while cap.isOpened():
                loop_start_time = time.perf_counter()
                
                success, frame = cap.read()
                if not success: break

                # Frame skipping
                current_frame_idx = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
                if current_frame_idx % SKIP_FRAMES != 0:
                    continue
                
                # Timestamp
                current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

                # 1. Resize (CPU bound)
                h, w = frame.shape[:2]
                scale = DISPLAY_WIDTH / w
                new_h = int(h * scale)
                frame_resized = cv2.resize(frame, (DISPLAY_WIDTH, new_h))

                # Lazy Init Full Writer
                if full_video_writer is None:
                    # Use H.264 codec for browser compatibility
                    # Try avc1 first, fallback to mp4v if not available
                    try:
                        fourcc = cv2.VideoWriter_fourcc(*'avc1')
                        full_video_writer = cv2.VideoWriter(
                            full_video_path, fourcc, effective_fps, (DISPLAY_WIDTH, new_h)
                        )
                        if not full_video_writer.isOpened():
                            raise Exception("avc1 codec not available")
                        logger.info("Using H.264 (avc1) codec for video encoding")
                    except:
                        logger.warning("H.264 codec not available, falling back to mp4v")
                        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                        full_video_writer = cv2.VideoWriter(
                            full_video_path, fourcc, effective_fps, (DISPLAY_WIDTH, new_h)
                        )

                # 2. Inference
                results = self.model.track(frame_resized, persist=True, tracker="bytetrack.yaml", 
                                         classes=[2, 3, 5, 7], verbose=False)

                # Data Collection
                frame_data = {
                    "frame_width": DISPLAY_WIDTH, "frame_height": new_h,
                    "objects": [], "majority_direction": None,
                    "current_frame": current_frame_idx, "total_frames": total_frames
                }

                current_track_ids = set()

                if results[0].boxes.id is not None:
                    # CPU Unload
                    boxes_xywh = results[0].boxes.xywh.cpu().numpy()
                    track_ids = results[0].boxes.id.int().cpu().numpy()
                    clss = results[0].boxes.cls.int().cpu().numpy()
                    
                    current_track_ids.update(track_ids)

                    # Iterate detections
                    for i, track_id in enumerate(track_ids):
                        x, y, w_box, h_box = boxes_xywh[i]
                        cls_id = int(clss[i])
                        center = (float(x), float(y))
                        
                        # -- State Update --
                        track = self.track_history[track_id]
                        track.append(center)
                        
                        # Stats
                        if len(track) >= MIN_TRACK_FRAMES:
                            self.stats["total_vehicles"].add(track_id)
                            if track_id not in self.vehicle_classes:
                                self.vehicle_classes[track_id] = cls_id
                        
                        # -- Kinematics --
                        speed = 0
                        direction = 0
                        if len(track) > 2:
                            dx = center[0] - track[0][0]
                            dy = center[1] - track[0][1]
                            dist = math.sqrt(dx*dx + dy*dy)
                            # Speed Calculation (Normalized)
                            # dist is total distance covered in len(track) frames
                            # speed = (pixels / frame) * scalar
                            px_per_frame = dist / len(track)
                            speed = px_per_frame * 15 # Arbitrary scalar to map pixel/frame to roughly 0-100 "km/h"
                            
                            if speed > MIN_SPEED_THRESHOLD:
                                direction = math.degrees(math.atan2(dy, dx))
                                if direction < 0: direction += 360
                                
                                # Update Global Direction History (LRU)
                                if track_id in self.recent_track_directions:
                                    del self.recent_track_directions[track_id]
                                self.recent_track_directions[track_id] = direction
                                if len(self.recent_track_directions) > self.MAX_DIRECTION_HISTORY:
                                    self.recent_track_directions.popitem(last=False)
                            
                            self.vehicle_max_speeds[track_id] = max(self.vehicle_max_speeds.get(track_id, 0), speed)

                        # -- Logic Phase --
                        frame_data["majority_direction"] = self._calculate_majority_direction()
                        
                        # Wrong Way Detection
                        is_wrong_way = False
                        target_angle = manual_direction if manual_direction is not None else frame_data["majority_direction"]
                        
                        if target_angle is not None and speed > MIN_SPEED_THRESHOLD:
                             diff = abs(direction - target_angle)
                             if diff > 180: diff = 360 - diff
                             
                             if diff > WRONG_WAY_ANGLE_DIFF:
                                 is_wrong_way = True
                                 self.violation_timers[track_id] = VIOLATION_COOLDOWN
                        
                        # Hysteresis Check
                        if not is_wrong_way and self.violation_timers.get(track_id, 0) > 0:
                            is_wrong_way = True
                            self.violation_timers[track_id] -= 1
                            
                        # Violation State Management
                        is_new_alert = False
                        if is_wrong_way:
                           self._handle_wrong_way(active_violations, track_id, current_time, 
                                                 current_frame_idx, base_video_name, VIOLATIONS_DIR, new_h)
                           
                           if track_id not in self.stats["violated_vehicles"]:
                               self.stats["violated_vehicles"].add(track_id)
                               is_new_alert = True 

                           self.stats["backward_vehicles"].add(track_id)
                           self.stats["forward_vehicles"].discard(track_id)
                        else:
                           self.stats["forward_vehicles"].add(track_id)
                           self.stats["backward_vehicles"].discard(track_id)

                        # -- Visuals (Drawing) --
                        # Neon Colors (BGR)
                        NEON_GREEN = (50, 255, 50)
                        NEON_RED = (20, 20, 255)
                        
                        color = NEON_RED if is_wrong_way else NEON_GREEN
                        
                        p1 = (int(x - w_box/2), int(y - h_box/2))
                        p2 = (int(x + w_box/2), int(y + h_box/2))
                        
                        cv2.rectangle(frame_resized, p1, p2, color, 2)
                        
                        # Label Background
                        if is_wrong_way: 
                             label = "WRONG WAY"
                             (w_text, h_text), _ = cv2.getTextSize(label, self.font, 0.5, 1)
                             cv2.rectangle(frame_resized, (p1[0], p1[1] - 20), (p1[0] + w_text + 10, p1[1]), color, -1)
                             
                             cv2.putText(frame_resized, label, (p1[0] + 5, p1[1] - 5), 
                                        self.font, 0.5, (255, 255, 255), 1)
                        
                        if speed > 2:
                            end_pos = (int(x + 20 * math.cos(math.radians(direction))), 
                                      int(y + 20 * math.sin(math.radians(direction))))
                            cv2.arrowedLine(frame_resized, (int(x), int(y)), end_pos, (255, 255, 0), 2)
                            
                        # API Payload
                        frame_data["objects"].append({
                            "id": int(track_id),
                            "box": [float(x), float(y), float(w_box), float(h_box)],
                            "direction": float(direction),
                            "is_wrong_way": is_wrong_way,
                            "is_new_violation": is_new_alert,
                            "speed": float(speed)
                        })

                # -- Cleanup Active Violations --
                self._cleanup_inactive_violations(active_violations, current_track_ids)

                # -- I/O Phase (Async) --
                # 1. Full Video
                if full_video_writer:
                    frame_with_ts = self._add_timestamp(frame_resized, current_time)
                    self.async_writer.write(full_video_writer, frame_with_ts)
                
                # 2. Violation Data Update
                for tid, v_data in active_violations.items():
                    v_data["end_time"] = current_time
                    v_data["end_frame"] = current_frame_idx
                
                # 3. Buffer Update
                self.frame_buffer.append(frame_resized.copy()) 

                # -- Yield to Frontend --
                # BATCH MODE: Only send preview every 10 frames to maximize processing speed
                # This fulfills "Process video first" by removing network/encoding latency
                if current_frame_idx % 10 == 0:
                    _, buffer = cv2.imencode('.jpg', frame_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
                    frame_data["image"] = base64.b64encode(buffer).decode('utf-8')
                
                # -- Pacing Logic --
                # Removed artificial delay to allow maximum processing speed analysis
                # elapsed = time.perf_counter() - loop_start_time
                # if elapsed < target_frame_time:
                #     await asyncio.sleep(target_frame_time - elapsed)
                
                # Small yield to prevent event loop blocking
                await asyncio.sleep(0)

                yield frame_data
            
        except Exception as e:
            logger.error(f"Processing Critical Error: {e}", exc_info=True)
            raise e
        finally:
            cap.release()
            if full_video_writer:
                self.async_writer.release(full_video_writer)
            for tid, v in active_violations.items():
                self._finalize_violation_stats(tid, v)
            
            # Upload processed video to Cloudinary
            cloud_url = None
            if os.path.exists(full_video_path):
                # Notify frontend about upload status
                yield {"type": "status", "message": "Uploading video to cloud (this may take a moment)..."}
                logger.info("Uploading processed video to Cloudinary...")
                # Run synchronous upload in a separate thread to avoid blocking the event loop
                # This prevents WebSocket timeouts (1006) during large uploads
                upload_result = await asyncio.to_thread(
                    cloud_storage.upload_video,
                    full_video_path,
                    public_id=f"processed_{base_video_name}",
                    folder="traffisense/processed"
                )
                if upload_result:
                    cloud_url = upload_result.get('secure_url')
                    logger.info(f"Video uploaded successfully: {cloud_url}")
                else:
                    logger.error("Failed to upload video to Cloudinary")
                
            yield self._generate_final_report(full_video_path, cloud_url)
            
    def _handle_wrong_way(self, active_violations, track_id, current_time, frame_idx, video_name, out_dir, h):
        if track_id not in active_violations:
            active_violations[track_id] = {
                "start_time": current_time,
                "start_frame": frame_idx,
                "end_time": current_time,
                "end_frame": frame_idx,
            }

    def _cleanup_inactive_violations(self, active_violations, current_track_ids):
        ended = []
        for tid, v_data in active_violations.items():
            if tid not in current_track_ids:
                self._finalize_violation_stats(tid, v_data)
                ended.append(tid)
        for tid in ended:
            del active_violations[tid]

    def _finalize_violation_stats(self, tid, v_data):
        cls_id = self.vehicle_classes.get(tid, -1)
        cls_name = self.CLASS_NAMES.get(cls_id, "Unknown")
        
        self.stats["violation_details"].append({
            "id": int(tid),
            "type": cls_name,
            "start_time": float(v_data["start_time"]),
            "end_time": float(v_data["end_time"]),
            "start_frame": int(v_data["start_frame"]),
            "end_frame": int(v_data["end_frame"])
        })

    def _generate_final_report(self, full_video_path, cloud_url=None):
        final_forward = 0
        final_backward = 0
        final_stationary = 0
        STATIONARY_THRESHOLD = 5.0
        
        for track_id in self.stats["total_vehicles"]:
             is_vio = track_id in self.stats["violated_vehicles"]
             max_s = self.vehicle_max_speeds.get(track_id, 0)
             if is_vio: final_backward += 1
             elif max_s < STATIONARY_THRESHOLD: final_stationary += 1
             else: final_forward += 1
             
        logger.info(f"Generating Final Report. Total Vehicles: {len(self.stats['total_vehicles'])}")
        logger.info(f"Violated Vehicles from set: {len(self.stats['violated_vehicles'])}")
        logger.info(f"Violation Details List size: {len(self.stats['violation_details'])}")
        if len(self.stats['violation_details']) > 0:
            logger.info(f"Sample Violation: {self.stats['violation_details'][0]}")

        return {
            "type": "report",
            "summary": {
                "total": len(self.stats["total_vehicles"]),
                "forward": final_forward,
                "backward": final_backward,
                "stationary": final_stationary,
                "violations": len(self.stats["violated_vehicles"]),
                "violation_list": self.stats["violation_details"],
                "average_speed": round(sum(self.vehicle_max_speeds.values()) / (len(self.vehicle_max_speeds) or 1), 1),
                "class_breakdown": self._get_class_breakdown(),
                "full_video": os.path.basename(full_video_path),
                "cloud_video_url": cloud_url
            }
        }

    def _get_class_breakdown(self):
        counts = defaultdict(int)
        for tid in self.stats["total_vehicles"]:
            cid = self.vehicle_classes.get(tid)
            cname = self.CLASS_NAMES.get(cid, "Other")
            counts[cname] += 1
        return dict(counts)
