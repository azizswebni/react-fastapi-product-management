from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductWithFavoriteResponse
from app.db.base import get_session_local
from app.db.models import Product, User
from app.core.cache import redis_client
from app.core.security import verify_token
from app.core.exceptions import AppException
import uuid
import json
from typing import Optional, List

router = APIRouter()

@router.post("/", response_model=ProductResponse)
async def create_product(
    request: Request,
    product: ProductCreate, 
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or user.role != "admin":
            raise AppException(name="Authorization Error", detail="Insufficient privileges")

        new_product = Product(**product.dict(), id=str(uuid.uuid4()))
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        await redis_client.delete("product_list")
        return new_product
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Product Creation Error", detail=str(e))

@router.get("/", response_model=Page[ProductWithFavoriteResponse])
async def get_products(
    request: Request,
    page: int = 1, 
    size: int = 10, 
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise AppException(name="Authorization Error", detail="User not found")

        cache_key = f"product_list:{username}:{page}:{size}"
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return Page.parse_raw(cached_data)
        
        query = db.query(Product)
        result = paginate(query)
        
        favorite_products = {p.id for p in user.favorite_products}
        
        
        for item in result.items:
            item.is_favorite = item.id in favorite_products

        await redis_client.set(
            cache_key, 
            result.json(), 
            ex=60
        )
        
        return result
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Product Retrieval Error", detail=str(e))

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str, 
    product: ProductUpdate, 
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or user.role != "admin":
            raise AppException(name="Authorization Error", detail="Insufficient privileges")

        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise AppException(name="Not Found", detail="Product not found")
        
        for key, value in product.dict().items():
            setattr(db_product, key, value)
        
        db.commit()
        db.refresh(db_product)
        await redis_client.delete("product_list")
        return db_product
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Product Update Error", detail=str(e))

@router.delete("/{product_id}")
async def delete_product(
    product_id: str, 
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or user.role != "admin":
            raise AppException(name="Authorization Error", detail="Insufficient privileges")

        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise AppException(name="Not Found", detail="Product not found")
        
        db.delete(db_product)
        db.commit()
        await redis_client.delete("product_list")
        return {"detail": "Product deleted successfully"}
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Product Deletion Error", detail=str(e))

@router.get("/search", response_model=Page[ProductResponse])
async def search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise AppException(name="Authorization Error", detail="User not found")

        products_query = db.query(Product)
        
        if query:
            products_query = products_query.filter(Product.name.ilike(f"%{query}%"))
        if category:
            products_query = products_query.filter(Product.category == category)
        if min_price is not None:
            products_query = products_query.filter(Product.price >= min_price)
        if max_price is not None:
            products_query = products_query.filter(Product.price <= max_price)
            
        return paginate(products_query)
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Product Search Error", detail=str(e))

@router.post("/{product_id}/favorite")
async def add_favorite(
    product_id: str,
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise AppException(name="Authorization Error", detail="User not found")

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise AppException(name="Not Found", detail="Product not found")

        if product not in user.favorite_products:
            user.favorite_products.append(product)
            db.commit()
            await redis_client.delete(f"product_list:{username}:*")
            return {"detail": "Product added to favorites"}
        return {"detail": "Product already in favorites"}
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Favorite Addition Error", detail=str(e))

@router.delete("/{product_id}/favorite")
async def remove_favorite(
    product_id: str,
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise AppException(name="Authorization Error", detail="User not found")

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise AppException(name="Not Found", detail="Product not found")

        if product in user.favorite_products:
            user.favorite_products.remove(product)
            db.commit()
            await redis_client.delete(f"product_list:{username}:*")
            return {"detail": "Product removed from favorites"}
        return {"detail": "Product not in favorites"}
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Favorite Removal Error", detail=str(e))

@router.get("/favorites", response_model=List[ProductWithFavoriteResponse])
async def get_favorite_products(
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise AppException(name="Authorization Error", detail="User not found")

        favorites = [
            {**product.__dict__, "is_favorite": True} 
            for product in user.favorite_products
        ]
        return favorites
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Favorites Retrieval Error", detail=str(e))