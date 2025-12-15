import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
import os
import logging
from typing import Optional, Dict
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

class CloudStorage:
    """
    Handles video upload and management with Cloudinary.
    Provides automatic retry logic and error handling.
    """
    
    def __init__(self):
        self.cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
        if not self.cloud_name:
            raise ValueError("Cloudinary credentials not found in .env file")
        logger.info(f"CloudStorage initialized with cloud: {self.cloud_name}")
    
    def upload_video(self, file_path: str, public_id: Optional[str] = None, 
                    folder: str = "traffisense", max_retries: int = 3) -> Optional[Dict]:
        """
        Upload video to Cloudinary with retry logic.
        
        Args:
            file_path: Local path to video file
            public_id: Optional custom ID for the video
            folder: Cloudinary folder name
            max_retries: Number of retry attempts
            
        Returns:
            Dict with upload result or None if failed
        """
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return None
        
        # Generate public_id from filename if not provided
        if not public_id:
            base_name = os.path.splitext(os.path.basename(file_path))[0]
            timestamp = int(time.time())
            public_id = f"{base_name}_{timestamp}"
        
        full_public_id = f"{folder}/{public_id}"
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Uploading {file_path} to Cloudinary (attempt {attempt + 1}/{max_retries})...")
                
                result = cloudinary.uploader.upload(
                    file_path,
                    resource_type="video",
                    public_id=full_public_id,
                    overwrite=True,
                    format="mp4",
                    transformation=[
                        {"quality": "auto", "fetch_format": "mp4"}
                    ]
                )
                
                logger.info(f"Upload successful! URL: {result.get('secure_url')}")
                return result
                
            except Exception as e:
                logger.error(f"Upload attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"All upload attempts failed for {file_path}")
                    return None
        
        return None
    
    def get_video_url(self, public_id: str, folder: str = "traffisense", 
                     signed: bool = True, expiration: int = 3600) -> Optional[str]:
        """
        Get URL for a video stored in Cloudinary.
        
        Args:
            public_id: Video public ID
            folder: Cloudinary folder name
            signed: Whether to generate signed URL
            expiration: URL expiration time in seconds (for signed URLs)
            
        Returns:
            Video URL or None if failed
        """
        try:
            full_public_id = f"{folder}/{public_id}"
            
            if signed:
                # Generate signed URL with expiration
                url = cloudinary.CloudinaryVideo(full_public_id).build_url(
                    sign_url=True,
                    type="authenticated",
                    resource_type="video"
                )
            else:
                # Generate public URL
                url = cloudinary.CloudinaryVideo(full_public_id).build_url(
                    resource_type="video"
                )
            
            return url
            
        except Exception as e:
            logger.error(f"Failed to get video URL: {str(e)}")
            return None
    
    def delete_video(self, public_id: str, folder: str = "traffisense") -> bool:
        """
        Delete video from Cloudinary.
        
        Args:
            public_id: Video public ID
            folder: Cloudinary folder name
            
        Returns:
            True if successful, False otherwise
        """
        try:
            full_public_id = f"{folder}/{public_id}"
            result = cloudinary.uploader.destroy(full_public_id, resource_type="video")
            
            if result.get('result') == 'ok':
                logger.info(f"Deleted video: {full_public_id}")
                return True
            else:
                logger.warning(f"Delete failed: {result}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete video: {str(e)}")
            return False
    
    def get_upload_stats(self) -> Optional[Dict]:
        """
        Get Cloudinary account usage statistics.
        
        Returns:
            Dict with usage stats or None if failed
        """
        try:
            result = cloudinary.api.usage()
            return {
                'storage_used_mb': result.get('storage', {}).get('usage', 0) / (1024 * 1024),
                'bandwidth_used_mb': result.get('bandwidth', {}).get('usage', 0) / (1024 * 1024),
                'transformations': result.get('transformations', {}).get('usage', 0),
                'plan': result.get('plan', 'unknown')
            }
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}")
            return None


# Singleton instance
cloud_storage = CloudStorage()


if __name__ == "__main__":
    # Test the cloud storage
    print("Testing Cloudinary connection...")
    stats = cloud_storage.get_upload_stats()
    if stats:
        print(f"✅ Connected to Cloudinary!")
        print(f"Storage used: {stats['storage_used_mb']:.2f} MB")
        print(f"Bandwidth used: {stats['bandwidth_used_mb']:.2f} MB")
        print(f"Plan: {stats['plan']}")
    else:
        print("❌ Failed to connect to Cloudinary")
