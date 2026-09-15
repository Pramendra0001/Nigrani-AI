"""SQLAlchemy async database setup and connection management."""

from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    """Base declarative class for all models."""
    pass


# Production connection pooling and resilience configuration
engine_kwargs = {
    "echo": False,
    "future": True,
}

if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # High-performance PostgreSQL production pooling (Neon / cloud DB)
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_recycle"] = 300

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing database sessions to FastAPI routes."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create tables and safely add columns introduced after an older DB backup."""
    async with engine.begin() as conn:
        from app.models import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)

        # The Neon database was restored from an older schema. SQLAlchemy's
        # create_all() does not add columns to an existing table, so migrate
        # the newer Project fields explicitly. IF NOT EXISTS makes this safe
        # on every subsequent startup and preserves all existing data.
        if "sqlite" not in settings.DATABASE_URL:
            project_columns = {
                "parliament_type": "VARCHAR(50)",
                "allocation_amount": "DOUBLE PRECISION",
                "recommended_amount": "DOUBLE PRECISION",
                "sanctioned_amount": "DOUBLE PRECISION",
                "estimated_cost": "DOUBLE PRECISION",
                "contract_value": "DOUBLE PRECISION",
                "fund_released": "DOUBLE PRECISION",
                "cumulative_expenditure": "DOUBLE PRECISION",
                "remaining_balance": "DOUBLE PRECISION",
                "payment_total": "DOUBLE PRECISION",
                "payment_count": "INTEGER",
                "last_payment_date": "DATE",
                "financial_completion_percentage": "DOUBLE PRECISION",
                "consistency_score": "DOUBLE PRECISION",
                "physical_financial_variance": "DOUBLE PRECISION",
                "asset_expected": "VARCHAR(200)",
                "asset_type": "VARCHAR(100)",
                "asset_status": "VARCHAR(50)",
                "verification_status": "VARCHAR(50)",
                "verification_date": "DATE",
                "verification_source": "VARCHAR(100)",
                "evidence_available": "BOOLEAN",
                "data_source": "VARCHAR(100)",
                "source_reference": "VARCHAR(200)",
                "source_url": "VARCHAR(300)",
                "data_completeness_score": "DOUBLE PRECISION",
                "record_tier": "VARCHAR(50)",
            }

            for column_name, column_type in project_columns.items():
                await conn.execute(
                    text(
                        f'ALTER TABLE projects ADD COLUMN IF NOT EXISTS "{column_name}" {column_type}'
                    )
                )

            await conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_projects_parliament_type "
                    "ON projects (parliament_type)"
                )
            )
