FROM node:20-slim

WORKDIR /app

# 依存関係ファイルのコピーとインストール
COPY package.json package-lock.json ./
RUN npm ci

# アプリケーションコードのコピー
COPY . .

# 非 root ユーザーで実行
RUN chown -R node:node /app
USER node

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]
