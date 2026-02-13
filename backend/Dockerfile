FROM python:3.11-slim

WORKDIR /app

# システム依存パッケージのインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルのコピーとインストール
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# アプリケーションコードのコピー
COPY src/ ./src/

# 非 root ユーザーで実行
RUN useradd --create-home --uid 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
