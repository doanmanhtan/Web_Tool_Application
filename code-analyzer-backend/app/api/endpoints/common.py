from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional

from app.api.models.response_models import HealthCheckResponse, BaseResponse
from app.services.semgrep_service import SemgrepService
from app.services.snyk_service import SnykService
from app.services.clangtidy_service import ClangTidyService
from app.services.file_service import FileService
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint to verify API and tools availability
    """
    # Check tools availability
    semgrep_available = True  # We assume Semgrep is available by default
    snyk_available = await SnykService.check_availability()
    clangtidy_available = await ClangTidyService.check_availability()
    
    return {
        "success": True,
        "message": "API is healthy",
        "version": "1.0.0",
        "status": "healthy",
        "tools": {
            "semgrep": semgrep_available,
            "snyk": snyk_available,
            "clangtidy": clangtidy_available
        }
    }

@router.post("/upload", response_model=BaseResponse)
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """
    Upload files for analysis
    
    This is a utility endpoint to test file uploading.
    For actual analysis, use the specific tool endpoints.
    """
    try:
        # Save uploaded files
        saved_paths, temp_dir = await FileService.save_uploaded_files(files)
        
        # Get file types
        file_types = FileService.get_file_types(saved_paths)
        
        # Schedule cleanup
        background_tasks.add_task(
            FileService.cleanup_analysis_files,
            saved_paths,
            temp_dir
        )
        
        return {
            "success": True,
            "message": f"Successfully uploaded {len(saved_paths)} files",
            "data": {
                "file_count": len(saved_paths),
                "file_types": file_types
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading files: {str(e)}"
        )