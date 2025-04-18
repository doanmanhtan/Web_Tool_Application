import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import FileException

# Allowed file extensions for security
ALLOWED_EXTENSIONS = {
    '.c', '.cpp', '.cc', '.h', '.hpp',  # C/C++
    '.py', '.js', '.ts', '.java', '.go',  # Other languages
    '.json', '.yaml', '.yml', '.xml',  # Config files
    '.txt', '.md',  # Text files
}

# Potentially dangerous patterns in files
DANGEROUS_PATTERNS = [
    r'`.*`',  # Command injection attempt
    r'system\s*\(',  # System calls
    r'exec\s*\(',  # Execution calls
    r'eval\s*\(',  # Eval calls
]

def is_file_allowed(filename: str) -> bool:
    """Check if a file is allowed based on its extension"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def is_file_safe(file_content: bytes) -> bool:
    """
    Check if file content appears safe
    This is a basic check and should be enhanced in production
    """
    try:
        content = file_content.decode('utf-8')
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, content):
                return False
        return True
    except UnicodeDecodeError:
        # If it's not a text file, we don't check content
        return True

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save an uploaded file safely and return the path
    """
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Check file extension
    if not is_file_allowed(upload_file.filename):
        raise FileException(
            message="File type not allowed",
            status_code=400,
            details={"filename": upload_file.filename}
        )
    
    # Generate a safe temporary filename
    temp_file = tempfile.NamedTemporaryFile(delete=False, dir=settings.UPLOAD_DIR)
    
    try:
        # Read and check file content
        file_content = await upload_file.read()
        
        # Check file size
        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            os.unlink(temp_file.name)
            raise FileException(
                message="File size exceeds the maximum allowed size",
                status_code=400,
                details={"max_size_mb": settings.MAX_UPLOAD_SIZE / (1024 * 1024)}
            )
        
        # Basic content safety check
        if not is_file_safe(file_content):
            os.unlink(temp_file.name)
            raise FileException(
                message="File content appears unsafe",
                status_code=400
            )
        
        # Write file content
        temp_file.write(file_content)
        temp_file.close()
        
        return temp_file.name
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise FileException(
            message=f"Error saving file: {str(e)}",
            status_code=500
        )

async def save_upload_files(files: List[UploadFile]) -> List[str]:
    """
    Save multiple uploaded files and return their paths
    """
    saved_paths = []
    
    for file in files:
        try:
            path = await save_upload_file(file)
            saved_paths.append(path)
        except Exception as e:
            # Clean up any files that were already saved
            for saved_path in saved_paths:
                if os.path.exists(saved_path):
                    os.unlink(saved_path)
            raise e
    
    return saved_paths

def cleanup_files(file_paths: List[str]) -> None:
    """
    Clean up temporary files
    """
    for path in file_paths:
        try:
            if os.path.exists(path):
                os.unlink(path)
        except Exception:
            pass