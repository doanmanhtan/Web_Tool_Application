import os
import shutil
import tempfile
import logging
from pathlib import Path
from typing import List, Optional, Set, Dict, Any, Union
import glob
import json
import yaml

from app.core.config import settings
from app.core.errors import FileException

logger = logging.getLogger(__name__)

def ensure_directory_exists(directory: str) -> None:
    """
    Ensure a directory exists, create it if it doesn't
    
    Args:
        directory: Directory path to ensure exists
    
    Raises:
        FileException: If directory cannot be created
    """
    try:
        os.makedirs(directory, exist_ok=True)
    except Exception as e:
        logger.error(f"Error creating directory {directory}: {str(e)}")
        raise FileException(
            message=f"Could not create directory: {str(e)}",
            details={"directory": directory}
        )

def create_temp_directory() -> str:
    """
    Create a temporary directory for file operations
    
    Returns:
        Path to the created temporary directory
    
    Raises:
        FileException: If directory cannot be created
    """
    try:
        temp_dir = tempfile.mkdtemp(dir=settings.UPLOAD_DIR)
        logger.debug(f"Created temporary directory: {temp_dir}")
        return temp_dir
    except Exception as e:
        logger.error(f"Error creating temporary directory: {str(e)}")
        raise FileException(
            message=f"Could not create temporary directory: {str(e)}"
        )

def cleanup_directory(directory: str) -> None:
    """
    Clean up a directory and its contents
    
    Args:
        directory: Directory to clean up
    """
    try:
        if os.path.exists(directory):
            shutil.rmtree(directory)
            logger.debug(f"Removed directory: {directory}")
    except Exception as e:
        logger.warning(f"Error cleaning up directory {directory}: {str(e)}")

def read_file(file_path: str) -> str:
    """
    Read a file and return its contents as a string
    
    Args:
        file_path: Path to the file to read
    
    Returns:
        File contents as a string
    
    Raises:
        FileException: If file cannot be read
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        raise FileException(
            message=f"Could not read file: {str(e)}",
            details={"file_path": file_path}
        )

def write_file(file_path: str, content: str) -> None:
    """
    Write content to a file
    
    Args:
        file_path: Path to the file to write
        content: Content to write to the file
    
    Raises:
        FileException: If file cannot be written
    """
    try:
        directory = os.path.dirname(file_path)
        if directory:
            ensure_directory_exists(directory)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        logger.error(f"Error writing to file {file_path}: {str(e)}")
        raise FileException(
            message=f"Could not write to file: {str(e)}",
            details={"file_path": file_path}
        )

def find_files(directory: str, pattern: str) -> List[str]:
    """
    Find files in a directory matching a pattern
    
    Args:
        directory: Directory to search
        pattern: Glob pattern to match (e.g., "*.py")
    
    Returns:
        List of file paths matching the pattern
    
    Raises:
        FileException: If directory cannot be searched
    """
    try:
        search_pattern = os.path.join(directory, pattern)
        files = glob.glob(search_pattern)
        return sorted(files)
    except Exception as e:
        logger.error(f"Error finding files in {directory} with pattern {pattern}: {str(e)}")
        raise FileException(
            message=f"Could not search directory: {str(e)}",
            details={"directory": directory, "pattern": pattern}
        )

def get_file_extension(file_path: str) -> str:
    """
    Get the extension of a file
    
    Args:
        file_path: Path to the file
    
    Returns:
        File extension (lowercase, including the dot)
    """
    return os.path.splitext(file_path)[1].lower()

def is_binary_file(file_path: str) -> bool:
    """
    Check if a file is binary (non-text)
    
    Args:
        file_path: Path to the file
    
    Returns:
        True if the file is binary, False otherwise
    """
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            return b'\0' in chunk
    except Exception:
        return False

def load_yaml_file(file_path: str) -> Dict[str, Any]:
    """
    Load a YAML file
    
    Args:
        file_path: Path to the YAML file
    
    Returns:
        Parsed YAML content as a dictionary
    
    Raises:
        FileException: If file cannot be parsed or is not valid YAML
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Error loading YAML file {file_path}: {str(e)}")
        raise FileException(
            message=f"Could not parse YAML file: {str(e)}",
            details={"file_path": file_path}
        )

def load_json_file(file_path: str) -> Dict[str, Any]:
    """
    Load a JSON file
    
    Args:
        file_path: Path to the JSON file
    
    Returns:
        Parsed JSON content as a dictionary
    
    Raises:
        FileException: If file cannot be parsed or is not valid JSON
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON file {file_path}: {str(e)}")
        raise FileException(
            message=f"Could not parse JSON file: {str(e)}",
            details={"file_path": file_path}
        )

def get_relative_path(file_path: str, base_path: str) -> str:
    """
    Get the relative path of a file with respect to a base path
    
    Args:
        file_path: Absolute path to the file
        base_path: Base path to make the path relative to
    
    Returns:
        Relative path
    """
    try:
        return os.path.relpath(file_path, base_path)
    except Exception:
        return file_path