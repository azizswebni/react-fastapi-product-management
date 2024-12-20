from sqlalchemy import Column, String, Float, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

# Add association table for favorites
user_favorite_products = Table(
    "user_favorite_products",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id")),
    Column("product_id", String, ForeignKey("products.id")),
)

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add relationship
    favorited_by = relationship(
        "User",
        secondary=user_favorite_products,
        back_populates="favorite_products"
    )

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add relationship
    favorite_products = relationship(
        "Product",
        secondary=user_favorite_products,
        back_populates="favorited_by"
    )