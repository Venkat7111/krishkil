from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    country = Column(String, default="India")
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    village = Column(String, nullable=True)
    preferred_language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="owner")


class CropPrice(Base):
    """Seed / mandi price reference data shown on the Market page."""
    __tablename__ = "crop_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    unit = Column(String, default="quintal")
    change_pct = Column(Float, default=0.0)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    district = Column(String, nullable=True)
    distance_km = Column(Float, default=0.0)


class Scheme(Base):
    """Government scheme documents — searched over as a lightweight
    retrieval store for the Government Schemes page (keyword/full-text
    search today; swap in FAISS + embeddings later without changing the
    router's public interface)."""
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    eligibility = Column(Text, nullable=False)
    documents = Column(Text, nullable=False)
    description = Column(Text, nullable=False)


class DiseaseReport(Base):
    __tablename__ = "disease_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop = Column(String, nullable=True)
    disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    treatment = Column(Text, nullable=False)
    prevention = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CropRecommendationLog(Base):
    __tablename__ = "crop_recommendation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    inputs_json = Column(Text, nullable=False)
    crop = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    expected_yield = Column(String, nullable=False)
    estimated_profit = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    summary_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="reports")
