from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, Body
from typing import List, Dict, Any, Optional

from app.api.models.request_models import SemgrepRuleRequest, SemgrepRuleContentRequest, SemgrepConfigRequest, SemgrepAnalyzeRequest
from app.api.models.response_models import SemgrepRulesResponse, SemgrepRuleContentResponse, SemgrepAnalysisResponse, BaseResponse
from app.services.semgrep_service import SemgrepService
from app.services.file_service import FileService
from app.core.errors import SemgrepException, FileException

router = APIRouter()

@router.get("/rules", response_model=SemgrepRulesResponse)
async def list_rules(
    request: SemgrepRuleRequest = Depends()
):
    """
    List available Semgrep rules
    """
    try:
        rules = await SemgrepService.list_rules(request.path)
        
        return {
            "success": True,
            "message": f"Found {len(rules)} rules",
            "rules": rules
        }
    
    except SemgrepException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error listing rules: {str(e)}"}
        )

@router.get("/rules/content", response_model=SemgrepRuleContentResponse)
async def get_rule_content(
    request: SemgrepRuleContentRequest = Depends()
):
    """
    Get content of a specific Semgrep rule
    """
    try:
        rule_data = await SemgrepService.get_rule_content(request.rule_path)
        
        return {
            "success": True,
            "message": "Rule content retrieved successfully",
            "content": rule_data["content"],
            "rule": rule_data["metadata"]["rules"][0] if rule_data["metadata"]["rules"] else {}
        }
    
    except SemgrepException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error getting rule content: {str(e)}"}
        )

@router.post("/config", response_model=BaseResponse)
async def update_config(
    config: SemgrepConfigRequest = Body(...)
):
    """
    Update Semgrep configuration
    """
    try:
        # Validate rules path
        await SemgrepService.list_rules(config.rules_path)
        
        return {
            "success": True,
            "message": "Semgrep configuration updated successfully",
            "data": {
                "rules_path": config.rules_path,
                "selected_rules": config.selected_rules
            }
        }
    
    except SemgrepException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error updating configuration: {str(e)}"}
        )

@router.post("/analyze", response_model=SemgrepAnalysisResponse)
async def analyze_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    request: SemgrepAnalyzeRequest = Depends()
):
    """
    Analyze files using Semgrep
    """
    saved_paths = []
    temp_dir = None
    
    try:
        # Save uploaded files
        saved_paths, temp_dir = await FileService.save_uploaded_files(files)
        
        # Run analysis
        results = await SemgrepService.analyze_files(saved_paths, request.config.dict())
        
        # Schedule cleanup
        background_tasks.add_task(
            FileService.cleanup_analysis_files,
            saved_paths,
            temp_dir
        )
        
        return {
            "success": True,
            "message": f"Analysis completed with {results['stats']['total_findings']} findings",
            "findings": results["findings"],
            "stats": results["stats"]
        }
    
    except (SemgrepException, FileException) as e:
        # Clean up files on error
        if saved_paths or temp_dir:
            FileService.cleanup_analysis_files(saved_paths, temp_dir)
        
        raise HTTPException(
            status_code=e.status_code,
            detail={"message": e.message, "details": e.details}
        )
    
    except Exception as e:
        # Clean up files on error
        if saved_paths or temp_dir:
            FileService.cleanup_analysis_files(saved_paths, temp_dir)
        
        raise HTTPException(
            status_code=500,
            detail={"message": f"Error running analysis: {str(e)}"}
        )