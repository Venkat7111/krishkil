from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.database import Base, engine
from app.config import CORS_ORIGINS
from app.routers import auth, crop, disease, weather, market, schemes, reports, news, chat, pages

# Creates tables if they don't exist yet. For a real production rollout,
# swap this for Alembic migrations — left as create_all() here since the
# brief explicitly asked to skip DevOps/migration tooling for now.
Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

app = FastAPI(
    title="KrishiSahay",
    description="KrishiSahay agricultural assistant — FastAPI + Jinja templates.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_ORIGINS != ["*"],  # credentials can't be used with wildcard "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# JSON API routers (same endpoints the React app used)
app.include_router(auth.router)
app.include_router(crop.router)
app.include_router(disease.router)
app.include_router(weather.router)
app.include_router(market.router)
app.include_router(schemes.router)
app.include_router(reports.router)
app.include_router(news.router)
app.include_router(chat.router)

# Jinja HTML UI
app.include_router(pages.router)


@app.get("/sw.js", include_in_schema=False)
def get_service_worker():
    return FileResponse(
        STATIC_DIR / "js" / "sw.js",
        media_type="application/javascript",
        headers={"Service-Worker-Allowed": "/"},
    )


@app.get("/manifest.webmanifest", include_in_schema=False)
@app.get("/manifest.json", include_in_schema=False)
def get_manifest():
    return FileResponse(
        STATIC_DIR / "manifest.webmanifest",
        media_type="application/manifest+json",
    )


@app.get("/favicon.ico", include_in_schema=False)
@app.get("/favicon.svg", include_in_schema=False)
def get_favicon():
    return FileResponse(
        STATIC_DIR / "favicon.svg",
        media_type="image/svg+xml",
    )



@app.get("/api", tags=["meta"])
def api_root():
    return {"status": "ok", "service": "KrishiSahay API", "ui": "jinja"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return templates.TemplateResponse(
            request,
            "not_found.html",
            {"page": "not_found", "active": ""},
            status_code=404,
        )
    return JSONResponse({"detail": "Not Found"}, status_code=404)
