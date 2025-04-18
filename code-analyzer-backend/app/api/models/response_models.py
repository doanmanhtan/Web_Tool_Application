from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union

# Base response model
class BaseResponse(BaseModel):
    """Base model for all responses"""
    success: bool = Field(
        default=True,
        description="Whether the operation was successful"
    )
    message: Optional[str] = Field(
        default=None,
        description="Response message"
    )

# Error response model
class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: bool = Field(
        default=True,
        description="Error flag"
    )
    message: str = Field(
        ...,
        description="Error message"
    )
    details: Optional[Any] = Field(
        default=None,
        description="Error details"
    )

# Semgrep models
class SemgrepRule(BaseModel):
    """Model for a Semgrep rule"""
    id: str = Field(
        ...,
        description="Rule ID"
    )
    name: str = Field(
        ...,
        description="Rule name"
    )
    description: Optional[str] = Field(
        default=None,
        description="Rule description"
    )
    path: str = Field(
        ...,
        description="Path to the rule file"
    )

class SemgrepRulesResponse(BaseResponse):
    """Response model for Semgrep rules listing"""
    rules: List[SemgrepRule] = Field(
        default=[],
        description="List of available rules"
    )

class SemgrepRuleContentResponse(BaseResponse):
    """Response model for Semgrep rule content"""
    content: str = Field(
        ...,
        description="Rule content"
    )
    rule: SemgrepRule = Field(
        ...,
        description="Rule metadata"
    )

class SemgrepFinding(BaseModel):
    """Model for a Semgrep finding"""
    id: str = Field(
        ...,
        description="Finding ID"
    )
    rule: str = Field(
        ...,
        description="Rule that triggered the finding"
    )
    severity: str = Field(
        ...,
        description="Finding severity"
    )
    message: str = Field(
        ...,
        description="Finding message"
    )
    file: str = Field(
        ...,
        description="File path"
    )
    line: int = Field(
        ...,
        description="Line number"
    )
    column: Optional[int] = Field(
        default=None,
        description="Column number"
    )
    code: Optional[str] = Field(
        default=None,
        description="Code snippet"
    )

class SemgrepAnalysisResponse(BaseResponse):
    """Response model for Semgrep analysis"""
    findings: List[SemgrepFinding] = Field(
        default=[],
        description="List of findings"
    )
    stats: Dict[str, Any] = Field(
        default={},
        description="Analysis statistics"
    )

# Snyk models
class SnykVulnerability(BaseModel):
    """Model for a Snyk vulnerability"""
    id: str = Field(
        ...,
        description="Vulnerability ID"
    )
    vulnerability: str = Field(
        ...,
        description="Vulnerability identifier (e.g., CVE)"
    )
    severity: str = Field(
        ...,
        description="Vulnerability severity"
    )
    description: str = Field(
        ...,
        description="Vulnerability description"
    )
    file: str = Field(
        ...,
        description="File path"
    )
    package: Optional[str] = Field(
        default=None,
        description="Package name if applicable"
    )
    version: Optional[str] = Field(
        default=None,
        description="Package version if applicable"
    )
    fixed_in: Optional[str] = Field(
        default=None,
        description="Version where the vulnerability is fixed"
    )

class SnykAnalysisResponse(BaseResponse):
    """Response model for Snyk analysis"""
    vulnerabilities: List[SnykVulnerability] = Field(
        default=[],
        description="List of vulnerabilities"
    )
    stats: Dict[str, Any] = Field(
        default={},
        description="Analysis statistics"
    )

# ClangTidy models
class ClangTidyCheck(BaseModel):
    """Model for a ClangTidy check"""
    id: str = Field(
        ...,
        description="Check ID"
    )
    name: str = Field(
        ...,
        description="Check name"
    )
    description: Optional[str] = Field(
        default=None,
        description="Check description"
    )

class ClangTidyChecksResponse(BaseResponse):
    """Response model for ClangTidy checks listing"""
    checks: List[ClangTidyCheck] = Field(
        default=[],
        description="List of available checks"
    )

class ClangTidyIssue(BaseModel):
    """Model for a ClangTidy issue"""
    id: str = Field(
        ...,
        description="Issue ID"
    )
    check: str = Field(
        ...,
        description="Check that triggered the issue"
    )
    severity: str = Field(
        ...,
        description="Issue severity"
    )
    message: str = Field(
        ...,
        description="Issue message"
    )
    file: str = Field(
        ...,
        description="File path"
    )
    line: int = Field(
        ...,
        description="Line number"
    )
    column: Optional[int] = Field(
        default=None,
        description="Column number"
    )
    code: Optional[str] = Field(
        default=None,
        description="Code snippet"
    )

class ClangTidyAnalysisResponse(BaseResponse):
    """Response model for ClangTidy analysis"""
    issues: List[ClangTidyIssue] = Field(
        default=[],
        description="List of issues"
    )
    stats: Dict[str, Any] = Field(
        default={},
        description="Analysis statistics"
    )

# Common models
class HealthCheckResponse(BaseResponse):
    """Response model for health check"""
    version: str = Field(
        ...,
        description="API version"
    )
    status: str = Field(
        default="healthy",
        description="API status"
    )
    tools: Dict[str, bool] = Field(
        ...,
        description="Tool availability status"
    )