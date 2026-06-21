from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.short_url import ShortUrl

router = APIRouter(tags=["redirect"])


@router.get("/s/{short_code}")
async def redirect_to_url(
    short_code: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ShortUrl).where(ShortUrl.short_code == short_code)
    )
    url = result.scalar_one_or_none()

    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Short URL not found",
        )

    url.clicks += 1
    url.last_accessed_at = datetime.now(timezone.utc)
    await db.commit()

    return RedirectResponse(url=url.original_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)