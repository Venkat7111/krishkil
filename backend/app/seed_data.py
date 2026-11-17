"""Run once to populate reference data: python -m app.seed_data"""
from app.database import SessionLocal, engine, Base
from app import models


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.CropPrice).count() == 0:
            db.add_all([
                models.CropPrice(crop="Cotton", price=7250, unit="quintal", change_pct=2.4),
                models.CropPrice(crop="Maize", price=2120, unit="quintal", change_pct=-1.1),
                models.CropPrice(crop="Paddy", price=2040, unit="quintal", change_pct=0.8),
                models.CropPrice(crop="Chilli", price=15400, unit="quintal", change_pct=3.9),
                models.CropPrice(crop="Turmeric", price=13850, unit="quintal", change_pct=-0.6),
            ])
        if db.query(models.Market).count() == 0:
            db.add_all([
                models.Market(name="Warangal Agri Market Yard", district="Warangal", distance_km=4.2),
                models.Market(name="Hanamkonda Mandi", district="Warangal", distance_km=7.8),
                models.Market(name="Jangaon Market Yard", district="Jangaon", distance_km=22.5),
            ])
        if db.query(models.Scheme).count() == 0:
            db.add_all([
                models.Scheme(
                    name="PM-KISAN", category="Income Support",
                    eligibility="All landholding farmer families across India",
                    documents="Aadhaar card, land ownership records, bank passbook",
                    description="Provides ₹6,000 per year to eligible farmer families in three equal installments, transferred directly to bank accounts.",
                ),
                models.Scheme(
                    name="PMFBY (Crop Insurance)", category="Insurance",
                    eligibility="Farmers growing notified crops in notified areas, including tenant and sharecropper farmers",
                    documents="Land records or tenancy agreement, sowing certificate, bank account details",
                    description="Pradhan Mantri Fasal Bima Yojana offers low-premium insurance coverage against crop loss from natural calamities, pests, and disease.",
                ),
                models.Scheme(
                    name="Soil Health Card Scheme", category="Advisory",
                    eligibility="All farmers, regardless of landholding size",
                    documents="Aadhaar card, land details",
                    description="Provides farmers with soil nutrient status and crop-wise fertilizer recommendations every two years via a Soil Health Card.",
                ),
                models.Scheme(
                    name="Kisan Credit Card (KCC)", category="Credit",
                    eligibility="Farmers, tenant farmers, oral lessees, and sharecroppers",
                    documents="Identity proof, address proof, land documents or lease agreement",
                    description="Offers short-term credit at subsidized interest rates for crop production, post-harvest expenses, and farm asset maintenance.",
                ),
            ])
        db.commit()
        print("Seed data inserted.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
