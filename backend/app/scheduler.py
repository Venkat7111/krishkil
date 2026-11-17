"""
Background Email Scheduler for KrishiSahay.
Schedules delayed and recurring email delivery (weather/rain alerts,
daily agronomic advice, disease warnings, scheduled reports) for farmers.
"""

import time
import uuid
import threading
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.email import send_email

logger = logging.getLogger("krishisahay.scheduler")

# In-memory registry of scheduled email jobs
SCHEDULED_JOBS: Dict[str, Dict[str, Any]] = {}


def _run_email_job(job_id: str, recipient: str, subject: str, body_html: str, delay_seconds: int):
    try:
        if delay_seconds > 0:
            logger.info("Email job %s sleeping for %s seconds before sending to %s", job_id, delay_seconds, recipient)
            time.sleep(delay_seconds)

        # Check if cancelled before sending
        job = SCHEDULED_JOBS.get(job_id)
        if job and job.get("status") == "cancelled":
            logger.info("Scheduled email job %s was cancelled before execution.", job_id)
            return

        logger.info("Executing scheduled email job %s for %s", job_id, recipient)
        success = send_email(recipient, subject, body_html)

        if job:
            job["status"] = "completed" if success else "failed"
            job["executed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    except Exception as e:
        logger.error("Error executing scheduled email job %s: %s", job_id, e)
        job = SCHEDULED_JOBS.get(job_id)
        if job:
            job["status"] = "failed"
            job["error"] = str(e)


def schedule_email(
    recipient: str,
    subject: str,
    body_html: str,
    delay_seconds: int = 0
) -> Dict[str, Any]:
    """
    Schedules an email to be sent immediately or after a specified delay in seconds.
    """
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    scheduled_time = datetime.now() + timedelta(seconds=delay_seconds)

    job_data = {
        "job_id": job_id,
        "recipient": recipient,
        "subject": subject,
        "delay_seconds": delay_seconds,
        "status": "scheduled",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "scheduled_for": scheduled_time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    SCHEDULED_JOBS[job_id] = job_data

    thread = threading.Thread(
        target=_run_email_job,
        args=(job_id, recipient, subject, body_html, delay_seconds),
        daemon=True
    )
    thread.start()

    logger.info("Successfully scheduled email job %s for %s in %s seconds", job_id, recipient, delay_seconds)
    return job_data


def list_scheduled_jobs() -> List[Dict[str, Any]]:
    return list(SCHEDULED_JOBS.values())


def cancel_scheduled_job(job_id: str) -> bool:
    job = SCHEDULED_JOBS.get(job_id)
    if job and job["status"] == "scheduled":
        job["status"] = "cancelled"
        return True
    return False
