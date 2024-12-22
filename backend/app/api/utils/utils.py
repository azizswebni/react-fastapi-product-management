from app.db.models import Product, User
from sqlalchemy.orm import Session
from typing import Optional
from app.core.exceptions import AppException


def get_user(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise AppException(name="Authorization Error", detail="User not found")
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
