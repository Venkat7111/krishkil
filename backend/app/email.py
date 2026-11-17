"""
SMTP Email Delivery Utility for KrishiSahay.
Sends direct emails to farmers (Welcome emails, OTP verification codes,
password resets, and PDF agronomic reports) using merugusai112233@gmail.com / SMTP.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import formataddr
from typing import Optional

from app.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL
)

logger = logging.getLogger("krishisahay.email")

DEFAULT_SENDER = SMTP_USER or "merugusai112233@gmail.com"
FROM_ADDR = SMTP_FROM_EMAIL or DEFAULT_SENDER


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str = "",
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None
) -> bool:
    """
    Sends an email to target address using configured SMTP server (Gmail SMTP).
    Uses email.utils.formataddr for official header formatting.
    """
    if not to_email or "@" not in to_email:
        logger.warning("Invalid target email address: %s", to_email)
        return False

    sender_email = SMTP_USER or DEFAULT_SENDER
    sender_password = SMTP_PASSWORD

    if not sender_password:
        logger.info(
            "SMTP_PASSWORD is not set in backend/.env. "
            "To send live emails to users, set SMTP_PASSWORD to your Gmail App Password in .env file."
        )
        logger.info("[MOCK EMAIL DELIVERED] To: %s | Subject: %s", to_email, subject)
        return True

    msg = MIMEMultipart("alternative")
    msg["From"] = formataddr(("KrishiSahay AI", sender_email))
    msg["To"] = to_email
    msg["Subject"] = subject

    if text_content:
        msg.attach(MIMEText(text_content, "plain", "utf-8"))
    
    if html_content:
        msg.attach(MIMEText(html_content, "html", "utf-8"))

    if attachment_bytes and attachment_filename:
        part = MIMEApplication(attachment_bytes, Name=attachment_filename)
        part["Content-Disposition"] = f'attachment; filename="{attachment_filename}"'
        msg.attach(part)

    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=12) as server:
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=12) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, [to_email], msg.as_string())

        logger.info("Successfully sent email to %s (Subject: %s)", to_email, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False


def send_welcome_email(to_email: str, full_name: str) -> bool:
    subject = "🌱 Welcome to KrishiSahay AI Agronomist Platform!"
    html = f"""
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border-top: 4px solid #16a34a;">
          <h2 style="color: #16a34a; margin-top: 0;">Namaste {full_name}! Welcome to KrishiSahay</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Thank you for registering with <strong>KrishiSahay AI Agronomist Platform</strong>.
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            You now have full access to:
          </p>
          <ul style="color: #334155; font-size: 14px; line-height: 1.8;">
            <li>🤖 <strong>RAG AI Chatbot</strong>: Instant expert answers on NPK fertilizers, crops, and pesticides.</li>
            <li>🍃 <strong>Plant Disease Vision Diagnosis</strong>: Upload leaf photos for instant disease detection.</li>
            <li>📚 <strong>Package of Practices (PoP) Handbook</strong>: Download complete crop fertilizer & pesticide guides.</li>
            <li>📊 <strong>Live Mandi Prices & Scheduled Weather Alerts</strong>.</li>
          </ul>
          <div style="margin-top: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; color: #166534; font-size: 13px; font-weight: bold;">
              Certified Agronomic Guidance for Farmers Across India.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
            Sent by KrishiSahay System • Official Support Email: merugusai112233@gmail.com
          </p>
        </div>
      </body>
    </html>
    """
    return send_email(to_email, subject, html)


def send_otp_email(to_email: str, otp_code: str) -> bool:
    subject = f"🔑 {otp_code} is your KrishiSahay Verification Code"
    html = f"""
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border-top: 4px solid #2563eb;">
          <h3 style="color: #1e293b; margin-top: 0;">Verification Code Request</h3>
          <p style="color: #475569; font-size: 14px;">
            Your 6-digit verification / password reset OTP code for KrishiSahay is:
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px border-blue-200;">
              {otp_code}
            </span>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            This OTP code will expire in 10 minutes. If you did not request this code, please ignore this email.
          </p>
        </div>
      </body>
    </html>
    """
    return send_email(to_email, subject, html)


def send_report_email(to_email: str, report_title: str, summary_html: str, pdf_bytes: Optional[bytes] = None) -> bool:
    subject = f"📋 KrishiSahay Farm Report: {report_title}"
    html = f"""
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border-top: 4px solid #16a34a;">
          <h2 style="color: #16a34a; margin-top: 0;">🌱 KrishiSahay Farm Diagnostic Report</h2>
          <p style="color: #334155; font-size: 14px;">
            Here is your official agronomic report for <strong>{report_title}</strong>.
          </p>
          <div style="margin: 20px 0; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            {summary_html}
          </div>
          <p style="color: #64748b; font-size: 13px;">
            Attached is your downloadable PDF report handbook.
          </p>
        </div>
      </body>
    </html>
    """
    return send_email(
        to_email=to_email,
        subject=subject,
        html_content=html,
        attachment_bytes=pdf_bytes,
        attachment_filename=f"KrishiSahay_{report_title.replace(' ', '_')}.pdf" if pdf_bytes else None
    )
