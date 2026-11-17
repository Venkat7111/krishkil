import os
import json
import pickle
import logging
from functools import lru_cache
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas, models

logger = logging.getLogger("krishisahay.crop")
router = APIRouter(prefix="/crop", tags=["crop"])

def _find_model_file(name: str) -> str:
    candidates = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), name),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend", name),
        os.path.join(os.getcwd(), name),
        os.path.join(os.getcwd(), "backend", name),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]

MODEL_PATH = _find_model_file("model.pkl")

CROP_METADATA = {
    "rice": {"name": "Rice (Paddy)", "yield": "3.8 tonnes/acre", "profit": "₹52,000/acre"},
    "maize": {"name": "Maize", "yield": "4.2 tonnes/acre", "profit": "₹58,000/acre"},
    "chickpea": {"name": "Chickpea (Gram)", "yield": "1.4 tonnes/acre", "profit": "₹46,000/acre"},
    "kidneybeans": {"name": "Kidney Beans (Rajma)", "yield": "1.2 tonnes/acre", "profit": "₹65,000/acre"},
    "pigeonpeas": {"name": "Pigeonpeas (Arhar)", "yield": "1.5 tonnes/acre", "profit": "₹62,000/acre"},
    "mothbeans": {"name": "Moth Beans", "yield": "0.9 tonnes/acre", "profit": "₹38,000/acre"},
    "mungbean": {"name": "Mungbean (Green Gram)", "yield": "1.1 tonnes/acre", "profit": "₹44,000/acre"},
    "blackgram": {"name": "Blackgram (Urad)", "yield": "1.0 tonnes/acre", "profit": "₹42,000/acre"},
    "lentil": {"name": "Lentil (Masoor)", "yield": "1.3 tonnes/acre", "profit": "₹48,000/acre"},
    "pomegranate": {"name": "Pomegranate", "yield": "5.5 tonnes/acre", "profit": "₹185,000/acre"},
    "banana": {"name": "Banana", "yield": "12.0 tonnes/acre", "profit": "₹140,000/acre"},
    "mango": {"name": "Mango", "yield": "6.0 tonnes/acre", "profit": "₹160,000/acre"},
    "grapes": {"name": "Grapes", "yield": "8.0 tonnes/acre", "profit": "₹210,000/acre"},
    "watermelon": {"name": "Watermelon", "yield": "15.0 tonnes/acre", "profit": "₹75,000/acre"},
    "muskmelon": {"name": "Muskmelon", "yield": "10.0 tonnes/acre", "profit": "₹80,000/acre"},
    "apple": {"name": "Apple", "yield": "7.5 tonnes/acre", "profit": "₹190,000/acre"},
    "orange": {"name": "Orange", "yield": "6.5 tonnes/acre", "profit": "₹135,000/acre"},
    "papaya": {"name": "Papaya", "yield": "20.0 tonnes/acre", "profit": "₹150,000/acre"},
    "coconut": {"name": "Coconut", "yield": "9,000 nuts/acre", "profit": "₹120,000/acre"},
    "cotton": {"name": "Cotton", "yield": "2.1 tonnes/acre", "profit": "₹72,000/acre"},
    "jute": {"name": "Jute", "yield": "2.8 tonnes/acre", "profit": "₹50,000/acre"},
    "coffee": {"name": "Coffee", "yield": "1.8 tonnes/acre", "profit": "₹165,000/acre"},
}


@lru_cache(maxsize=1)
def get_ml_model():
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
                logger.info("Successfully loaded ML Crop Recommendation model from %s", MODEL_PATH)
                return model
        except Exception as e:
            logger.warning("Failed to load model.pkl: %s", e)
    return None


CROP_ID_MAP = {
    1: "rice", 2: "maize", 3: "chickpea", 4: "kidneybeans",
    5: "pigeonpeas", 6: "mothbeans", 7: "mungbean", 8: "blackgram",
    9: "lentil", 10: "pomegranate", 11: "banana", 12: "mango",
    13: "grapes", 14: "watermelon", 15: "muskmelon", 16: "apple",
    17: "orange", 18: "papaya", 19: "coconut", 20: "cotton",
    21: "jute", 22: "coffee"
}

def get_meta(crop_val):
    try:
        cid = int(crop_val)
        crop_key = CROP_ID_MAP.get(cid, "rice")
    except Exception:
        crop_key = str(crop_val).lower().replace(" ", "").replace("_", "")
        
    if crop_key in CROP_METADATA:
        return CROP_METADATA[crop_key]
    return {
        "name": str(crop_val).title(),
        "yield": "2.5 tonnes/acre",
        "profit": "₹55,000/acre"
    }




