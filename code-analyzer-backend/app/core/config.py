import os
from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    # General settings
    PROJECT_NAME: str = "Code Analysis API"
    API_PREFIX: str = "/api"
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "False").lower() in ("true", "1", "t")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "devsecretkey")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # File handling
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp/code-analysis-uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 MB
    
    # Tool paths
    SEMGREP_RULES_PATH: str = os.getenv("SEMGREP_RULES_PATH", "/home/kali/Desktop/Semgrep/semgrep-rules/c/lang/security/")
    SNYK_PATH: str = os.getenv("SNYK_PATH", "/home/kali/Desktop/synk")
    CLANGTIDY_PATH: str = os.getenv("CLANGTIDY_PATH", "clang-tidy")
    
    # Tool configurations
    SEMGREP_CONFIG: Dict[str, Any] = {
        "timeout": 300,  # Semgrep timeout in seconds
        "max_memory": "4G",  # Maximum memory for Semgrep
    }
    
    SNYK_CONFIG: Dict[str, Any] = {
        "api_key": os.getenv("SNYK_API_KEY", ""),
        "timeout": 300,  # Snyk timeout in seconds
    }
    
    CLANGTIDY_CONFIG: Dict[str, Any] = {
        "timeout": 300,  # ClangTidy timeout in seconds
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()