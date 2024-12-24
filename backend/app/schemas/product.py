from pydantic import BaseModel, Field, validator,HttpUrl
from decimal import Decimal
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=1000)
    price: Decimal = Field(..., ge=0)
    category: str = Field(..., min_length=1, max_length=50)
    image_url: Optional[str] = None

    @validator('price')
    def validate_price(cls, v):
        return round(v, 2)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str

    class Config:
        from_attributes = True

class ProductWithFavoriteResponse(ProductResponse):
    is_favorite: bool = False

    class Config:
        from_attributes = True