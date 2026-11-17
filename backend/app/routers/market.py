from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
import random

from app.database import get_db
from app import models

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/prices")
def prices(db: Session = Depends(get_db)):
    rows = db.query(models.CropPrice).order_by(models.CropPrice.crop).all()
    return [
        {
            "crop": r.crop,
            "price": r.price,
            "unit": r.unit,
            "trend": "up" if r.change_pct >= 0 else "down",
            "change": r.change_pct,
        }
        for r in rows
    ]


@router.get("/nearby")
def nearby(db: Session = Depends(get_db)):
    rows = db.query(models.Market).order_by(models.Market.distance_km).all()
    return [{"name": r.name, "distanceKm": r.distance_km} for r in rows]


@router.get("/trend")
def trend(crop: str = "Cotton", db: Session = Depends(get_db)):
    row = db.query(models.CropPrice).filter(models.CropPrice.crop == crop).first()
    base = row.price if row else 7000
    months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    out, price = [], base * 0.9
    rnd = random.Random(crop)  # deterministic per crop, not truly random each call
    for m in months:
        price += rnd.randint(-40, 140)
        out.append({"month": m, "price": round(price)})
    return out
