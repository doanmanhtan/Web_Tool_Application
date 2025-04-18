from fastapi import APIRouter
from app.api.endpoints import semgrep, snyk, clangtidy, common

# Create main API router
api_router = APIRouter()

# Include routers from each endpoint module
api_router.include_router(common.router, tags=["Common"])
api_router.include_router(semgrep.router, prefix="/semgrep", tags=["Semgrep"])
api_router.include_router(snyk.router, prefix="/snyk", tags=["Snyk"])
api_router.include_router(clangtidy.router, prefix="/clangtidy", tags=["ClangTidy"])