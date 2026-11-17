"""Jinja HTML page routes — same UI surface as the former React app."""
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter(tags=["pages"])


def _page(request: Request, name: str, page: str, active: Optional[str] = None, status_code: int = 200):
    return templates.TemplateResponse(
        request,
        name,
        {"page": page, "active": active or ""},
        status_code=status_code,
    )


@router.get("/", response_class=HTMLResponse)
def splash(request: Request):
    return _page(request, "splash.html", "splash")


@router.get("/welcome", response_class=HTMLResponse)
def welcome(request: Request):
    return _page(request, "welcome.html", "welcome")


@router.get("/login", response_class=HTMLResponse)
def login(request: Request):
    return _page(request, "auth/login.html", "login")


@router.get("/register", response_class=HTMLResponse)
def register(request: Request):
    return _page(request, "auth/register.html", "register")


@router.get("/forgot-password", response_class=HTMLResponse)
def forgot_password(request: Request):
    return _page(request, "auth/forgot_password.html", "forgot")


@router.get("/otp-verification", response_class=HTMLResponse)
def otp_verification(request: Request):
    return _page(request, "auth/otp.html", "otp")


@router.get("/reset-password", response_class=HTMLResponse)
def reset_password(request: Request):
    return _page(request, "auth/reset_password.html", "reset")


@router.get("/app", response_class=HTMLResponse)
@router.get("/app/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    active = "/app" if request.url.path.rstrip("/").endswith("/app") else "/app/dashboard"
    return _page(request, "app/dashboard.html", "dashboard", active=active)


@router.get("/app/chat", response_class=HTMLResponse)
def chat(request: Request):
    return _page(request, "app/chat.html", "chat", active="/app/chat")


@router.get("/app/disease-detection", response_class=HTMLResponse)
def disease(request: Request):
    return _page(request, "app/disease.html", "disease", active="/app/disease-detection")


@router.get("/app/crop-recommendation", response_class=HTMLResponse)
def crop(request: Request):
    return _page(request, "app/crop.html", "crop", active="/app/crop-recommendation")


@router.get("/app/weather", response_class=HTMLResponse)
def weather(request: Request):
    return _page(request, "app/weather.html", "weather", active="/app/weather")


@router.get("/app/irrigation", response_class=HTMLResponse)
def irrigation(request: Request):
    return _page(request, "app/irrigation.html", "irrigation", active="/app/irrigation")


@router.get("/app/fertilizer", response_class=HTMLResponse)
def fertilizer(request: Request):
    return _page(request, "app/fertilizer.html", "fertilizer", active="/app/fertilizer")


@router.get("/app/market", response_class=HTMLResponse)
def market(request: Request):
    return _page(request, "app/market.html", "market", active="/app/market")


@router.get("/app/news", response_class=HTMLResponse)
def news(request: Request):
    return _page(request, "app/news.html", "news", active="/app/news")


@router.get("/app/schemes", response_class=HTMLResponse)
def schemes(request: Request):
    return _page(request, "app/schemes.html", "schemes", active="/app/schemes")


@router.get("/app/reports", response_class=HTMLResponse)
def reports(request: Request):
    return _page(request, "app/reports.html", "reports", active="/app/reports")


@router.get("/app/profile", response_class=HTMLResponse)
def profile(request: Request):
    return _page(request, "app/profile.html", "profile", active="/app/profile")


@router.get("/app/settings", response_class=HTMLResponse)
def settings(request: Request):
    return _page(request, "app/settings.html", "settings", active="/app/settings")


@router.get("/offline", response_class=HTMLResponse)
def offline(request: Request):
    return _page(request, "offline.html", "offline")

