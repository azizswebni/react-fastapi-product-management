from fastapi import FastAPI
from app.db.base import engine
from app.db.models import Base

Base.metadata.create_all(bind=engine)
app = FastAPI()


@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down application...")
    

from scalar_fastapi import get_scalar_api_reference

@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )