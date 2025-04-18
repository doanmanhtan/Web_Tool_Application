from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Any, Dict, List, Optional, Union

class AppException(Exception):
    """Base exception class for application-specific errors"""
    def __init__(
        self,
        status_code: int,
        message: str,
        details: Optional[Union[Dict[str, Any], List[Any]]] = None,
    ):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(self.message)

# Tool-specific exceptions
class SemgrepException(AppException):
    """Exception raised when Semgrep operations fail"""
    def __init__(
        self,
        message: str = "Semgrep operation failed",
        details: Optional[Union[Dict[str, Any], List[Any]]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ):
        super().__init__(status_code, message, details)

class SnykException(AppException):
    """Exception raised when Snyk operations fail"""
    def __init__(
        self,
        message: str = "Snyk operation failed",
        details: Optional[Union[Dict[str, Any], List[Any]]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ):
        super().__init__(status_code, message, details)

class ClangTidyException(AppException):
    """Exception raised when ClangTidy operations fail"""
    def __init__(
        self,
        message: str = "ClangTidy operation failed",
        details: Optional[Union[Dict[str, Any], List[Any]]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ):
        super().__init__(status_code, message, details)

class FileException(AppException):
    """Exception raised when file operations fail"""
    def __init__(
        self,
        message: str = "File operation failed",
        details: Optional[Union[Dict[str, Any], List[Any]]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ):
        super().__init__(status_code, message, details)

class ConfigException(AppException):
    """Exception raised when configuration operations fail"""
    def __init__(
        self,
        message: str = "Configuration operation failed",
        details: Optional[Union[Dict[str, Any], List[Any]]] = None,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    ):
        super().__init__(status_code, message, details)

# Exception handlers
def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handler for application-specific exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details,
        },
    )

def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handler for HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
        },
    )

def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler for request validation exceptions"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Validation error",
            "details": exc.errors(),
        },
    )

def register_exception_handlers(app: Any) -> None:
    """Register all exception handlers with the FastAPI app"""
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)