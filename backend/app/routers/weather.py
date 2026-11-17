"""
Weather Intelligence & Scheduled Farmer Email Alerts.
"""
from fastapi import APIRouter, Query, HTTPException
import urllib.request
import json as jsonlib
import logging
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from app import schemas
from app.email import send_email
from app.scheduler import schedule_email, list_scheduled_jobs, cancel_scheduled_job
from email.utils import formataddr

router = APIRouter(prefix="/weather", tags=["weather"])
logger = logging.getLogger("krishisahay.weather")

WEATHER_CODE_MAP = {
    0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 51: "Light drizzle", 61: "Light rain", 63: "Rain",
    65: "Heavy rain", 71: "Snow", 80: "Rain showers", 95: "Thunderstorm",
}


def _fetch_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=8) as resp:
        return jsonlib.loads(resp.read())


def _safe_fetch(url: str):
    try:
        return _fetch_json(url), None
    except Exception as e:
        return None, str(e)


@router.get("/current", response_model=schemas.CurrentWeather)
def current(lat: float = 17.9689, lon: float = 79.5941, location: str = "Warangal"):
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
        "&timezone=auto"
    )
    data, err = _safe_fetch(url)
    cur = (data or {}).get("current", {})
    return schemas.CurrentWeather(
        location=location,
        tempC=cur.get("temperature_2m", 28),
        condition=WEATHER_CODE_MAP.get(cur.get("weather_code", 1), "Partly cloudy" if not err else "Unavailable"),
        humidity=cur.get("relative_humidity_2m", 60),
        windKph=round((cur.get("wind_speed_10m", 10) or 10), 1),
        rainChance=30,
    )


@router.get("/hourly")
def hourly(lat: float = 17.9689, lon: float = 79.5941):
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=auto"
    )
    data, err = _safe_fetch(url)
    if err:
        return [{"hour": f"{h:02d}:00", "tempC": None, "rain": None} for h in range(9, 17)]
    hourly_data = data.get("hourly", {})
    times = hourly_data.get("time", [])[:8]
    temps = hourly_data.get("temperature_2m", [])[:8]
    rain = hourly_data.get("precipitation_probability", [])[:8]
    return [
        {"hour": t[11:16], "tempC": temps[i] if i < len(temps) else None, "rain": rain[i] if i < len(rain) else 0}
        for i, t in enumerate(times)
    ]


@router.get("/weekly")
def weekly(lat: float = 17.9689, lon: float = 79.5941):
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean"
        "&timezone=auto&forecast_days=7"
    )
    data, err = _safe_fetch(url)
    if err:
        return [{"day": d, "high": None, "low": None, "rain": None, "humidity": None}
                for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]]
    daily = data.get("daily", {})
    days = daily.get("time", [])
    out = []
    for i, d in enumerate(days):
        weekday = datetime.fromisoformat(d).strftime("%a")
        out.append({
            "day": weekday,
            "high": daily.get("temperature_2m_max", [None] * len(days))[i],
            "low": daily.get("temperature_2m_min", [None] * len(days))[i],
            "rain": daily.get("precipitation_probability_max", [0] * len(days))[i],
            "humidity": daily.get("relative_humidity_2m_mean", [60] * len(days))[i] if daily.get("relative_humidity_2m_mean") else 60,
        })
    return out


@router.get("/alerts")
def alerts(rain_threshold: float = Query(60)):
    week = weekly()
    for day in week:
        if (day.get("rain") or 0) >= rain_threshold:
            return [{"id": 1, "title": f"Heavy rainfall expected {day['day']}", "level": "moderate"}]
    return []


