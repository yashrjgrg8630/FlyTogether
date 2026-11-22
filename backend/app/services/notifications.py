import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from ..config import settings
from ..models import NotificationModel, UserModel

logger = logging.getLogger("flytogether.notifications")

def send_external_email(recipient_email: str, subject: str, text_body: str):
    """Sends email via configured provider or logs to console for local development."""
    if settings.EMAIL_PROVIDER == "smtp" and settings.SMTP_HOST and settings.SMTP_USER:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.FROM_EMAIL
            msg["To"] = recipient_email
            msg.attach(MIMEText(text_body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD or "")
                server.sendmail(settings.FROM_EMAIL, recipient_email, msg.as_string())
            logger.info(f"Email successfully delivered to {recipient_email}")
        except Exception as e:
            logger.error(f"Failed to deliver SMTP email to {recipient_email}: {e}")
    else:
        # Dev & Staging: Safe console output (no external chargeable calls)
        logger.info(
            f"[NOTIFICATION DISPATCH - {settings.EMAIL_PROVIDER.upper()}]\n"
            f"To: {recipient_email}\n"
            f"Subject: {subject}\n"
            f"Body:\n{text_body}\n"
            f"{'-'*40}"
        )

def dispatch_notification(
    db: Session,
    user: UserModel,
    title: str,
    message: str,
    link: Optional[str] = None,
    email_subject: Optional[str] = None,
    email_body: Optional[str] = None,
) -> NotificationModel:
    """
    Creates an in-app NotificationModel and dispatches an external email notification.
    Preserves privacy: email is sent only to the authenticated user.
    """
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    notif = NotificationModel(
        user_id=user.id,
        title=title,
        message=message,
        read=False,
        link=link,
        created_at=now_str,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Dispatch external notification
    subject = email_subject or f"FlyTogether Update: {title}"
    body = email_body or (
        f"Hi {user.full_name},\n\n"
        f"{message}\n\n"
        f"FlyTogether aggregates demand. It does not sell tickets or reserve seats.\n\n"
        f"View details in your dashboard: https://flytogether.antideploy.app{link or '/dashboard'}"
    )
    send_external_email(user.email, subject, body)
    return notif
