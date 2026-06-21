from datetime import datetime

from pydantic import BaseModel, HttpUrl


class UrlCreate(BaseModel):
    original_url: HttpUrl


class UrlResponse(BaseModel):
    id: str
    short_code: str
    original_url: str
    clicks: int
    last_accessed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UrlListResponse(BaseModel):
    urls: list[UrlResponse]
    total: int