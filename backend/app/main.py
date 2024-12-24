from fastapi import FastAPI
from app.db.base import engine, SessionLocal
from app.db.models import Base, Product, User
from app.api import api_router
from sqlalchemy.orm import Session
import uuid
from app.core.exceptions import (app_exception_handler, sqlalchemy_exception_handler, validation_exception_handler, AppException, custom_exception_handler)
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.config import limiter
from fastapi_pagination import  add_pagination
from app.core.security import get_password_hash
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(api_router)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, custom_exception_handler)

app.mount("/images", StaticFiles(directory="uploads/images"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_pagination(app)


@app.on_event("startup")
async def startup_event():
    print("Starting application...")
    db: Session = SessionLocal()
    try:
        # Create admin user if not exists
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD", "changeme")  # Default password should be changed on first login
        
        admin_user = db.query(User).filter(User.username == admin_username).first()
        if not admin_user:
            print("Creating admin user...")
            admin_user = User(
                id=str(uuid.uuid4()),
                username=admin_username,
                hashed_password=get_password_hash(admin_password),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully")
        
        # Seed products data
        if not db.query(Product).first():
            print("Seeding Products Data...")
            sample_products = [
                Product(
                    id=str(uuid.uuid4()),
                    name=f"Product {i+1}",
                    description=f"Sample product {i+1}",
                    price=100.0 + i,
                    category="Electronics",
                )
                for i in range(10)
            ]
            db.bulk_save_objects(sample_products)
            db.commit()
            print("Products seeded successfully")
    
    except Exception as e:
        print(f"Error during startup: {str(e)}")
    finally:
        db.close()

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