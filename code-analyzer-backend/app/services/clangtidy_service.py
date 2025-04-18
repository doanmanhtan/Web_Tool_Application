import os
import json
import logging
import tempfile
import re
from typing import Dict, List, Any, Optional, Set

from app.core.config import settings
from app.core.errors import ClangTidyException
from app.utils.command_executor import run_command_async
from app.utils.result_formatter import format_clangtidy_results

logger = logging.getLogger(__name__)

class ClangTidyService:
    """Service for ClangTidy operations"""
    
    @staticmethod
    async def list_checks() -> List[Dict[str, Any]]:
        """
        List available ClangTidy checks
        
        Returns:
            List of check metadata
        
        Raises:
            ClangTidyException: If checks cannot be listed
        """
        try:
            # Run clang-tidy to list checks
            result = await run_command_async(
                ["clang-tidy", "--list-checks", "-checks=*"],
                timeout=30
            )
            
            if result.returncode != 0:
                logger.error(f"ClangTidy exited with error code {result.returncode} when listing checks: {result.stderr}")
                raise ClangTidyException(
                    message=f"Failed to list ClangTidy checks",
                    details={"stderr": result.stderr}
                )
            
            # Extract checks from output
            # Output format is like:
            # Enabled checks:
            # abseil-duration-addition
            # abseil-duration-comparison
            # ...
            checks = []
            in_checks_section = False
            
            for line in result.stdout.splitlines():
                line = line.strip()
                
                if line == "Enabled checks:":
                    in_checks_section = True
                    continue
                
                if in_checks_section and line:
                    # Extract check name
                    check_name = line
                    
                    # Create check object
                    check = {
                        "id": check_name,
                        "name": check_name,
                        "description": ClangTidyService._get_check_description(check_name)
                    }
                    
                    checks.append(check)
            
            # Group checks by category
            checks_by_category = {}
            for check in checks:
                # Extract category (part before '-')
                parts = check["id"].split('-', 1)
                if len(parts) > 1:
                    category = parts[0]
                    if category not in checks_by_category:
                        checks_by_category[category] = []
                    checks_by_category[category].append(check)
            
            # Flatten back to list but with category groupings
            categorized_checks = []
            for category, category_checks in checks_by_category.items():
                for check in category_checks:
                    check["category"] = category
                    categorized_checks.append(check)
            
            return categorized_checks
        
        except ClangTidyException as e:
            raise e
        
        except Exception as e:
            logger.error(f"Error listing ClangTidy checks: {str(e)}")
            raise ClangTidyException(
                message=f"Error listing ClangTidy checks: {str(e)}"
            )
    
    @staticmethod
    def _get_check_description(check_name: str) -> str:
        """
        Get a description for a ClangTidy check
        
        This is a helper method that provides descriptions for common checks
        In a production environment, these descriptions would come from ClangTidy docs
        
        Args:
            check_name: Name of the check
        
        Returns:
            Description of the check
        """
        # Map of common check prefixes to descriptions
        check_descriptions = {
            "bugprone": "Checks that target bug-prone code constructs",
            "clang-analyzer": "Clang Static Analyzer checks",
            "cppcoreguidelines": "Checks related to C++ Core Guidelines",
            "modernize": "Checks that modernize code to C++11/14/17",
            "performance": "Checks that target performance-related issues",
            "portability": "Checks that target portability-related issues",
            "readability": "Checks that target readability-related issues",
            "security": "Checks that target security-related issues",
        }
        
        # Try to match the check prefix
        for prefix, description in check_descriptions.items():
            if check_name.startswith(prefix):
                return description
        
        return "ClangTidy check"
    
    @staticmethod
    async def analyze_files(file_paths: List[str], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze files using ClangTidy
        
        Args:
            file_paths: List of file paths to analyze
            config: ClangTidy configuration including selected checks
        
        Returns:
            Analysis results
        
        Raises:
            ClangTidyException: If analysis fails
        """
        if not file_paths:
            logger.warning("No files provided for ClangTidy analysis")
            return {"issues": [], "stats": {"total_issues": 0, "files_analyzed": 0}}
        
        try:
            # Extract configuration
            checks = config.get("checks", [])
            options = config.get("options", {})
            
            if not checks:
                logger.warning("No checks selected for ClangTidy analysis")
                return {"issues": [], "stats": {"total_issues": 0, "files_analyzed": len(file_paths)}}
            
            # Filter only C/C++ files
            cpp_extensions = ['.c', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx']
            cpp_files = [f for f in file_paths if os.path.splitext(f)[1].lower() in cpp_extensions]
            
            if not cpp_files:
                logger.warning("No C/C++ files found for ClangTidy analysis")
                return {"issues": [], "stats": {"total_issues": 0, "files_analyzed": len(file_paths)}}
            
            # Join checks with comma
            checks_arg = ','.join(checks)
            
            # Extract additional arguments
            command_args = options.get("command_args", "")
            compiler_options = options.get("compiler_options", "")
            
            # Create a compilation database if needed
            compile_commands_path = None
            if not os.path.exists("compile_commands.json"):
                fd, compile_commands_path = tempfile.mkstemp(suffix='.json')
                os.close(fd)
                
                # Write a basic compilation database
                with open(compile_commands_path, 'w') as f:
                    compile_commands = []
                    for cpp_file in cpp_files:
                        entry = {
                            "directory": os.path.dirname(os.path.abspath(cpp_file)),
                            "command": f"clang++ -std=c++11 {compiler_options} {os.path.basename(cpp_file)}",
                            "file": cpp_file
                        }
                        compile_commands.append(entry)
                    
                    json.dump(compile_commands, f)
            
            try:
                # Build command for each file
                all_output = ""
                
                for cpp_file in cpp_files:
                    # Build command
                    command = [
                        "clang-tidy",
                        f"-checks={checks_arg}",
                        cpp_file
                    ]
                    
                    # Add compilation database if we created one
                    if compile_commands_path:
                        command.extend(["-p", os.path.dirname(compile_commands_path)])
                    
                    # Add additional arguments if provided
                    if command_args:
                        command.extend(command_args.split())
                    
                    # Run ClangTidy
                    result = await run_command_async(command, timeout=settings.CLANGTIDY_CONFIG["timeout"])
                    
                    # Collect output
                    all_output += result.stdout + "\n"
                
                # Format results
                formatted_results = format_clangtidy_results(all_output, cpp_files)
                
                return formatted_results
            
            finally:
                # Clean up temp file
                if compile_commands_path and os.path.exists(compile_commands_path):
                    os.unlink(compile_commands_path)
        
        except ClangTidyException as e:
            raise e
        
        except Exception as e:
            logger.error(f"Error during ClangTidy analysis: {str(e)}")
            raise ClangTidyException(
                message=f"Error during ClangTidy analysis: {str(e)}"
            )
    
    @staticmethod
    async def check_availability() -> bool:
        """
        Check if ClangTidy is available
        
        Returns:
            True if ClangTidy is available, False otherwise
        """
        try:
            result = await run_command_async(["clang-tidy", "--version"], timeout=10)
            return result.returncode == 0
        except Exception as e:
            logger.warning(f"ClangTidy is not available: {str(e)}")
            return False