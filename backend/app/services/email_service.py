"""
Vestora Backend — Email service for OTP delivery via SMTP.
Production-ready with async sending, HTML templates, and error handling.
"""

import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import aiosmtplib
from app.config import settings

logger = logging.getLogger(__name__)


async def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Send a 6-digit OTP code to the user's email via SMTP.
    Returns True on success, False on failure (caller handles fallback).
    """
    if not settings.smtp_enabled or not settings.smtp_host:
        logger.warning("SMTP not configured — OTP email not sent to %s", to_email)
        # In development, log OTP to console for testing
        if settings.environment == "development":
            logger.info("DEV OTP for %s: %s", to_email, otp_code)
            print(f"\n{'='*50}")
            print(f"  DEV OTP for {to_email}: {otp_code}")
            print(f"{'='*50}\n")
        return True

    subject = f"Vestora — Your login code is {otp_code}"

    digits = "&nbsp;&nbsp;".join(list(otp_code))

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="400" cellpadding="0" cellspacing="0" style="max-width: 400px; width: 100%;">
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 32px;">
                  <div style="display: inline-block; background: #4f46e5; border-radius: 14px; width: 48px; height: 48px; line-height: 48px; text-align: center;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700;">V</span>
                  </div>
                </td>
              </tr>
              <!-- Card -->
              <tr>
                <td style="background: #ffffff; border-radius: 16px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #18181b; text-align: center;">
                    Your verification code
                  </h1>
                  <p style="margin: 0 0 28px; font-size: 14px; color: #71717a; text-align: center; line-height: 1.5;">
                    Enter this code to sign in to Vestora
                  </p>
                  <!-- OTP Code -->
                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #18181b; font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">{digits}</span>
                  </div>
                  <!-- Expiry -->
                  <p style="margin: 0 0 4px; font-size: 13px; color: #71717a; text-align: center; line-height: 1.5;">
                    This code expires in <strong style="color: #18181b;">{settings.otp_expire_minutes} minutes</strong>
                  </p>
                  <!-- Divider -->
                  <div style="border-top: 1px solid #f0f0f0; margin: 24px 0 20px;"></div>
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center; line-height: 1.5;">
                    If you didn&rsquo;t request this code, you can safely ignore this email. Someone may have typed your email address by mistake.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td align="center" style="padding-top: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                    &copy; Vestora &mdash; Your AI Style Companion
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    plain_body = (
        f"Your Vestora login code is: {otp_code}\n\n"
        f"This code expires in {settings.otp_expire_minutes} minutes.\n"
        f"If you didn't request this, ignore this email."
    )

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        # smtp_tls=True means direct TLS (port 465), False means STARTTLS (port 587)
        use_tls = settings.smtp_tls
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            use_tls=use_tls,
            start_tls=not use_tls,
            timeout=15,
        )
        logger.info("OTP email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send OTP email to %s: %s", to_email, str(e))
        return False
