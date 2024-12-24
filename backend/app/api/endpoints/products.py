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
from typing import Optional, List
from app.api.utils.utils import get_user,build_product_query,delete_redis_cache,get_redis_cache,set_redis_cache,admin_required
from app.core.constants import PRODUCT_LIST_INDEX,UPLOAD_DIR
from fastapi import UploadFile, File, HTTPException
import shutil
from fastapi.responses import FileResponse

router = APIRouter()

@router.post("/", response_model=ProductResponse)
async def create_product(
    request: Request,
    product: ProductCreate, 
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = admin_required(username, db)
    
        existing_product = db.query(Product).filter(Product.name == product.name).first()
        if existing_product:
            raise AppException(name="Product Creation Error", detail="A product with the same name already exists.")
        
        new_product = Product(**product.dict(), id=str(uuid.uuid4()))
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:*"
        await delete_redis_cache(cache_key)
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
    name: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = get_user(username, db)

        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:{page}:{size}:{name}:{category}:{min_price}:{max_price}" 
        
        cached_data = await get_redis_cache(cache_key)
        if cached_data:
            return Page.parse_raw(cached_data)
        
        
        products_query = build_product_query(db, name, category, min_price, max_price)
        
        result = paginate(products_query)
        
        favorite_products = {p.id for p in user.favorite_products}
        
        
        for item in result.items:
            item.is_favorite = item.id in favorite_products
        
        await set_redis_cache(cache_key,result.json())

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
        user = admin_required(username, db)

        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise AppException(name="Not Found", detail="Product not found")
        
        for key, value in product.dict().items():
            setattr(db_product, key, value)
        
        db.commit()
        db.refresh(db_product)
        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:*"
        await delete_redis_cache(cache_key)
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
        user = admin_required(username, db)

        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise AppException(name="Not Found", detail="Product not found")
        
        db.delete(db_product)
        db.commit()
        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:*"
        await delete_redis_cache(cache_key)
        return {"detail": "Product deleted successfully"}
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Product Deletion Error", detail=str(e))

@router.post("/{product_id}/favorite")
async def add_favorite(
    product_id: str,
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token)
):
    try:
        user = get_user(username, db)

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise AppException(name="Not Found", detail="Product not found")
        

        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:*"
        await delete_redis_cache(cache_key)

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
        user = get_user(username, db)

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise AppException(name="Not Found", detail="Product not found")

        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:*"
        await delete_redis_cache(cache_key)
        if product in user.favorite_products:
            user.favorite_products.remove(product)
            db.commit()
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
        user = get_user(username, db)

        favorites = [
            {**product.__dict__, "is_favorite": True} 
            for product in user.favorite_products
        ]
        return favorites
    except AppException as e:
        raise e
    except Exception as e:
        raise AppException(name="Favorites Retrieval Error", detail=str(e))
    
    

@router.post("/{product_id}/upload-image")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_session_local),
    username: str = Depends(verify_token),
):
    try:
        user = admin_required(username, db)
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are allowed.")

        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")

        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        product.image_url = f"/images/{filename}"
        db.commit()
        db.refresh(product)
        
        cache_key = f"{PRODUCT_LIST_INDEX}:{username}:*"
        await delete_redis_cache(cache_key)
        
        
        return {"message": "File uploaded successfully", "filename": str(file_path)}
    except AppException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/images/{filename}")
async def serve_image(filename: str):
    try:
        file_path = UPLOAD_DIR / filename

        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Image not found")
        
        return FileResponse(file_path, media_type="image/jpeg")
    except AppException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))