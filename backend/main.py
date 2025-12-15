from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import asyncio
import logging
from processor import VideoProcessor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Car Tracking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

from fastapi.staticfiles import StaticFiles

UPLOAD_DIR = "uploads"
VIOLATIONS_DIR = "generated_violations"
PROCESSED_DIR = "processed_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VIOLATIONS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

app.mount("/violations", StaticFiles(directory=VIOLATIONS_DIR), name="violations")
app.mount("/processed", StaticFiles(directory=PROCESSED_DIR), name="processed")

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        logger.info(f"Receiving file upload: {file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"File saved to {file_path}")
        return {"filename": file.filename, "path": file_path}
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return {"error": str(e)}

@app.websocket("/ws/{filename}")
async def websocket_endpoint(websocket: WebSocket, filename: str, direction: str = None):
    await websocket.accept()
    logger.info(f"WebSocket connected for {filename} with direction={direction}")
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        logger.warning(f"File not found: {file_path}")
        await websocket.send_json({"error": "File not found"})
        await websocket.close()
        return

    processor = VideoProcessor()
    
    # Parse direction if provided
    manual_direction = None
    if direction and direction != "auto":
        try:
            manual_direction = float(direction)
        except ValueError:
            pass

    try:
        # Process video frame by frame and send results
        async for result in processor.process_video(file_path, manual_direction=manual_direction):
            await websocket.send_json(result)
            # Minimal delay to yield control but maximize speed
            await asyncio.sleep(0.001) 
    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
