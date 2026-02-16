/**
 * 起動時間パフォーマンステスト
 *
 * SC-004 検証: 100 個のノートがある状態で、起動時間が 3 秒以内であること
 *
 * テスト対象:
 * - T010: 100 個のノートがある状態で、起動時間が 3 秒以内である
 */
import { test, expect } from "@playwright/test";

/**
 * テスト前にすべてのノートを削除してクリーンな状態にする
 */
async function cleanupNotes() {
  try {
    const res = await fetch("http://localhost:8000/notes");
    if (!res.ok) return;
    const data = await res.json();
    if (!data.notes || !Array.isArray(data.notes)) return;
    for (const note of data.notes) {
      await fetch(`http://localhost:8000/notes/${note.id}`, {
        method: "DELETE",
      });
    }
  } catch {
    // テスト環境のクリーンアップ失敗は無視する
  }
}

/**
 * 大規模データを生成（100 個のノートを作成）
 */
async function createBulkNotes(count: number) {
  const promises = [];
  for (let i = 1; i <= count; i++) {
    const promise = fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `テストノート ${i}`,
        content: `# ノート ${i}\n\nこれは ${i} 番目のテストノートです。`,
      }),
    });
    promises.push(promise);
  }
  await Promise.all(promises);
}

test.beforeEach(async () => {
  await cleanupNotes();
});

test.afterAll(async () => {
  await cleanupNotes();
});

// =============================================================================
// T010: 100 個のノートがある状態で、起動時間が 3 秒以内であることをテスト
// =============================================================================
test.describe("SC-004: 大規模データでの起動時間", () => {
  test("T010: 100 個のノートがある状態で、起動時間が 3 秒以内である", async ({
    page,
  }) => {
    // 準備: 100 個のノートを作成
    await createBulkNotes(100);

    // 計測開始: アプリケーションを起動
    const startTime = Date.now();

    await page.goto("/");

    // ノート一覧が表示されるまで待機
    // 最初のノートタイトルが表示されることを確認
    await expect(page.locator("text=テストノート 1")).toBeVisible({
      timeout: 5000,
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // 3 秒（3000ms）以内に起動すること
    expect(loadTime, `起動時間: ${loadTime}ms`).toBeLessThan(3000);

    // ノート一覧が正しく表示されていることを確認
    const noteItems = page.locator('[data-testid="note-item"]');
    const noteCount = await noteItems.count();

    // デフォルトでは最大 20 件が表示される（ページネーション）
    // または 100 件すべてが表示される（実装による）
    expect(noteCount).toBeGreaterThan(0);
    expect(noteCount).toBeLessThanOrEqual(100);
  });

  test("T010-2: 50 個のノートがある状態でも高速に起動する", async ({
    page,
  }) => {
    // 準備: 50 個のノートを作成
    await createBulkNotes(50);

    // 計測開始
    const startTime = Date.now();

    await page.goto("/");

    // ノート一覧が表示されるまで待機
    await expect(page.locator("text=テストノート 1")).toBeVisible({
      timeout: 5000,
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // 50 個のノートでは 2 秒以内に起動すること
    expect(loadTime, `起動時間: ${loadTime}ms`).toBeLessThan(2000);
  });

  test("T010-3: 大規模データ状態でのナビゲーションも高速である", async ({
    page,
  }) => {
    // 準備: 100 個のノートを作成
    await createBulkNotes(100);

    // 最初に一覧ページを表示
    await page.goto("/");
    await expect(page.locator("text=テストノート 1")).toBeVisible();

    // ノート編集画面への遷移時間を計測
    const startTime = Date.now();

    // 最初のノートをクリックして編集画面に遷移
    await page.click("text=テストノート 1");

    // 編集画面が表示されるまで待機
    await expect(page).toHaveURL(/\/notes\/.*\/edit/);
    await expect(page.locator('input[id="note-title"]')).toHaveValue(
      "テストノート 1",
    );

    const endTime = Date.now();
    const navigationTime = endTime - startTime;

    // ナビゲーションも 2 秒以内に完了すること
    expect(navigationTime, `ナビゲーション時間: ${navigationTime}ms`).toBeLessThan(
      2000,
    );
  });

  test("T010-4: 新規作成画面の表示も高速である", async ({ page }) => {
    // 準備: 100 個のノートを作成
    await createBulkNotes(100);

    // 最初に一覧ページを表示
    await page.goto("/");
    await expect(page.locator("text=テストノート 1")).toBeVisible();

    // 新規作成画面への遷移時間を計測
    const startTime = Date.now();

    await page.click("text=新規作成");

    // 新規作成画面が表示されるまで待機
    await expect(page).toHaveURL("/notes/new");
    await expect(page.locator('input[id="note-title"]')).toBeVisible();

    const endTime = Date.now();
    const navigationTime = endTime - startTime;

    // 新規作成画面も 1 秒以内に表示されること
    expect(navigationTime, `新規作成画面表示時間: ${navigationTime}ms`).toBeLessThan(
      1000,
    );
  });
});
