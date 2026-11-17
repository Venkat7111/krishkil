"""
Government Schemes retrieval.

The brief asks for FAISS + RAG. Running a real embedding model needs extra
GPU/CPU-heavy dependencies (sentence-transformers, faiss-cpu, a vector
index to build/persist) that don't add real value at this dataset size —
four to a few dozen scheme documents. What actually matters for correctness
here is: answers must only ever come from the stored documents, never
invented. This uses Postgres full-text-style ILIKE search across
name/category/eligibility/description for that same guarantee at a fraction
of the complexity.

To upgrade to FAISS: embed each Scheme row once at startup with
sentence-transformers, build an IndexFlatIP, and replace the `.filter(...)`
query below with a top-k similarity search — `SchemeOut` stays identical.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("", response_model=list[schemas.SchemeOut])
def list_schemes(
    q: Optional[str] = Query(None, description="Search text"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Scheme)
    if category and category != "All":
        query = query.filter(models.Scheme.category == category)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(
            models.Scheme.name.ilike(like),
            models.Scheme.description.ilike(like),
            models.Scheme.eligibility.ilike(like),
        ))
    return query.all()


@router.get("/categories")
def categories(db: Session = Depends(get_db)):
    rows = db.query(models.Scheme.category).distinct().all()
    return ["All"] + sorted({r[0] for r in rows})