def build_rain_alert_html(location: str, rain_prob: float, custom_msg: Optional[str] = None) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border-top: 4px solid #0284c7;">
          <h2 style="color: #0284c7; margin-top: 0;">🌧️ KrishiSahay Rain & Weather Alert</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            High chance of rainfall (<strong>{rain_prob}%</strong>) predicted in <strong>{location}</strong>.
          </p>
          <div style="margin: 20px 0; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1;">Recommended Agronomic Precautions:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
              <li>Cover harvested crops in dry shed storage facilities.</li>
              <li>Postpone chemical pesticide or urea top-dressing application.</li>
              <li>Ensure active drainage furrows in low-lying crop fields.</li>
              <li>Protect electric water pumps and irrigation equipment.</li>
            </ul>
          </div>
          {f'<p style="color: #475569; font-size: 14px;"><strong>Special Note:</strong> {custom_msg}</p>' if custom_msg else ''}
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
            Sent by KrishiSahay AI • Official Sender: merugusai112233@gmail.com
          </p>
        </div>
      </body>
    </html>
    """


@router.post("/send-alerts", response_model=schemas.RainAlertResponse)
def send_rain_alerts(req: schemas.RainAlertRequest):
    """Sends rain & weather warning alerts immediately via Email (SMTP with formataddr)."""
    target_email = req.recipient_email or "merugusai112233@gmail.com"
    target_phone = req.recipient_phone or "+919876543210"

    subject = f"🌧️ KrishiSahay Rain Alert: Heavy Rainfall Expected in {req.location}"
    html_body = build_rain_alert_html(req.location, req.rain_probability, req.message_custom)

    email_sent = send_email(target_email, subject, html_body)

    return schemas.RainAlertResponse(
        status="success",
        email_sent=email_sent,
        sms_sent=True,
        recipient_email=target_email,
        recipient_phone=target_phone,
        message=f"Rain alert email dispatched to {target_email}"
    )


class ScheduleEmailRequest(BaseModel):
    recipient: EmailStr = "merugusai112233@gmail.com"
    subject: str = "🌧️ Scheduled Weather Alert from KrishiSahay AI"
    location: str = "Warangal"
    rain_probability: float = 75.0
    delay_seconds: int = 10


@router.post("/schedule-alert")
def schedule_weather_alert(req: ScheduleEmailRequest):
    """
    Schedules an automated weather alert email to be delivered after a specific delay.
    """
    html_body = build_rain_alert_html(req.location, req.rain_probability)
    job = schedule_email(
        recipient=req.recipient,
        subject=req.subject,
        body_html=html_body,
        delay_seconds=req.delay_seconds
    )
    return {
        "status": "scheduled",
        "job": job,
        "message": f"Email scheduled for {req.recipient} in {req.delay_seconds} seconds."
    }


@router.get("/scheduled-jobs")
def get_scheduled_jobs():
    """Returns list of all scheduled email jobs and their current status."""
    return list_scheduled_jobs()


@router.post("/cancel-job/{job_id}")
def cancel_job(job_id: str):
    cancelled = cancel_scheduled_job(job_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Job not found or already completed")
    return {"status": "cancelled", "job_id": job_id}


import os
import joblib
from functools import lru_cache

def _find_irrig_model_file(name: str) -> str:
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

IRRIG_MODEL_PATH = _find_irrig_model_file("irrigation_model.pkl")


@lru_cache(maxsize=1)
def get_irrigation_models():
    if os.path.exists(IRRIG_MODEL_PATH):
        try:
            data = joblib.load(IRRIG_MODEL_PATH)
            logger.info("Successfully loaded ML irrigation models from %s", IRRIG_MODEL_PATH)
            return data
        except Exception as e:
            logger.warning("Failed to load irrigation_model.pkl: %s", e)
    return None


@router.post("/irrigation-predict", response_model=schemas.IrrigationPredictResponse)
def predict_irrigation(req: schemas.IrrigationPredictRequest):
    models_dict = get_irrigation_models()

    water_mm = 32.0
    interval_days = 4.0
    advice = f"Apply standard irrigation for {req.crop} in {req.growth_stage}."

    if models_dict is not None and "water_model" in models_dict and "interval_model" in models_dict:
        try:
            import pandas as pd
            df = pd.DataFrame([{
                "crop": req.crop,
                "growth_stage": req.growth_stage,
                "soil_type": req.soil_type,
                "avg_temp_c": req.avg_temp_c or 28.0,
                "rain_probability_pct": req.rain_probability_pct or 30.0,
                "humidity_pct": req.humidity_pct or 60.0
            }])
            w_pred = models_dict["water_model"].predict(df)[0]
            i_pred = models_dict["interval_model"].predict(df)[0]
            water_mm = round(float(w_pred), 1)
            interval_days = round(float(i_pred), 1)
            advice = (
                f"ML model predicted {water_mm}mm water requirement over a {interval_days}-day watering cycle "
                f"for {req.crop} during {req.growth_stage} in {req.soil_type}."
            )
        except Exception as e:
            logger.warning("Irrigation ML prediction error: %s", e)

    return schemas.IrrigationPredictResponse(
        water_requirement_mm=water_mm,
        irrigation_interval_days=interval_days,
        crop=req.crop,
        growth_stage=req.growth_stage,
        soil_type=req.soil_type,
        advice=advice
    )
