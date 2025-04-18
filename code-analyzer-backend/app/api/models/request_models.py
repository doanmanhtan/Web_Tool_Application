from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Any, Union

# Common models
class BaseRequest(BaseModel):
    """Base model for all requests"""
    pass

# Semgrep models
class SemgrepRuleRequest(BaseModel):
    """Request model for getting Semgrep rules"""
    path: Optional[str] = Field(
        default=None,
        description="Path to the rules directory"
    )

class SemgrepRuleContentRequest(BaseModel):
    """Request model for getting Semgrep rule content"""
    rule_path: str = Field(
        ...,
        description="Path to the specific rule file"
    )

class SemgrepConfigRequest(BaseModel):
    """Request model for Semgrep configuration"""
    rules_path: str = Field(
        ...,
        description="Path to the rules directory"
    )
    selected_rules: List[str] = Field(
        default=[],
        description="List of selected rule IDs"
    )

class SemgrepAnalyzeRequest(BaseModel):
    """Request model for Semgrep analysis"""
    config: SemgrepConfigRequest = Field(
        ...,
        description="Semgrep configuration"
    )
    
    @validator('config')
    def validate_selected_rules(cls, v):
        if not v.selected_rules:
            raise ValueError("At least one rule must be selected")
        return v

# Snyk models
class SnykOptions(BaseModel):
    """Options for Snyk configuration"""
    scan_dependencies: bool = Field(
        default=True,
        description="Whether to scan dependencies"
    )
    scan_code: bool = Field(
        default=True,
        description="Whether to scan code"
    )
    severity: str = Field(
        default="medium",
        description="Minimum severity level to report"
    )

    @validator('severity')
    def validate_severity(cls, v):
        valid_severities = {"critical", "high", "medium", "low"}
        if v not in valid_severities:
            raise ValueError(f"Severity must be one of {valid_severities}")
        return v

class SnykConfigRequest(BaseModel):
    """Request model for Snyk configuration"""
    path: str = Field(
        ...,
        description="Path to Snyk directory"
    )
    options: Optional[SnykOptions] = Field(
        default=None,
        description="Snyk options"
    )

class SnykAnalyzeRequest(BaseModel):
    """Request model for Snyk analysis"""
    config: SnykConfigRequest = Field(
        ...,
        description="Snyk configuration"
    )

# ClangTidy models
class ClangTidyOptions(BaseModel):
    """Options for ClangTidy configuration"""
    command_args: Optional[str] = Field(
        default=None,
        description="Additional command line arguments"
    )
    compiler_options: Optional[str] = Field(
        default=None,
        description="Compiler options to use during analysis"
    )

class ClangTidyConfigRequest(BaseModel):
    """Request model for ClangTidy configuration"""
    checks: List[str] = Field(
        default=[],
        description="List of selected check IDs"
    )
    options: Optional[ClangTidyOptions] = Field(
        default=None,
        description="ClangTidy options"
    )
    
    @validator('checks')
    def validate_checks(cls, v):
        if not v:
            raise ValueError("At least one check must be selected")
        return v

class ClangTidyAnalyzeRequest(BaseModel):
    """Request model for ClangTidy analysis"""
    config: ClangTidyConfigRequest = Field(
        ...,
        description="ClangTidy configuration"
    )