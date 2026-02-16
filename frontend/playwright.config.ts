import { defineConfig } from "@playwright/test";

/**
 * Playwright テスト設定
 *
 * E2E テスト用の Playwright 設定。
 * フロントエンド開発サーバーは webServer 設定で自動起動する。
 * バックエンドAPI (localhost:8000) と MongoDB が起動している前提で実行する。
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: [
    "e2e/**/*.spec.ts",
    "performance/**/*.spec.ts",
    "a11y/**/*.spec.ts",
  ],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
