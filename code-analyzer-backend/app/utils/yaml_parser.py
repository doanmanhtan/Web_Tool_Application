import os
import yaml
import logging
from typing import Dict, List, Any, Optional, Union
import re

from app.core.errors import FileException
from app.utils.file_utils import read_file, write_file

logger = logging.getLogger(__name__)

def parse_yaml_string(content: str) -> Dict[str, Any]:
    """
    Parse a YAML string into a Python dictionary
    
    Args:
        content: YAML content as a string
    
    Returns:
        Parsed YAML as a dictionary
    
    Raises:
        FileException: If YAML cannot be parsed
    """
    try:
        return yaml.safe_load(content)
    except Exception as e:
        logger.error(f"Error parsing YAML content: {str(e)}")
        raise FileException(
            message=f"Could not parse YAML content: {str(e)}",
        )

def parse_yaml_file(file_path: str) -> Dict[str, Any]:
    """
    Parse a YAML file into a Python dictionary
    
    Args:
        file_path: Path to the YAML file
    
    Returns:
        Parsed YAML as a dictionary
    
    Raises:
        FileException: If file cannot be read or YAML cannot be parsed
    """
    try:
        content = read_file(file_path)
        return parse_yaml_string(content)
    except FileException as e:
        raise e
    except Exception as e:
        logger.error(f"Error parsing YAML file {file_path}: {str(e)}")
        raise FileException(
            message=f"Could not parse YAML file: {str(e)}",
            details={"file_path": file_path}
        )

def parse_semgrep_rule_file(file_path: str) -> Dict[str, Any]:
    """
    Parse a Semgrep rule file and extract rule metadata
    
    Args:
        file_path: Path to the Semgrep rule file
    
    Returns:
        Dictionary containing rule metadata
    
    Raises:
        FileException: If file cannot be read or rule is invalid
    """
    try:
        rule_data = parse_yaml_file(file_path)
        
        # Check if this is a valid rule file
        if not isinstance(rule_data, dict) or 'rules' not in rule_data:
            raise ValueError("Not a valid Semgrep rule file (missing 'rules' key)")
        
        # Extract rules
        rules = rule_data.get('rules', [])
        if not rules or not isinstance(rules, list):
            raise ValueError("No rules found in rule file or 'rules' is not a list")
        
        # Enhance rule data with file info and validate required fields
        file_name = os.path.basename(file_path)
        result = {
            "file_path": file_path,
            "file_name": file_name,
            "rules": []
        }
        
        for rule in rules:
            if not isinstance(rule, dict):
                logger.warning(f"Invalid rule format in {file_path}: {rule}")
                continue
            
            # Check required fields
            if 'id' not in rule:
                logger.warning(f"Rule missing required 'id' field in {file_path}")
                continue
            
            # Add rule to result
            result["rules"].append(rule)
        
        return result
    
    except ValueError as e:
        logger.warning(f"Invalid Semgrep rule file {file_path}: {str(e)}")
        raise FileException(
            message=f"Invalid Semgrep rule file: {str(e)}",
            details={"file_path": file_path}
        )
    except Exception as e:
        logger.error(f"Error parsing Semgrep rule file {file_path}: {str(e)}")
        raise FileException(
            message=f"Could not parse Semgrep rule file: {str(e)}",
            details={"file_path": file_path}
        )

def extract_semgrep_rule_metadata(rule_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract metadata from a Semgrep rule
    
    Args:
        rule_data: Parsed Semgrep rule data
    
    Returns:
        Dictionary containing rule metadata
    """
    result = {
        "file_path": rule_data.get("file_path", ""),
        "file_name": rule_data.get("file_name", ""),
        "rules": []
    }
    
    for rule in rule_data.get("rules", []):
        rule_meta = {
            "id": rule.get("id", "unknown"),
            "name": rule.get("id", "unknown"),  # Use ID as name if name is not present
            "description": rule.get("message", ""),
            "severity": rule.get("severity", "INFO")
        }
        
        # Try to use a better name than the ID if available
        if "metadata" in rule and isinstance(rule["metadata"], dict):
            if "name" in rule["metadata"]:
                rule_meta["name"] = rule["metadata"]["name"]
        
        result["rules"].append(rule_meta)
    
    return result

def generate_semgrep_config(rule_ids: List[str], rules_path: str) -> Dict[str, Any]:
    """
    Generate a Semgrep configuration file content for selected rules
    
    Args:
        rule_ids: List of rule IDs to include
        rules_path: Path to the rules directory
    
    Returns:
        Dictionary containing Semgrep configuration
    """
    config = {
        "rules": [],
        "includes": [],
        "excludes": []
    }
    
    # Add rule IDs
    for rule_id in rule_ids:
        config["rules"].append(rule_id)
    
    return config

def serialize_yaml(data: Dict[str, Any]) -> str:
    """
    Serialize a Python dictionary to a YAML string
    
    Args:
        data: Dictionary to serialize
    
    Returns:
        YAML string
    
    Raises:
        FileException: If data cannot be serialized
    """
    try:
        return yaml.safe_dump(data, sort_keys=False)
    except Exception as e:
        logger.error(f"Error serializing data to YAML: {str(e)}")
        raise FileException(
            message=f"Could not serialize data to YAML: {str(e)}",
        )