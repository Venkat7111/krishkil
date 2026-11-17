import random
import time
import json
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token
from app.email import send_welcome_email, send_otp_email, send_email

logger = logging.getLogger("krishisahay.auth")
router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP storage for fast lookup (email -> otp)
OTP_STORE = {}
OTP_FILE = Path(__file__).resolve().parent.parent.parent / "dev_otps.json"


def _load_otps() -> dict:
    if OTP_FILE.exists():
        try:
            with open(OTP_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_otps(data: dict):
    try:
        with open(OTP_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f)
    except Exception as e:
        logger.warning("Could not persist OTP store: %s", e)


@router.post("/register", response_model=schemas.AuthResponse)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    existing = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = models.User(
        full_name=payload.fullName.strip(),
        email=email_clean,
        phone=payload.phone,
        country=payload.country,
        state=payload.state,
        district=payload.district,
        village=payload.village,
        preferred_language=payload.preferredLanguage,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send Welcome Email to newly registered user
    try:
        send_welcome_email(user.email, user.full_name)
    except Exception as e:
        logger.info("Welcome email dispatch notice: %s", e)

    token = create_access_token(user.email)
    return {"user": {"id": user.id, "name": user.full_name, "email": user.email, "village": user.village, "token": token}}


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.email)
    return {"user": {"id": user.id, "name": user.full_name, "email": user.email, "village": user.village, "token": token}}


@router.post("/send-otp")
def send_otp(payload: schemas.SendOtpRequest):
    """Generates a 6-digit OTP and sends it directly to the user's email."""
    email_clean = payload.email.strip().lower()
    otp_code = str(random.randint(100000, 999999))

    # Persist in memory and file with 15-minute expiration
    expires_at = time.time() + 900
    OTP_STORE[email_clean] = otp_code

    otps = _load_otps()
    otps[email_clean] = {"otp": otp_code, "expires_at": expires_at}
    _save_otps(otps)

    print(f"\n[AUTH] 🔑 Generated OTP for '{email_clean}': {otp_code} (Valid for 15 mins)\n")
    logger.info("Generated OTP for %s: %s", email_clean, otp_code)

    email_sent = send_otp_email(payload.email, otp_code)
    return {
        "status": "success",
        "sent": email_sent,
        "message": f"Verification code sent to {payload.email}",
        "otp_debug": otp_code  # Debug helper
    }


@router.post("/verify-otp")
def verify_otp(payload: schemas.VerifyOtpRequest):
    email_clean = payload.email.strip().lower() if payload.email else ""
    user_otp = payload.otp.strip() if payload.otp else ""

    stored_otp = OTP_STORE.get(email_clean)
    if not stored_otp:
        otps = _load_otps()
        entry = otps.get(email_clean)
        if entry:
            if time.time() > entry.get("expires_at", 0):
                otps.pop(email_clean, None)
                _save_otps(otps)
                raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new one.")
            stored_otp = entry.get("otp")

    if not stored_otp or str(stored_otp).strip() != user_otp:
        print(f"[AUTH] ❌ OTP verification failed for {email_clean}. Provided: '{user_otp}', Stored: '{stored_otp}'")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    # Keep OTP in store so subsequent /reset-password call can verify it
    OTP_STORE[email_clean] = stored_otp
    print(f"[AUTH] ✅ OTP verified successfully for {email_clean}")
    return {"status": "verified", "message": "OTP verified successfully"}


@router.post("/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower() if payload.email else ""
    user_otp = payload.otp.strip() if payload.otp else ""

    stored_otp = OTP_STORE.get(email_clean)
    if not stored_otp:
        otps = _load_otps()
        entry = otps.get(email_clean)
        if entry and time.time() <= entry.get("expires_at", 0):
            stored_otp = entry.get("otp")

    if not stored_otp or str(stored_otp).strip() != user_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")

    user = db.query(models.User).filter(func.lower(models.User.email) == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    user.hashed_password = hash_password(payload.newPassword)
    db.commit()

    # Clear used OTP
    OTP_STORE.pop(email_clean, None)
    otps = _load_otps()
    otps.pop(email_clean, None)
    _save_otps(otps)

    print(f"[AUTH] 🔒 Password successfully reset for {email_clean}")
    return {"status": "success", "message": "Password reset successfully. You can now login."}


@router.post("/test-email")
def test_email(to_email: str = "merugusai112233@gmail.com"):
    """Test endpoint to verify SMTP connection and email delivery."""
    subject = "🌱 KrishiSahay SMTP Email Connection Test"
    html = f"""
    <h3>KrishiSahay Email Service Connection Test</h3>
    <p>This email verifies that your SMTP email server configuration (merugusai112233@gmail.com) is active and sending emails directly to users!</p>
    """
    success = send_email(to_email, subject, html)
    return {
        "status": "success" if success else "failed",
        "recipient": to_email,
        "delivered": success
    }
