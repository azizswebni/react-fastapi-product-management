from app.db.models import Product, User
from sqlalchemy.orm import Session
from typing import Optional
from app.core.exceptions import AppException
from app.core.cache import redis_client
from fastapi import HTTPException

def get_user(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise AppException(name="Authorization Error", detail="User not found")
    return user

def admin_required(username: str, db: Session):
    user = get_user(username, db)
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to perform this action.")
    return user


def build_product_query(
    db: Session, 
    name: Optional[str] = None, 
    category: Optional[str] = None, 
    min_price: Optional[float] = None, 
    max_price: Optional[float] = None
):
    products_query = db.query(Product)
    if name:
        products_query = products_query.filter(Product.name.ilike(f"%{name}%"))
    if category:
        products_query = products_query.filter(Product.category == category)
    if min_price:
        products_query = products_query.filter(Product.price >= min_price)
    if max_price:
        products_query = products_query.filter(Product.price <= max_price)
        
        
    return products_query


async def set_redis_cache(cache_key:str,data,ex:int=60):
    await redis_client.set(
        cache_key, 
        data, 
        ex=ex
    )

async def get_redis_cache(cache_key:str):
    cached_data = await redis_client.get(cache_key)
    if cached_data:
        return cached_data
    return None
    
async def delete_redis_cache(cache_key:str):
    keys = await redis_client.keys(cache_key)
    if keys:
        await redis_client.delete(*keys)