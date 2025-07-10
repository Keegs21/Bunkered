from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.database.database import get_db
from app.database import models

router = APIRouter()


@router.get("/", response_model=List[dict])
def read_news(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve golf news articles.
    """
    query = db.query(models.NewsArticle)
    if category:
        query = query.filter(models.NewsArticle.category == category)
    
    articles = query.order_by(models.NewsArticle.published_at.desc()).offset(skip).limit(limit).all()
    return articles


@router.get("/{article_id}", response_model=dict)
def read_article(
    article_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get news article by ID.
    """
    article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/categories", response_model=List[str])
def get_news_categories(
    db: Session = Depends(get_db),
) -> Any:
    """
    Get available news categories.
    """
    categories = db.query(models.NewsArticle.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]


@router.get("/tournament/{tournament_id}", response_model=List[dict])
def get_tournament_news(
    tournament_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get news related to a specific tournament.
    """
    # This would typically join with tournament data or filter by keywords
    # For now, return general tournament category news
    articles = db.query(models.NewsArticle).filter(
        models.NewsArticle.category == "tournament"
    ).order_by(models.NewsArticle.published_at.desc()).offset(skip).limit(limit).all()
    return articles 