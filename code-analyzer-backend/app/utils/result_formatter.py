import json
import logging
import os
import re
from typing import Dict, List, Any, Optional, Union
import uuid

from app.core.errors import AppException

logger = logging.getLogger(__name__)

def format_semgrep_results(raw_output: str, files_analyzed: List[str]) -> Dict[str, Any]:
    """
    Format Semgrep results into a standardized format
    
    Args:
        raw_output: Raw JSON output from Semgrep
        files_analyzed: List of files that were analyzed
    
    Returns:
        Dictionary containing formatted results
    
    Raises:
        AppException: If results cannot be parsed
    """
    try:
        # Parse JSON output
        results = json.loads(raw_output)
        
        # Initialize formatted result
        formatted_results = {
            "findings": [],
            "stats": {
                "total_findings": 0,
                "files_with_findings": 0,
                "files_analyzed": len(files_analyzed),
                "by_severity": {
                    "ERROR": 0,
                    "WARNING": 0,
                    "INFO": 0
                }
            }
        }
        
        if "results" not in results:
            logger.warning("No 'results' key found in Semgrep output")
            return formatted_results
        
        # Files with findings
        files_with_findings = set()
        
        # Process findings
        for finding in results["results"]:
            severity = finding.get("severity", "INFO").upper()
            
            # Map Semgrep severities to standardized severities
            if severity == "ERROR":
                standardized_severity = "ERROR"
            elif severity == "WARNING":
                standardized_severity = "WARNING"
            else:
                standardized_severity = "INFO"
            
            # Generate a unique ID for the finding
            finding_id = str(uuid.uuid4())
            
            # Extract file path and make it relative if possible
            path = finding.get("path", "unknown")
            
            # Extract line number
            line = finding.get("start", {}).get("line", 0)
            
            # Format the finding
            formatted_finding = {
                "id": finding_id,
                "rule": finding.get("check_id", "unknown"),
                "severity": standardized_severity,
                "message": finding.get("extra", {}).get("message", "No message provided"),
                "file": path,
                "line": line,
                "column": finding.get("start", {}).get("col", 0),
                "code": finding.get("extra", {}).get("lines", "")
            }
            
            formatted_results["findings"].append(formatted_finding)
            
            # Update statistics
            formatted_results["stats"]["total_findings"] += 1
            formatted_results["stats"]["by_severity"][standardized_severity] += 1
            files_with_findings.add(path)
        
        # Update files with findings count
        formatted_results["stats"]["files_with_findings"] = len(files_with_findings)
        
        return formatted_results
        
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing Semgrep JSON output: {str(e)}")
        raise AppException(
            status_code=500,
            message="Error parsing Semgrep results",
            details={"error": str(e)}
        )
    except Exception as e:
        logger.error(f"Error formatting Semgrep results: {str(e)}")
        raise AppException(
            status_code=500,
            message="Error formatting Semgrep results",
            details={"error": str(e)}
        )

