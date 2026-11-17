from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from app.database import get_db
from app import models

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    # bcrypt has a hard 72-byte input limit; truncate rather than error.
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Optional-auth dependency: returns the User if a valid bearer token is
    present, otherwise None (many endpoints work fine for guest users)."""
    if creds is None:
        return None
    email = decode_token(creds.credentials)
    user = db.query(models.User).filter(models.User.email == email).first()
    return user


def require_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    email = decode_token(creds.credentials)
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
