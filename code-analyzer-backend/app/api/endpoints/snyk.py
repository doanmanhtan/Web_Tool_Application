from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, Body
from typing import List, Dict, Any, Optional

from app.api.models.request_models import SnykConfigRequest, SnykAnalyzeRequest
from app.api.models.response_models import SnykAnalysisResponse, BaseResponse
from app.services.snyk_service import SnykService
from app.services.file_service import FileService
from app.core.errors import SnykException, FileException

router = APIRouter()

@router.post("/config", response_model=BaseResponse)
async def update_config(
    config: SnykConfigRequest = Body(...)
):
    """
    Update Snyk configuration
    """
    try:
        # Validate Snyk path exists
        if not await SnykService.check_availability():
            raise HTTPException(
                status_code=400,
                detail={"message": "Snyk is not available. Please ensure it is installed correctly."}
            )
        
        return {
            "success": True,
            "message": "Snyk configuration updated successfully",
            "data": {
                "path": config.path,
                "options": config.options.dict() if config.options else {}
            }
        }
    
    except SnykException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error updating configuration: {str(e)}"}
        )

@router.post("/analyze", response_model=SnykAnalysisResponse)
async def analyze_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    request: SnykAnalyzeRequest = Depends()
):
    """
    Analyze files using Snyk
    """
    saved_paths = []
    temp_dir = None
    
    try:
        # Check if Snyk is available
        if not await SnykService.check_availability():
            raise HTTPException(
                status_code=400,
                detail={"message": "Snyk is not available. Please ensure it is installed correctly."}
            )
        
        # Save uploaded files
        saved_paths, temp_dir = await FileService.save_uploaded_files(files)
        
        # Run analysis
        results = await SnykService.analyze_files(saved_paths, request.config.dict())
        
        # Schedule cleanup
        background_tasks.add_task(
            FileService.cleanup_analysis_files,
            saved_paths,
            temp_dir
        )
        
        return {
            "success": True,
            "message": f"Analysis completed with {results['stats']['total_vulnerabilities']} vulnerabilities",
            "vulnerabilities": results["vulnerabilities"],
            "stats": results["stats"]
        }
    
    except (SnykException, FileException) as e:
        # Clean up files on error
        if saved_paths or temp_dir:
            FileService.cleanup_analysis_files(saved_paths, temp_dir)
        
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except HTTPException as e:
        # Clean up files on error
        if saved_paths or temp_dir:
            FileService.cleanup_analysis_files(saved_paths, temp_dir)
        
        raise e
    
    except Exception as e:
        # Clean up files on error
        if saved_paths or temp_dir:
            FileService.cleanup_analysis_files(saved_paths, temp_dir)
        
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error running analysis: {str(e)}"}
        )