import asyncio
import logging
import shlex
import subprocess
from typing import Dict, List, Optional, Tuple, Union

from app.core.errors import AppException

logger = logging.getLogger(__name__)

class CommandResult:
    """Class to hold command execution results"""
    
    def __init__(
        self, 
        returncode: int, 
        stdout: str, 
        stderr: str, 
        command: str
    ):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        self.command = command
    
    @property
    def successful(self) -> bool:
        """Check if command executed successfully"""
        return self.returncode == 0
    
    def __str__(self) -> str:
        return f"Command: {self.command}, Return code: {self.returncode}"

async def run_command_async(
    command: Union[str, List[str]],
    shell: bool = False,
    cwd: Optional[str] = None,
    env: Optional[Dict[str, str]] = None,
    timeout: Optional[float] = 300,
) -> CommandResult:
    """
    Run a shell command asynchronously and return the result
    
    Args:
        command: Command to run (string or list of arguments)
        shell: Whether to run in shell mode
        cwd: Working directory
        env: Environment variables
        timeout: Command timeout in seconds
    
    Returns:
        CommandResult object with execution results
    
    Raises:
        AppException: If command execution fails
    """
    # Format command for logging and result
    cmd_str = command if isinstance(command, str) else " ".join(command)
    
    try:
        # Prepare command as list if it's a string and shell=False
        if isinstance(command, str) and not shell:
            command = shlex.split(command)
        
        logger.debug(f"Running command: {cmd_str}")
        
        # Execute the command
        process = await asyncio.create_subprocess_exec(
            *command if isinstance(command, list) else command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=shell,
            cwd=cwd,
            env=env,
        )
        
        try:
            # Wait for command to complete with timeout
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=timeout
            )
        except asyncio.TimeoutError:
            # Kill the process if it times out
            try:
                process.kill()
            except Exception:
                pass
            
            logger.error(f"Command timed out after {timeout} seconds: {cmd_str}")
            raise AppException(
                status_code=504,
                message=f"Command timed out after {timeout} seconds",
                details={"command": cmd_str}
            )
        
        # Decode output
        stdout_str = stdout.decode("utf-8", errors="replace")
        stderr_str = stderr.decode("utf-8", errors="replace")
        
        # Log results
        if process.returncode != 0:
            logger.warning(
                f"Command exited with code {process.returncode}: {cmd_str}"
            )
            logger.debug(f"STDERR: {stderr_str}")
        else:
            logger.debug(f"Command completed successfully: {cmd_str}")
        
        return CommandResult(
            returncode=process.returncode,
            stdout=stdout_str,
            stderr=stderr_str,
            command=cmd_str,
        )
        
    except Exception as e:
        logger.error(f"Error executing command {cmd_str}: {str(e)}")
        raise AppException(
            status_code=500,
            message=f"Error executing command: {str(e)}",
            details={"command": cmd_str}
        )

def run_command_sync(
    command: Union[str, List[str]],
    shell: bool = False,
    cwd: Optional[str] = None,
    env: Optional[Dict[str, str]] = None,
    timeout: Optional[float] = 300,
) -> CommandResult:
    """
    Run a shell command synchronously and return the result
    
    Args:
        command: Command to run (string or list of arguments)
        shell: Whether to run in shell mode
        cwd: Working directory
        env: Environment variables
        timeout: Command timeout in seconds
    
    Returns:
        CommandResult object with execution results
    
    Raises:
        AppException: If command execution fails
    """
    # Format command for logging and result
    cmd_str = command if isinstance(command, str) else " ".join(command)
    
    try:
        # Prepare command as list if it's a string and shell=False
        if isinstance(command, str) and not shell:
            command = shlex.split(command)
        
        logger.debug(f"Running command synchronously: {cmd_str}")
        
        # Execute the command
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=shell,
            cwd=cwd,
            env=env,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        
        try:
            # Wait for command to complete with timeout
            stdout, stderr = process.communicate(timeout=timeout)
        except subprocess.TimeoutExpired:
            # Kill the process if it times out
            process.kill()
            stdout, stderr = process.communicate()
            
            logger.error(f"Command timed out after {timeout} seconds: {cmd_str}")
            raise AppException(
                status_code=504,
                message=f"Command timed out after {timeout} seconds",
                details={"command": cmd_str}
            )
        
        # Log results
        if process.returncode != 0:
            logger.warning(
                f"Command exited with code {process.returncode}: {cmd_str}"
            )
            logger.debug(f"STDERR: {stderr}")
        else:
            logger.debug(f"Command completed successfully: {cmd_str}")
        
        return CommandResult(
            returncode=process.returncode,
            stdout=stdout,
            stderr=stderr,
            command=cmd_str,
        )
        
    except Exception as e:
        logger.error(f"Error executing command {cmd_str}: {str(e)}")
        raise AppException(
            status_code=500,
            message=f"Error executing command: {str(e)}",
            details={"command": cmd_str}
        )