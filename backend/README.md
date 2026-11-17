# KrishiSahay Backend

FastAPI + PostgreSQL backend for the KrishiSahay frontend.

## What's real vs. simplified (read this first)

The original brief calls for Gemini 2.5 Flash, a Hugging Face CLIP ViT
disease model, LangGraph agents, FAISS/RAG, and Whisper voice — that stack
needs paid API keys and GPU-friendly infra that can't be provisioned here.
Everything below is a genuinely working substitute, not a stub, with a
documented upgrade path in each router's docstring:

| Feature | This backend does | Upgrade path |
|---|---|---|
| Crop recommendation | Rule-based nearest-match scorer over a reference table | Train RandomForest/XGBoost, load the pickle in `crop.py` |
| **Disease detection** | **Real Hugging Face model** (`linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`, MobileNetV2 fine-tuned on the 38-class PlantVillage dataset) via `transformers`. Falls back to a Pillow color-heuristic automatically if torch/transformers aren't installed or the model can't be downloaded, so the endpoint never hard-fails. | Swap `HF_MODEL_ID` in `disease.py` for a larger/more accurate checkpoint (e.g. a ViT or ConvNeXt fine-tune) — no other code changes needed |
| Weather | Live Open-Meteo API (no key needed) | Swap in OpenWeather if `OPENWEATHER_API_KEY` is set |
| Market prices | Real Postgres table, seeded | Connect Agmarknet/eNAM on a schedule |
| Government Schemes | Postgres keyword/ILIKE search (answers only from stored docs, like RAG requires) | Add `sentence-transformers` + FAISS index |
| Reports | Real aggregation of your latest crop/disease records + generated PDF (reportlab) | Add more sections as more agents come online |
| **News (new)** | **Live RSS aggregation via `feedparser` from public agriculture feeds** | Add more feeds to `NEWS` list in `news.py` |
| AI Chat, voice, LangGraph agents | Not built — needs Gemini/Whisper keys and an agent runtime | See "Roadmap" below |

### About the disease detection model

- First request downloads and caches `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`
  (~14MB) from Hugging Face — needs internet access on first run only.
- If `torch`/`transformers` aren't installed, or the download fails (offline
  environment, firewall, etc.), the endpoint automatically falls back to a
  simpler Pillow-based leaf-discoloration heuristic and logs exactly why —
  it never crashes, just runs in a lower-fidelity mode.
- CPU inference is fine for this model size — no GPU required.
- To use the real model, make sure `torch` and `transformers` from
  `requirements.txt` are installed (see the CPU-wheel note in that file if
  you want a much smaller torch download).

## Requirements

- Python 3.11+
- PostgreSQL 14+ (or just run it against SQLite for a zero-config local test — see below)

## 1. Set up PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@16 && brew services start postgresql@16
# Ubuntu/Debian
sudo apt install postgresql && sudo service postgresql start

# then create the database
createdb krishisahay
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/krishisahay
JWT_SECRET_KEY=<generate a long random string>
```

(If you skip this file entirely, the app falls back to a local `dev.db`
SQLite file — handy for a quick test drive, but use real Postgres for
anything beyond that.)

## 3. Install & run

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python -m app.seed_data          # creates tables + seeds market/scheme data
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Endpoints

```
POST /auth/register            POST /auth/login
POST /crop/recommend
POST /disease/analyze          (multipart file upload)
GET  /weather/current  /hourly  /weekly  /alerts
GET  /market/prices  /nearby  /trend
GET  /schemes                  ?q=&category=
GET  /reports                  POST /reports/generate   GET /reports/{id}/pdf
GET  /news                     ?limit=&refresh=true      ← new RSS section
```

## Roadmap (not built, by design, in this pass)

- **Gemini 2.5 Flash** explanations for disease/weather/market — add
  `GEMINI_API_KEY`, install `google-generativeai`, and replace the
  templated text blocks (clearly marked in `disease.py`/`weather.py`).
- **LangGraph Supervisor Agent** orchestrating independent agents — the
  routers here are already split one-feature-per-file so each can become
  a LangGraph node without restructuring.
- **FAISS + embeddings** for schemes — see the docstring in `schemes.py`.
- **Whisper / TTS voice assistant** — needs an audio pipeline and is
  independent of everything above; add a `/voice` router when ready.

No Docker/deployment tooling is included here per your request — just the
plain local run commands above.
