"""
Vestora Backend — Configuration via environment variables.
Uses Pydantic BaseSettings for type-safe config with .env support.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "vestora"

    # JWT Auth
    jwt_secret_key: str = "change-me-to-a-random-secret-string"
    jwt_refresh_secret_key: str = "change-me-refresh-secret-string"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    # us.inc AI API
    usinc_api_key: str = ""
    usinc_base_url: str = "https://api.us.inc/usf/v1"
    usinc_llm_model: str = "usf-mini"
    usinc_image_model: str = "usf-mini-image"

    # Weather (Google Maps Weather API)
    gcp_api_key: str = ""

    # AWS S3 Image Storage (private bucket — signed URLs)
    aws_region: str = "ap-southeast-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    s3_bucket_name: str = ""
    s3_signed_url_expiry: int = 3600  # seconds

    # OTP Email (SMTP)
    smtp_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_tls: bool = True
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "Vestora"
    otp_expire_minutes: int = 5
    otp_max_attempts: int = 3
    otp_rate_limit_per_hour: int = 5

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:3000"

    # Environment
    environment: str = "development"  # "production" for HTTPS cookies

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


settings = Settings()
