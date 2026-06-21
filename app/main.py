from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes.auth import router as auth_router
from app.api.routes.urls import router as urls_router
from app.api.routes.redirect import router as redirect_router
from app.database import Base, engine
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.short_url import ShortUrl
from app.utils.rate_limit import limiter


def create_app() -> FastAPI:
    app = FastAPI(
        title="Auth API",
        description="JWT Authentication API with access/refresh tokens",
        version="0.1.0",
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/api")
    app.include_router(urls_router, prefix="/api")
    app.include_router(redirect_router)

    @app.on_event("startup")
    async def startup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    return app


app = create_app()