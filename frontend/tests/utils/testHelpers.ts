/**
 * テストヘルパー関数
 *
 * T025: テストで再利用可能なユーティリティ関数を提供
 * - 大規模データ生成: 100 個のノートを API 経由で作成する関数
 * - ネットワークエラーシミュレーション: Playwright の route.abort() をラップした関数
 * - 時間計測ユーティリティ: パフォーマンステストで再利用可能な計測関数
 */

import type { Page, Route } from "@playwright/test";

/**
 * 大規模データを生成（指定された数のノートを作成）
 *
 * @param count - 作成するノートの数（デフォルト: 100）
 * @param baseUrl - API のベース URL（デフォルト: http://localhost:8000）
 * @returns 作成されたノートの配列
 *
 * @example
 * ```typescript
 * // 100 個のノートを作成
 * await createBulkNotes(100);
 *
 * // 50 個のノートを作成
 * await createBulkNotes(50);
 * ```
 */
export function createBulkNotes(
  count: number = 100,
  baseUrl: string = "http://localhost:8000",
): Promise<unknown[]> {
  const promises = [];
  for (let i = 1; i <= count; i++) {
    const promise = fetch(`${baseUrl}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `テストノート ${i}`,
        content: `# ノート ${i}\n\nこれは ${i} 番目のテストノートです。`,
      }),
    }).then((res) => res.json());
    promises.push(promise);
  }
  return Promise.all(promises);
}

/**
 * すべてのノートを削除してクリーンな状態にする
 *
 * @param baseUrl - API のベース URL（デフォルト: http://localhost:8000）
 *
 * @example
 * ```typescript
 * // テスト前のクリーンアップ
 * await cleanupNotes();
 * ```
 */
export async function cleanupNotes(
  baseUrl: string = "http://localhost:8000",
): Promise<void> {
  try {
    const res = await fetch(`${baseUrl}/notes`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.notes || !Array.isArray(data.notes)) return;
    const deletePromises = data.notes.map((note: { id: string }) =>
      fetch(`${baseUrl}/notes/${note.id}`, { method: "DELETE" }),
    );
    await Promise.all(deletePromises);
  } catch {
    // テスト環境のクリーンアップ失敗は無視する
  }
}

/**
 * ネットワークエラーをシミュレートする
 *
 * @param page - Playwright の Page オブジェクト
 * @param urlPattern - エラーをシミュレートする URL パターン（デフォルト: すべての /notes リクエスト）
 * @param method - エラーをシミュレートする HTTP メソッド（オプション）
 *
 * @example
 * ```typescript
 * // すべての /notes リクエストでネットワークエラーをシミュレート
 * await simulateNetworkError(page);
 *
 * // GET /notes のみエラーをシミュレート
 * await simulateNetworkError(page, "/notes", "GET");
 *
 * // POST /notes のみエラーをシミュレート
 * await simulateNetworkError(page, "/notes", "POST");
 * ```
 */
export async function simulateNetworkError(
  page: Page,
  urlPattern: string = "**/notes**",
  method?: string,
): Promise<void> {
  await page.route(urlPattern, (route: Route) => {
    if (method && route.request().method() !== method) {
      route.continue();
    } else {
      route.abort("failed");
    }
  });
}

/**
 * サーバーエラーをシミュレートする（500 Internal Server Error）
 *
 * @param page - Playwright の Page オブジェクト
 * @param urlPattern - エラーをシミュレートする URL パターン
 * @param method - エラーをシミュレートする HTTP メソッド（オプション）
 * @param statusCode - エラーステータスコード（デフォルト: 500）
 * @param errorMessage - エラーメッセージ（デフォルト: "Internal Server Error"）
 *
 * @example
 * ```typescript
 * // GET /notes で 500 エラーをシミュレート
 * await simulateServerError(page, "/notes", "GET");
 *
 * // POST /notes で 500 エラーをシミュレート
 * await simulateServerError(page, "/notes", "POST", 500, "Failed to create note");
 * ```
 */
export async function simulateServerError(
  page: Page,
  urlPattern: string,
  method?: string,
  statusCode: number = 500,
  errorMessage: string = "Internal Server Error",
): Promise<void> {
  await page.route(urlPattern, (route: Route) => {
    if (method && route.request().method() !== method) {
      route.continue();
    } else {
      route.fulfill({
        status: statusCode,
        contentType: "application/json",
        body: JSON.stringify({ detail: errorMessage }),
      });
    }
  });
}

/**
 * 時間を計測する非同期関数を実行するラッパー
 *
 * @param fn - 計測する非同期関数
 * @returns 実行時間（ミリ秒）
 *
 * @example
 * ```typescript
 * const executionTime = await measureTime(async () => {
 *   await page.goto("/");
 *   await page.click("text=新規作成");
 * });
 * console.log(`実行時間: ${executionTime}ms`);
 * ```
 */
export async function measureTime(fn: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await fn();
  const endTime = Date.now();
  return endTime - startTime;
}

/**
 * 指定された時間内に関数が完了することをアサートする
 *
 * @param fn - 計測する非同期関数
 * @param maxTime - 最大許容時間（ミリ秒）
 * @returns 実行時間（ミリ秒）と成功フラグ
 *
 * @example
 * ```typescript
 * const { time, success } = await assertCompletesWithin(async () => {
 *   await page.goto("/");
 * }, 3000);
 * expect(success).toBe(true);
 * ```
 */
export async function assertCompletesWithin(
  fn: () => Promise<void>,
  maxTime: number,
): Promise<{ time: number; success: boolean }> {
  const time = await measureTime(fn);
  return {
    time,
    success: time < maxTime,
  };
}

/**
 * テスト用のランダムなノートデータを生成する
 *
 * @param index - ノートのインデックス（オプション）
 * @returns ノートのタイトルと本文
 *
 * @example
 * ```typescript
 * const { title, content } = generateRandomNote(1);
 * // { title: "テストノート 1", content: "# ノート 1\n\nこれは 1 番目のテストノートです。" }
 * ```
 */
export function generateRandomNote(index?: number): {
  title: string;
  content: string;
} {
  const idx = index ?? Math.floor(Math.random() * 1000);
  return {
    title: `テストノート ${idx}`,
    content: `# ノート ${idx}\n\nこれは ${idx} 番目のテストノートです。`,
  };
}

/**
 * 長文のテキストを生成する
 *
 * @param charCount - 生成する文字数
 * @returns 生成されたテキスト
 *
 * @example
 * ```typescript
 * const largeText = generateLargeText(10000);
 * // 約 10,000 文字のテキストを生成
 * ```
 */
export function generateLargeText(charCount: number): string {
  const line =
    "# テスト見出し\n\nこれは長いテキストのテストです。パフォーマンスを確認します。\n\n";
  let text = "";
  while (text.length < charCount) {
    text += line;
  }
  return text.substring(0, charCount);
}
