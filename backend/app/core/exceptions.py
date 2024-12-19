from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from typing import Any
from pydantic import BaseModel

class AppException(Exception):
    def __init__(self, name: str, detail: str):
        self.name = name
        self.detail = detail

class ErrorResponse(BaseModel):
    error: str
    detail: Any
    status_code: int

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=400, 
        content={"error": exc.name, "detail": exc.detail}
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500, 
        content={"error": "Database Error", "detail": str(exc)}
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422, 
        content={"error": "Validation Error", "detail": exc.errors()}
    )

async def custom_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            detail=str(exc),
            status_code=500
        ).dict()
    )