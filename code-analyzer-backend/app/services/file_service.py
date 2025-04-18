import os
import logging
import uuid
from typing import Dict, List, Optional, Set, Tuple
from fastapi import UploadFile
import asyncio

from app.core.config import settings
from app.core.errors import FileException
from app.core.security import save_upload_files, cleanup_files
from app.utils.file_utils import ensure_directory_exists, create_temp_directory, cleanup_directory

logger = logging.getLogger(__name__)

class FileService:
    """Service for handling file uploads and management"""
    
    @staticmethod
    async def save_uploaded_files(files: List[UploadFile]) -> Tuple[List[str], str]:
        """
        Save uploaded files to a temporary directory
        
        Args:
            files: List of uploaded files
        
        Returns:
            Tuple containing list of saved file paths and the temp directory
        
        Raises:
            FileException: If files cannot be saved
        """
        if not files:
            raise FileException(
                message="No files provided for analysis",
                status_code=400
            )
        
        # Ensure the upload directory exists
        ensure_directory_exists(settings.UPLOAD_DIR)
        
        # Create a temporary directory for this upload
        temp_dir = create_temp_directory()
        
        try:
            # Save files
            saved_paths = await save_upload_files(files)
            
            logger.info(f"Saved {len(saved_paths)} files to {temp_dir}")
            return saved_paths, temp_dir
        
        except FileException as e:
            # Clean up on error
            cleanup_directory(temp_dir)
            raise e
        
        except Exception as e:
            # Clean up on error
            cleanup_directory(temp_dir)
            logger.error(f"Error saving uploaded files: {str(e)}")
            raise FileException(
                message=f"Error saving uploaded files: {str(e)}",
                status_code=500
            )
    
    @staticmethod
    def cleanup_analysis_files(file_paths: List[str], temp_dir: Optional[str] = None) -> None:
        """
        Clean up files after analysis
        
        Args:
            file_paths: List of file paths to clean up
            temp_dir: Temporary directory to remove
        """
        try:
            # Clean up individual files
            cleanup_files(file_paths)
            
            # Clean up temp directory if provided
            if temp_dir and os.path.exists(temp_dir):
                cleanup_directory(temp_dir)
                
            logger.debug(f"Cleaned up {len(file_paths)} files")
        
        except Exception as e:
            logger.warning(f"Error during cleanup: {str(e)}")
    
    @staticmethod
    def get_file_types(file_paths: List[str]) -> Dict[str, int]:
        """
        Get counts of file types in a list of files
        
        Args:
            file_paths: List of file paths
        
        Returns:
            Dictionary mapping file extensions to counts
        """
        file_types = {}
        
        for path in file_paths:
            ext = os.path.splitext(path)[1].lower()
            if not ext:
                ext = "(no extension)"
            
            if ext in file_types:
                file_types[ext] += 1
            else:
                file_types[ext] = 1
        
        return file_types
    
    @staticmethod
    def categorize_files(file_paths: List[str]) -> Dict[str, List[str]]:
        """
        Categorize files by type
        
        Args:
            file_paths: List of file paths
        
        Returns:
            Dictionary mapping categories to lists of file paths
        """
        categories = {
            "c_cpp": [],
            "web": [],
            "config": [],
            "other": []
        }
        
        for path in file_paths:
            ext = os.path.splitext(path)[1].lower()
            
            if ext in ['.c', '.cpp', '.cc', '.h', '.hpp']:
                categories["c_cpp"].append(path)
            elif ext in ['.js', '.html', '.css', '.php', '.ts']:
                categories["web"].append(path)
            elif ext in ['.json', '.yaml', '.yml', '.xml', '.conf', '.config']:
                categories["config"].append(path)
            else:
                categories["other"].append(path)
        
        return categories