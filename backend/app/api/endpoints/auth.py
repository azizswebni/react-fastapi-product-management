from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, Token, UserLogin
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.base import get_session_local
from app.db.models import User
from app.core.config import limiter
from app.core.security import get_uuid4
router = APIRouter()

@router.post("/register", response_model=Token)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate, db: Session = Depends(get_session_local)):
    user_obj = db.query(User).filter(User.username == user.username).first()
    
    if user_obj:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        id=get_uuid4(),username=user.username, hashed_password=hashed_password
    )
    
    db.add(new_user)
    
    db.commit()
    
    access_token = create_access_token(data={"sub": new_user.username})
    
    return {"access_token": access_token,"role":new_user.role}


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user: UserLogin, db: Session = Depends(get_session_local)):
    
    db_user = db.query(User).filter(User.username == user.username).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": db_user.username})
    
    return {"access_token": access_token,"role":db_user.role}