def format_snyk_results(raw_output: str, files_analyzed: List[str]) -> Dict[str, Any]:
    """
    Format Snyk results into a standardized format
    
    Args:
        raw_output: Raw JSON output from Snyk
        files_analyzed: List of files that were analyzed
    
    Returns:
        Dictionary containing formatted results
    
    Raises:
        AppException: If results cannot be parsed
    """
    try:
        # Parse JSON output
        results = json.loads(raw_output)
        
        # Initialize formatted result
        formatted_results = {
            "vulnerabilities": [],
            "stats": {
                "total_vulnerabilities": 0,
                "files_with_vulnerabilities": 0,
                "files_analyzed": len(files_analyzed),
                "by_severity": {
                    "CRITICAL": 0,
                    "HIGH": 0,
                    "MEDIUM": 0,
                    "LOW": 0
                }
            }
        }
        
        # Process Snyk vulnerabilities
        vulnerabilities = results.get("vulnerabilities", [])
        if not vulnerabilities:
            logger.info("No vulnerabilities found in Snyk output")
            return formatted_results
        
        # Files with vulnerabilities
        files_with_vulns = set()
        
        # Process each vulnerability
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "").upper()
            
            # Map to standardized severities
            if severity not in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
                severity = "LOW"
            
            # Generate a unique ID for the vulnerability
            vuln_id = str(uuid.uuid4())
            
            # Get package information
            package_name = vuln.get("packageName", "unknown")
            file_path = vuln.get("from", ["unknown"])[0] if vuln.get("from") else "unknown"
            
            # Format the vulnerability
            formatted_vuln = {
                "id": vuln_id,
                "vulnerability": vuln.get("id", "unknown"),
                "severity": severity,
                "description": vuln.get("title", "No description provided"),
                "file": file_path,
                "package": package_name,
                "version": vuln.get("version", "unknown"),
                "fixed_in": vuln.get("fixedIn", [None])[0]
            }
            
            formatted_results["vulnerabilities"].append(formatted_vuln)
            
            # Update statistics
            formatted_results["stats"]["total_vulnerabilities"] += 1
            formatted_results["stats"]["by_severity"][severity] += 1
            files_with_vulns.add(file_path)
        
        # Update files with vulnerabilities count
        formatted_results["stats"]["files_with_vulnerabilities"] = len(files_with_vulns)
        
        return formatted_results
        
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing Snyk JSON output: {str(e)}")
        raise AppException(
            status_code=500,
            message="Error parsing Snyk results",
            details={"error": str(e)}
        )
    except Exception as e:
        logger.error(f"Error formatting Snyk results: {str(e)}")
        raise AppException(
            status_code=500,
            message="Error formatting Snyk results",
            details={"error": str(e)}
        )

def format_clangtidy_results(raw_output: str, files_analyzed: List[str]) -> Dict[str, Any]:
    """
    Format ClangTidy results into a standardized format
    
    Args:
        raw_output: Raw output from ClangTidy
        files_analyzed: List of files that were analyzed
    
    Returns:
        Dictionary containing formatted results
    
    Raises:
        AppException: If results cannot be parsed
    """
    try:
        # Initialize formatted result
        formatted_results = {
            "issues": [],
            "stats": {
                "total_issues": 0,
                "files_with_issues": 0,
                "files_analyzed": len(files_analyzed),
                "by_severity": {
                    "ERROR": 0,
                    "WARNING": 0,
                    "INFO": 0
                }
            }
        }
        
        # Files with issues
        files_with_issues = set()
        
        # Regular expression to match ClangTidy output lines
        # Format: <file>:<line>:<column>: <severity>: <message> [<check-name>]
        pattern = r'([\w\./\\-]+):(\d+):(\d+): (warning|error|note): (.*?) \[([\w\.-]+)\]'
        
        # Find all matches in the output
        matches = re.findall(pattern, raw_output)
        
        for match in matches:
            file_path, line, column, severity_str, message, check = match
            
            # Convert severity
            if severity_str == 'error':
                severity = 'ERROR'
            elif severity_str == 'warning':
                severity = 'WARNING'
            else:
                severity = 'INFO'
            
            # Generate a unique ID for the issue
            issue_id = str(uuid.uuid4())
            
            # Format the issue
            formatted_issue = {
                "id": issue_id,
                "check": check,
                "severity": severity,
                "message": message,
                "file": file_path,
                "line": int(line),
                "column": int(column),
                "code": ""  # ClangTidy doesn't provide a code snippet in output
            }
            
            formatted_results["issues"].append(formatted_issue)
            
            # Update statistics
            formatted_results["stats"]["total_issues"] += 1
            formatted_results["stats"]["by_severity"][severity] += 1
            files_with_issues.add(file_path)
        
        # Update files with issues count
        formatted_results["stats"]["files_with_issues"] = len(files_with_issues)
        
        return formatted_results
        
    except Exception as e:
        logger.error(f"Error formatting ClangTidy results: {str(e)}")
        raise AppException(
            status_code=500,
            message="Error formatting ClangTidy results",
            details={"error": str(e)}
        )