import json
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[schemas.ReportOut])
def list_reports(db: Session = Depends(get_db), user=Depends(get_current_user)):
    query = db.query(models.Report)
    if user:
        query = query.filter(models.Report.user_id == user.id)
    rows = query.order_by(models.Report.created_at.desc()).limit(20).all()
    return [{"id": r.id, "title": r.title, "date": r.created_at.strftime("%Y-%m-%d")} for r in rows]


@router.post("/generate")
def generate(payload: schemas.GenerateReportRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Pulls the user's most recent crop recommendation and disease report
    (if any) into one summary record — a real aggregation, not a stub."""
    crop_log = db.query(models.CropRecommendationLog).order_by(models.CropRecommendationLog.created_at.desc()).first()
    disease_log = db.query(models.DiseaseReport).order_by(models.DiseaseReport.created_at.desc()).first()

    summary = {
        "cropRecommendation": {
            "crop": crop_log.crop, "confidence": crop_log.confidence,
        } if crop_log else None,
        "diseaseReport": {
            "disease": disease_log.disease, "severity": disease_log.severity,
        } if disease_log else None,
    }

    report = models.Report(
        user_id=user.id if user else None,
        title=payload.type,
        summary_json=json.dumps(summary),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {"id": report.id, "status": "ready", "title": report.title}


@router.get("/{report_id}/pdf")
def download_pdf(report_id: int, db: Session = Depends(get_db)):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        return {"error": "Report not found"}

    summary = json.loads(report.summary_json)
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 60, "KrishiSahay — Farm Report")
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 80, f"{report.title} · Generated {report.created_at.strftime('%d %b %Y')}")

    y = height - 130
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "Crop Recommendation")
    c.setFont("Helvetica", 11)
    y -= 20
    crop = summary.get("cropRecommendation")
    c.drawString(60, y, f"{crop['crop']} ({crop['confidence']}% confidence)" if crop else "No data yet")

    y -= 40
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "Disease Report")
    c.setFont("Helvetica", 11)
    y -= 20
    disease = summary.get("diseaseReport")
    c.drawString(60, y, f"{disease['disease']} — {disease['severity']} severity" if disease else "No data yet")

    c.showPage()
    c.save()
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="krishisahay-report-{report_id}.pdf"'
    })
