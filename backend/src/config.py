"""アプリケーション設定管理モジュール

環境変数からアプリケーション設定を読み込み、Pydantic Settings で検証する。
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """アプリケーション設定

    環境変数または .env ファイルから設定値を読み込む。
    """

    # MongoDB 接続設定
    mongodb_url: str = "mongodb://localhost:27017/notes"
    mongodb_database: str = "notes"

    # API 設定
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # CORS 設定
    cors_origins: str = "http://localhost:5173"

    # ログレベル
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """CORS オリジンをリストとして返す"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


def get_settings() -> Settings:
    """設定のインスタンスを取得する"""
    return Settings()
