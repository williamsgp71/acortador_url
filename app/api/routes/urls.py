import random
import string

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.short_url import ShortUrl
from app.models.user import User
from app.schemas.urls import UrlCreate, UrlListResponse, UrlResponse

router = APIRouter(prefix="/urls", tags=["urls"])


def generate_short_code(length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


@router.post("/shorten", response_model=UrlResponse, status_code=status.HTTP_201_CREATED)
async def create_short_url(
    data: UrlCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    short_code = generate_short_code()

    existing = await db.execute(select(ShortUrl).where(ShortUrl.short_code == short_code))
    while existing.scalar_one_or_none():
        short_code = generate_short_code()
        existing = await db.execute(select(ShortUrl).where(ShortUrl.short_code == short_code))

    url = ShortUrl(
        short_code=short_code,
        original_url=str(data.original_url),
        user_id=current_user.id,
    )
    db.add(url)
    await db.flush()
    return url


@router.get("", response_model=UrlListResponse)
async def list_urls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ShortUrl).where(ShortUrl.user_id == current_user.id).order_by(ShortUrl.created_at.desc())
    )
    urls = result.scalars().all()

    count_result = await db.execute(
        select(func.count()).select_from(ShortUrl).where(ShortUrl.user_id == current_user.id)
    )
    total = count_result.scalar()

    return UrlListResponse(urls=urls, total=total)


@router.get("/{short_code}", response_model=UrlResponse)
async def get_url_stats(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ShortUrl).where(
            ShortUrl.short_code == short_code,
            ShortUrl.user_id == current_user.id,
        )
    )
    url = result.scalar_one_or_none()

    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found",
        )

    return url


@router.delete("/{short_code}", status_code=status.HTTP_200_OK)
async def delete_url(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ShortUrl).where(
            ShortUrl.short_code == short_code,
            ShortUrl.user_id == current_user.id,
        )
    )
    url = result.scalar_one_or_none()

    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found",
        )

    await db.delete(url)
    return {"detail": "URL deleted successfully"}