@router.post("/recommend", response_model=schemas.CropRecommendResponse)
def recommend(payload: schemas.CropRecommendRequest, db: Session = Depends(get_db)):
    model = get_ml_model()
    
    if model is not None and hasattr(model, "predict_proba"):
        try:
            features = [[
                payload.nitrogen or 50.0,
                payload.phosphorus or 50.0,
                payload.potassium or 50.0,
                payload.temperature or 25.0,
                payload.humidity or 65.0,
                payload.ph or 6.5,
                payload.rainfall or 100.0
            ]]
            probs = model.predict_proba(features)[0]
            classes = model.classes_
            
            # Sort by probability descending
            ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
            
            best_crop_raw, best_prob = ranked[0]
            best_meta = get_meta(best_crop_raw)
            best_conf = round(best_prob * 100, 1)
            
            alternatives = []
            for crop_raw, prob in ranked[1:4]:
                alt_meta = get_meta(crop_raw)
                alternatives.append(schemas.CropAlternative(
                    crop=alt_meta["name"],
                    confidence=round(prob * 100, 1),
                    **{"yield": alt_meta["yield"]}
                ))
                
            response = schemas.CropRecommendResponse(
                crop=best_meta["name"],
                confidence=best_conf,
                expectedYield=best_meta["yield"],
                estimatedProfit=best_meta["profit"],
                alternatives=alternatives,
                npkChart=[
                    schemas.NpkPoint(name="Nitrogen", value=payload.nitrogen or 0),
                    schemas.NpkPoint(name="Phosphorus", value=payload.phosphorus or 0),
                    schemas.NpkPoint(name="Potassium", value=payload.potassium or 0),
                ],
            )
            
            if hasattr(db, "add"):
                db.add(models.CropRecommendationLog(
                    inputs_json=json.dumps(payload.model_dump()),
                    crop=response.crop,
                    confidence=response.confidence,
                    expected_yield=response.expectedYield,
                    estimated_profit=response.estimatedProfit,
                ))
                db.commit()
            return response
            
        except Exception as e:
            logger.warning("ML prediction error: %s", e)

    # Rule-based fallback table if model fails
    CROP_TABLE = [
        {"crop": "Maize", "N": (60, 100), "P": (30, 60), "K": (20, 40), "temp": (18, 27), "humidity": (50, 75), "rainfall": (60, 110), "ph": (5.5, 7.5), "yield": "4.2 tonnes/acre", "profit": "₹58,000/acre"},
        {"crop": "Cotton", "N": (100, 140), "P": (40, 60), "K": (40, 60), "temp": (21, 30), "humidity": (60, 80), "rainfall": (60, 100), "ph": (5.8, 8.0), "yield": "2.1 tonnes/acre", "profit": "₹72,000/acre"},
        {"crop": "Rice (Paddy)", "N": (80, 120), "P": (30, 50), "K": (30, 50), "temp": (22, 32), "humidity": (70, 90), "rainfall": (150, 300), "ph": (5.0, 6.5), "yield": "3.8 tonnes/acre", "profit": "₹49,000/acre"},
        {"crop": "Groundnut", "N": (20, 40), "P": (40, 60), "K": (30, 50), "temp": (24, 32), "humidity": (50, 70), "rainfall": (50, 100), "ph": (6.0, 7.0), "yield": "1.8 tonnes/acre", "profit": "₹53,000/acre"},
    ]
    
    def _score(entry):
        n_s = 1.0 if (entry["N"][0] <= (payload.nitrogen or 50) <= entry["N"][1]) else 0.5
        p_s = 1.0 if (entry["P"][0] <= (payload.phosphorus or 50) <= entry["P"][1]) else 0.5
        k_s = 1.0 if (entry["K"][0] <= (payload.potassium or 50) <= entry["K"][1]) else 0.5
        return (n_s + p_s + k_s) / 3.0
        
    ranked = sorted(({**c, "score": _score(c)} for c in CROP_TABLE), key=lambda x: x["score"], reverse=True)
    best, *rest = ranked
    
    response = schemas.CropRecommendResponse(
        crop=best["crop"],
        confidence=round(best["score"] * 100, 1),
        expectedYield=best["yield"],
        estimatedProfit=best["profit"],
        alternatives=[
            schemas.CropAlternative(crop=c["crop"], confidence=round(c["score"] * 100, 1), **{"yield": c["yield"]})
            for c in rest[:2]
        ],
        npkChart=[
            schemas.NpkPoint(name="Nitrogen", value=payload.nitrogen or 0),
            schemas.NpkPoint(name="Phosphorus", value=payload.phosphorus or 0),
            schemas.NpkPoint(name="Potassium", value=payload.potassium or 0),
        ],
    )
    if hasattr(db, "add"):
        db.add(models.CropRecommendationLog(
            inputs_json=json.dumps(payload.model_dump()),
            crop=response.crop,
            confidence=response.confidence,
            expected_yield=response.expectedYield,
            estimated_profit=response.estimatedProfit,
        ))
        db.commit()
    return response
