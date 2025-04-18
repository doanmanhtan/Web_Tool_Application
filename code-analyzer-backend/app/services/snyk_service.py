import os
import json
import logging
import tempfile
import shutil
from typing import Dict, List, Any, Optional

from app.core.config import settings
from app.core.errors import SnykException
from app.utils.command_executor import run_command_async
from app.utils.result_formatter import format_snyk_results

logger = logging.getLogger(__name__)

class SnykService:
    """Service for Snyk operations"""
    
    @staticmethod
    async def analyze_files(file_paths: List[str], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze files using Snyk
        
        Args:
            file_paths: List of file paths to analyze
            config: Snyk configuration
        
        Returns:
            Analysis results
        
        Raises:
            SnykException: If analysis fails
        """
        if not file_paths:
            logger.warning("No files provided for Snyk analysis")
            return {"vulnerabilities": [], "stats": {"total_vulnerabilities": 0, "files_analyzed": 0}}
        
        try:
            # Extract configuration
            snyk_path = config.get("path", settings.SNYK_PATH)
            options = config.get("options", {})
            
            # Create a temporary directory to copy files for analysis
            temp_dir = tempfile.mkdtemp()
            
            try:
                # Copy files to temp directory
                for file_path in file_paths:
                    if os.path.isfile(file_path):
                        filename = os.path.basename(file_path)
                        dest_path = os.path.join(temp_dir, filename)
                        shutil.copy2(file_path, dest_path)
                
                # Build command
                command = [
                    "snyk",
                    "test",
                    "--json",
                    "--all-projects"
                ]
                
                # Add severity filter if specified
                if options and "severity" in options:
                    severity = options.get("severity", "medium").lower()
                    command.extend(["--severity-threshold", severity])
                
                # Add API key if available
                api_key = settings.SNYK_CONFIG.get("api_key")
                env = os.environ.copy()
                if api_key:
                    env["SNYK_API_TOKEN"] = api_key
                
                # Run Snyk in the temporary directory
                result = await run_command_async(
                    command,
                    cwd=temp_dir,
                    env=env,
                    timeout=settings.SNYK_CONFIG["timeout"]
                )
                
                # Snyk returns non-zero if it finds vulnerabilities, which is expected
                stdout = result.stdout if result.stdout else "{}"
                
                # Format results
                formatted_results = format_snyk_results(stdout, file_paths)
                
                return formatted_results
            
            finally:
                # Clean up temp directory
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
        
        except Exception as e:
            logger.error(f"Error during Snyk analysis: {str(e)}")
            raise SnykException(
                message=f"Error during Snyk analysis: {str(e)}"
            )
    
    @staticmethod
    async def check_availability() -> bool:
        """
        Check if Snyk is available
        
        Returns:
            True if Snyk is available, False otherwise
        """
        try:
            result = await run_command_async(["snyk", "--version"], timeout=10)
            return result.returncode == 0
        except Exception as e:
            logger.warning(f"Snyk is not available: {str(e)}")
            return False