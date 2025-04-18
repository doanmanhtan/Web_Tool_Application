import os
import json
import logging
import tempfile
from typing import Dict, List, Any, Optional, Tuple

from app.core.config import settings
from app.core.errors import SemgrepException
from app.utils.command_executor import run_command_async
from app.utils.file_utils import find_files, write_file
from app.utils.yaml_parser import parse_semgrep_rule_file, extract_semgrep_rule_metadata, generate_semgrep_config, serialize_yaml
from app.utils.result_formatter import format_semgrep_results

logger = logging.getLogger(__name__)

class SemgrepService:
    """Service for Semgrep operations"""
    
    @staticmethod
    async def list_rules(rules_path: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List available Semgrep rules
        
        Args:
            rules_path: Path to the rules directory (optional, uses config default if not provided)
        
        Returns:
            List of rule metadata
        
        Raises:
            SemgrepException: If rules cannot be listed
        """
        # Use provided path or default from settings
        rules_dir = rules_path or settings.SEMGREP_RULES_PATH
        
        try:
            # Find all YAML files in the rules directory
            rule_files = find_files(rules_dir, "*.yml") + find_files(rules_dir, "*.yaml")
            
            if not rule_files:
                logger.warning(f"No rule files found in {rules_dir}")
                return []
            
            rules = []
            
            # Parse each rule file
            for rule_file in rule_files:
                try:
                    rule_data = parse_semgrep_rule_file(rule_file)
                    rule_meta = extract_semgrep_rule_metadata(rule_data)
                    
                    # Flatten rules metadata
                    for rule in rule_meta.get("rules", []):
                        rule["path"] = rule_data["file_path"]
                        rules.append(rule)
                
                except Exception as e:
                    logger.warning(f"Error parsing rule file {rule_file}: {str(e)}")
                    continue
            
            return rules
        
        except Exception as e:
            logger.error(f"Error listing Semgrep rules: {str(e)}")
            raise SemgrepException(
                message=f"Error listing Semgrep rules: {str(e)}",
                details={"rules_path": rules_dir}
            )
    
    @staticmethod
    async def get_rule_content(rule_path: str) -> Dict[str, Any]:
        """
        Get the content of a specific Semgrep rule
        
        Args:
            rule_path: Path to the rule file
        
        Returns:
            Dictionary with rule content and metadata
        
        Raises:
            SemgrepException: If rule cannot be read
        """
        try:
            rule_data = parse_semgrep_rule_file(rule_path)
            rule_meta = extract_semgrep_rule_metadata(rule_data)
            
            # Read raw content
            with open(rule_path, 'r', encoding='utf-8') as f:
                raw_content = f.read()
            
            return {
                "content": raw_content,
                "metadata": rule_meta,
                "rules": rule_data.get("rules", [])
            }
        
        except Exception as e:
            logger.error(f"Error reading Semgrep rule {rule_path}: {str(e)}")
            raise SemgrepException(
                message=f"Error reading Semgrep rule: {str(e)}",
                details={"rule_path": rule_path}
            )
    
    @staticmethod
    async def analyze_files(file_paths: List[str], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze files using Semgrep
        
        Args:
            file_paths: List of file paths to analyze
            config: Semgrep configuration including selected rules
        
        Returns:
            Analysis results
        
        Raises:
            SemgrepException: If analysis fails
        """
        if not file_paths:
            logger.warning("No files provided for Semgrep analysis")
            return {"findings": [], "stats": {"total_findings": 0, "files_analyzed": 0}}
        
        try:
            # Extract configuration
            rules_path = config.get("rules_path", settings.SEMGREP_RULES_PATH)
            selected_rules = config.get("selected_rules", [])
            
            if not selected_rules:
                logger.warning("No rules selected for Semgrep analysis")
                return {"findings": [], "stats": {"total_findings": 0, "files_analyzed": len(file_paths)}}
            
            # Create a temporary config file for Semgrep
            semgrep_config = generate_semgrep_config(selected_rules, rules_path)
            config_yaml = serialize_yaml(semgrep_config)
            
            fd, config_path = tempfile.mkstemp(suffix='.yml')
            os.close(fd)
            
            write_file(config_path, config_yaml)
            
            try:
                # Build command
                command = [
                    "semgrep",
                    "--config", config_path,
                    "--json",
                    *file_paths
                ]
                
                # Run Semgrep
                result = await run_command_async(command, timeout=settings.SEMGREP_CONFIG["timeout"])
                
                # Semgrep returns non-zero if it finds issues, which is expected
                if result.returncode != 0 and result.returncode != 1:
                    logger.error(f"Semgrep exited with error code {result.returncode}: {result.stderr}")
                    raise SemgrepException(
                        message=f"Semgrep analysis failed with error code {result.returncode}",
                        details={"stderr": result.stderr}
                    )
                
                # Format results
                formatted_results = format_semgrep_results(result.stdout, file_paths)
                
                return formatted_results
            
            finally:
                # Clean up temp config file
                if os.path.exists(config_path):
                    os.unlink(config_path)
        
        except SemgrepException as e:
            raise e
        
        except Exception as e:
            logger.error(f"Error during Semgrep analysis: {str(e)}")
            raise SemgrepException(
                message=f"Error during Semgrep analysis: {str(e)}"
            )