from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.database.database import get_db
from app.database import models
from app.core import security

router = APIRouter()


def get_current_admin_user(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> models.User:
    """
    Dependency to ensure current user is an admin.
    """
    if not getattr(current_user, 'is_superuser', False):
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    return current_user


@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    password: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user_data = {}
    if password is not None:
        from app.core import security
        user_data["hashed_password"] = security.get_password_hash(password)
    if first_name is not None:
        user_data["first_name"] = first_name
    if last_name is not None:
        user_data["last_name"] = last_name
    
    if user_data:
        for field, value in user_data.items():
            setattr(current_user, field, value)
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    
    return current_user


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============ ADMIN ENDPOINTS ============

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 1000,
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get all users (admin only).
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Update any user (admin only).
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle password hashing if provided
    if "password" in update_data:
        update_data["hashed_password"] = security.get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Delete a user (admin only).
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if getattr(user, 'id') == getattr(current_user, 'id'):
        raise HTTPException(
            status_code=400,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}