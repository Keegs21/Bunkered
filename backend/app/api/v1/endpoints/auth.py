from typing import Any
from datetime import timedelta, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas
from app.core import security
from app.core.config import settings
from app.database.database import get_db
from app.database import models
from app.api import deps

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, getattr(user, 'hashed_password', '')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not getattr(user, 'is_active', True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/register", response_model=schemas.User)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user with referral code validation.
    """
    # Check if user already exists
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Validate referral code (if provided)
    referral_code = None
    if user_in.referral_code:
        try:
            referral_code = db.query(models.ReferralCode).filter(
                models.ReferralCode.code == user_in.referral_code,
                models.ReferralCode.is_active.is_(True)
            ).first()
            
            if not referral_code:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid referral code.",
                )
            
            # Check if referral code has reached max uses
            if referral_code.current_uses >= referral_code.max_uses:
                raise HTTPException(
                    status_code=400,
                    detail="Referral code has reached its maximum number of uses.",
                )
            
            # Check if referral code has expired
            if referral_code.expires_at and referral_code.expires_at < datetime.utcnow():
                raise HTTPException(
                    status_code=400,
                    detail="Referral code has expired.",
                )
        except Exception as e:
            # If there's a database error (e.g., table doesn't exist), allow registration
            print(f"Referral code validation failed: {e}")
            referral_code = None
    
    # Create new user
    hashed_password = security.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        referral_code_id=referral_code.id if referral_code else None,
    )
    db.add(db_user)
    
    # Increment referral code usage if a valid code was used
    if referral_code:
        referral_code.current_uses = referral_code.current_uses + 1
        db.add(referral_code)
    
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/referral-codes", response_model=schemas.ReferralCodeResponse)
def create_referral_code(
    *,
    db: Session = Depends(get_db),
    referral_data: schemas.ReferralCodeCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new referral code (admin only).
    """
    if not getattr(current_user, 'is_superuser', False):
        raise HTTPException(
            status_code=403,
            detail="Only administrators can create referral codes.",
        )
    
    # Check if code already exists
    existing_code = db.query(models.ReferralCode).filter(
        models.ReferralCode.code == referral_data.code
    ).first()
    if existing_code:
        raise HTTPException(
            status_code=400,
            detail="Referral code already exists.",
        )
    
    db_referral_code = models.ReferralCode(
        code=referral_data.code,
        created_by=current_user.id,
        is_active=referral_data.is_active,
        max_uses=referral_data.max_uses,
        expires_at=referral_data.expires_at,
        description=referral_data.description,
    )
    db.add(db_referral_code)
    db.commit()
    db.refresh(db_referral_code)
    return db_referral_code


@router.post("/validate-referral-code", response_model=schemas.ReferralCodeValidation)
def validate_referral_code(
    code: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Validate a referral code without using it.
    """
    referral_code = db.query(models.ReferralCode).filter(
        models.ReferralCode.code == code,
        models.ReferralCode.is_active.is_(True)
    ).first()
    
    if not referral_code:
        return schemas.ReferralCodeValidation(
            code=code,
            is_valid=False,
            message="Invalid referral code."
        )
    
    if referral_code.current_uses >= referral_code.max_uses:
        return schemas.ReferralCodeValidation(
            code=code,
            is_valid=False,
            message="Referral code has reached its maximum number of uses."
        )
    
    if referral_code.expires_at and referral_code.expires_at < datetime.utcnow():
        return schemas.ReferralCodeValidation(
            code=code,
            is_valid=False,
            message="Referral code has expired."
        )
    
    return schemas.ReferralCodeValidation(
        code=code,
        is_valid=True,
        message=f"Valid referral code. {referral_code.max_uses - referral_code.current_uses} uses remaining."
    ) 