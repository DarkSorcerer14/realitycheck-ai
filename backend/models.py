from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./realitycheck.db")

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


class Idea(Base):
    __tablename__ = "ideas"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    analyses = relationship("Analysis", back_populates="idea", cascade="all, delete")


class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), nullable=False)
    keywords = Column(String(500))
    demand_score = Column(Float)
    trend_score = Column(Float)
    competition_score = Column(Float)
    viability_score = Column(Float)
    ai_feedback = Column(Text)
    roast = Column(Text)
    elevator_pitch = Column(String(500))
    target_audience = Column(String(500))
    monetization = Column(String(500))
    competitors = Column(Text)
    # Extended scoring model
    market_size_score = Column(Float)
    willingness_to_pay = Column(Float)
    monetization_clarity = Column(Float)
    defensibility = Column(Float)
    regulatory_risk = Column(Float)
    time_to_revenue = Column(Float)
    founder_fit = Column(Float)
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    idea = relationship("Idea", back_populates="analyses")


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)