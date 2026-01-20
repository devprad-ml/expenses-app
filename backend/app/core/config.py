from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Expense Tracker"
    API_V1_STR: str = "/api/v1"
    
    # Auth Secrets (CHANGE THESE IN PROD)
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SUPER_SECRET_KEY_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./expenses.db"

    # OpenAI
    OPENAI_API_KEY: str = Field(default="")

    class Config:
        env_file = ".env"

settings = Settings()