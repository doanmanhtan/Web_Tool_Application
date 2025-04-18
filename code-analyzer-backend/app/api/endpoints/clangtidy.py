from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, Body
from typing import List, Dict, Any, Optional

from app.api.models.request_models import ClangTidyConfigRequest, ClangTidyAnalyzeRequest
from app.api.models.response_models import ClangTidyChecksResponse, ClangTidyAnalysisResponse, BaseResponse
from app.services.clangtidy_service import ClangTidyService
from app.services.file_service import FileService
from app.core.errors import ClangTidyException, FileException

router = APIRouter()

@router.get("/checks", response_model=ClangTidyChecksResponse)
async def list_checks():
    """
    List available ClangTidy checks
    """
    try:
        # Check if ClangTidy is available
        if not await ClangTidyService.check_availability():
            raise HTTPException(
                status_code=400,
                detail={"message": "ClangTidy is not available. Please ensure it is installed correctly."}
            )
        
        checks = await ClangTidyService.list_checks()
        
        return {
            "success": True,
            "message": f"Found {len(checks)} checks",
            "checks": checks
        }
    
    except ClangTidyException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except HTTPException as e:
        raise e
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error listing checks: {str(e)}"}
        )

@router.post("/config", response_model=BaseResponse)
async def update_config(
    config: ClangTidyConfigRequest = Body(...)
):
    """
    Update ClangTidy configuration
    """
    try:
        # Check if ClangTidy is available
        if not await ClangTidyService.check_availability():
            raise HTTPException(
                status_code=400,
                detail={"message": "ClangTidy is not available. Please ensure it is installed correctly."}
            )
        
        return {
            "success": True,
            "message": "ClangTidy configuration updated successfully",
            "data": {
                "checks": config.checks,
                "options": config.options.dict() if config.options else {}
            }
        }
    
    except ClangTidyException as e:
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

@router.post("/analyze", response_model=ClangTidyAnalysisResponse)
async def analyze_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    request: ClangTidyAnalyzeRequest = Depends()
):
    """
    Analyze files using ClangTidy
    """
    saved_paths = []
    temp_dir = None
    
    try:
        # Check if ClangTidy is available
        if not await ClangTidyService.check_availability():
            raise HTTPException(
                status_code=400,
                detail={"message": "ClangTidy is not available. Please ensure it is installed correctly."}
            )
        
        # Save uploaded files
        saved_paths, temp_dir = await FileService.save_uploaded_files(files)
        
        # Run analysis
        results = await ClangTidyService.analyze_files(saved_paths, request.config.dict())
        
        # Schedule cleanup
        background_tasks.add_task(
            FileService.cleanup_analysis_files,
            saved_paths,
            temp_dir
        )
        
        return {
            "success": True,
            "message": f"Analysis completed with {results['stats']['total_issues']} issues",
            "issues": results["issues"],
            "stats": results["stats"]
        }
    
    except (ClangTidyException, FileException) as e:
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