import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current directory and parent project directories
for env_candidate in [
    Path.cwd() / ".env",
    Path(__file__).resolve().parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent / ".env",
]:
    if env_candidate.exists():
        load_dotenv(env_candidate)
        break


# Falls back to a local SQLite file when DATABASE_URL isn't set, purely so
# the API can be started for development/testing without installing
# Postgres first. Set DATABASE_URL to a postgresql+psycopg2://... string
# (see .env.example) to run against real Postgres.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
# Render and other cloud providers give postgres:// URLs; normalize for SQLAlchemy 2.x
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg2" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN", "")

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# Allow local dev and production deployment origins (Render / Vercel)
raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,*")
CORS_ORIGINS = [o.strip() for o in raw_cors.split(",") if o.strip()]

# SMTP & Mail configuration for farmer weather/rain alerts
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USER", "alerts@krishisahay.org"))



