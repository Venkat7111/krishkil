# KrishiSahay — All-in-One Fullstack AI Agricultural Platform (FastAPI + Jinja2 + PWA)

**KrishiSahay** is unified into a single fullstack application folder. The frontend (Jinja2 templates + PWA) and backend (FastAPI + ML models + SQLite/Postgres) run together as **one single web service**, eliminating separate frontend deployments, CORS issues, and dual-server configuration.

---

## 🚀 Key Architectural Highlights

1. **One Folder Fullstack**: Frontend and backend are bundled in a single service. FastAPI serves the Jinja2 HTML templates, static CSS/JS, and REST API endpoints simultaneously from the same origin.
2. **Progressive Web App (PWA)**:
   - **Installable**: Install KrishiSahay directly onto Android, iOS, Windows, and macOS as a standalone app (via the in-app "Install App" button or browser prompt).
   - **Offline Mode**: A custom Service Worker (`/sw.js`) precaches the app shell, static assets, and cached pages. If the internet drops, users see the friendly `/offline` fallback page with access to previously loaded farm data.
   - **PWA Manifest & Icons**: Includes `/static/manifest.webmanifest`, SVG and high-resolution icons (192px, 512px, maskable, apple-touch-icon).
3. **Render-Ready**:
   - Zero-configuration deployment with root `render.yaml` (Blueprint) or manual Web Service.
   - Optimized for Render's free tier with CPU-only PyTorch wheels (avoids 2.5 GB CUDA wheel download timeouts and memory crashes).
   - Automatic Render PostgreSQL connection string normalization (`postgres://` → `postgresql+psycopg2://`).
   - Dynamic port binding (`$PORT`) and built-in `/health` health-check endpoint.

---

## 🛠️ Deploying to Render (2 Easy Methods)

### Method 1: Render Blueprint (Recommended — 1 Click)

1. Push this repository to **GitHub**.
2. Log in to [Render](https://render.com) and click **New +** → **Blueprint**.
3. Select your repository. Render will automatically detect the root `render.yaml` file.
4. Fill in optional environment variables (like `GEMINI_API_KEY` for AI vision and chat) and click **Apply**.
5. Render will build and deploy the entire fullstack app as a single service!

---

### Method 2: Manual Web Service

1. In Render Dashboard, click **New +** → **Web Service** → connect your repo.
2. Configure settings:
   - **Name**: `krishisahay`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python seed_data.py || true`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - *(Note: If you prefer setting Root Directory to `backend`, use `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)*
3. Add Environment Variables under **Environment**:
   - `PYTHON_VERSION`: `3.11.10`
   - `JWT_SECRET_KEY`: *(click "Generate" or enter a random string)*
   - `DATABASE_URL`: *(optional — omit for SQLite, or paste Render Postgres URL)*
   - `GEMINI_API_KEY`: *(optional — for disease detection & AI chat)*
   - `HF_TOKEN`: *(optional — Hugging Face token)*
   - `SMTP_USER` / `SMTP_PASSWORD`: *(optional — for rain alert emails)*
   - `CORS_ORIGINS`: `*`
4. Click **Deploy Web Service**.

---

## 💻 Run Locally

```bash
# 1. Create and activate a Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

# 2. Install dependencies (CPU PyTorch + FastAPI stack)
pip install -r requirements.txt

# 3. Setup environment variables (optional for local dev; SQLite is used by default)
cp .env.example .env

# 4. Seed initial reference data (mandi prices, schemes, markets)
python seed_data.py

# 5. Start the fullstack development server
uvicorn main:app --reload --port 8000
```

Open your browser at:
- **Application**: http://localhost:8000 (starts at splash screen → welcome → dashboard)
- **Interactive API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **PWA Service Worker**: http://localhost:8000/sw.js
- **PWA Manifest**: http://localhost:8000/manifest.webmanifest

---

## 📱 Progressive Web App (PWA) Capabilities

- **Desktop & Mobile Install**: When visiting the app, an "Install App" button appears in the sidebar and welcome page. Users can install it directly to their home screen or dock.
- **Offline Resiliency**: When offline, the app displays a non-intrusive status pill ("Offline Mode — viewing cached farm data") and automatically notifies when the device comes back online.
- **Offline Fallback Page**: Navigating to unvisited pages while disconnected serves `/offline` with tips and a connection re-checker.

---

## 📂 Project Structure

```
krishisahay-fullstack/
├── render.yaml              # Render blueprint deployment specification
├── requirements.txt         # CPU-optimized Python dependencies
├── Procfile                 # Process launcher for cloud platforms
├── main.py                  # Root application entry point
├── seed_data.py             # Database seed runner
├── .env.example             # Example environment configuration
├── README.md                # Project documentation
│
├── backend/                 # Core Fullstack Application Directory
│   ├── app/
│   │   ├── main.py          # FastAPI application factory & PWA routes
│   │   ├── database.py      # SQLAlchemy engine & session factory
│   │   ├── config.py        # Settings, env vars, Postgres URL auto-normalizer
│   │   ├── models.py        # Database ORM models
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   ├── security.py      # Password hashing & JWT auth
│   │   ├── seed_data.py     # Default crops, mandi prices, and schemes
│   │   ├── email.py         # Weather & rain alert email dispatcher
│   │   ├── routers/         # API & Page Route Handlers
│   │   │   ├── pages.py     # Jinja2 HTML page endpoints
│   │   │   ├── auth.py      # User authentication & OTP verification
│   │   │   ├── crop.py      # Crop recommendation ML engine
│   │   │   ├── disease.py   # Plant disease detection (Gemini / HF / Heuristic)
│   │   │   ├── weather.py   # Open-Meteo forecast & irrigation prediction
│   │   │   ├── market.py    # Mandi prices & markets
│   │   │   ├── schemes.py   # Government schemes database
│   │   │   ├── reports.py   # Farm PDF report generator
│   │   │   ├── news.py      # Agricultural news feeds
│   │   │   └── chat.py      # AI Agronomist chat
│   │   ├── static/          # Static Assets & PWA
│   │   │   ├── css/app.css  # Responsive styling & themes
│   │   │   ├── js/          # Frontend client scripts (api.js, app.js, pages.js, i18n.js)
│   │   │   ├── js/sw.js     # PWA Service Worker (offline cache & network strategies)
│   │   │   ├── icons/       # PWA icons (192px, 512px, maskable, apple-touch-icon)
│   │   │   ├── manifest.webmanifest # PWA Web App Manifest
│   │   │   └── favicon.svg  # App icon
│   │   └── templates/       # Jinja2 HTML Templates
│   │       ├── base.html    # Base HTML with PWA meta & SW registration
│   │       ├── offline.html # Offline fallback screen
│   │       ├── splash.html  # Splash screen
│   │       ├── welcome.html # Landing / onboarding screen
│   │       ├── auth/        # Login, Register, Forgot Password, OTP, Reset
│   │       ├── layouts/     # Main app shell & auth shell
│   │       └── app/         # Dashboard, Chat, Disease, Crops, Weather, Market, etc.
│   ├── model.pkl            # Trained Crop Recommendation model
│   └── irrigation_model.pkl # Trained Irrigation schedule model
│
└── frontend/                # [Archived] Legacy React frontend kept for reference
```

---

## 🌾 Features Included

| Area | Implementation |
|------|----------------|
| **UI & UX** | Jinja2 templates matching modern mobile-first UI with Dark/Light themes |
| **PWA** | Service Worker, Manifest, Offline fallback, Install prompts, Homescreen icons |
| **Authentication** | Registration, Login, OTP verification, Password Reset, Guest Mode |
| **Disease Detection** | Leaf image upload → Gemini Vision AI / HuggingFace MobileNetV2 / Heuristic |
| **Crop Recommendation** | Soil (N, P, K, pH) & Weather ML model with profit/yield metadata |
| **Weather & Irrigation** | Real-time weather, rain alert emails, ML irrigation predictor |
| **Fertilizer & PoP** | Package of Practices & fertilizer guidance |
| **Market Rates** | Live Mandi prices with search, filtering, and nearest market distances |
| **Agricultural News** | Live farmer news headlines & articles |
| **Govt Schemes** | Searchable government farmer welfare schemes |
| **PDF Farm Reports** | Downloadable PDF reports with farm health summaries |
| **AI Agronomist Chat** | Agricultural assistant chat powered by Google Gemini |
