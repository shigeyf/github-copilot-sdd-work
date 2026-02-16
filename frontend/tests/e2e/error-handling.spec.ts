/**
 * エラーハンドリング E2E テスト
 *
 * FR-020: MongoDB 接続エラーや API エラーが発生した場合、適切なエラーメッセージを表示する
 *
 * テスト対象:
 * - T007: バックエンドが利用できない場合、エラーメッセージが表示される
 * - T008: ノート一覧取得エラー時に適切なメッセージが表示される
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

test.beforeEach(async () => {
  await cleanupNotes();
});

test.afterAll(async () => {
  await cleanupNotes();
});

// =============================================================================
// T007: バックエンドが利用できない場合、エラーメッセージが表示されることをテスト
// =============================================================================
test.describe("FR-020: MongoDB 接続エラー表示", () => {
  test("T007: バックエンドが利用できない場合、エラーメッセージが表示される", async ({
    page,
  }) => {
    // ネットワークエラーをシミュレート（すべての API リクエストを abort）
    await page.route("**/notes**", (route) => {
      route.abort("failed");
    });

    // ページに移動
    await page.goto("/");

    // エラーメッセージが表示されることを検証
    // 「サーバーに接続できません」または類似のメッセージを検証
    const errorMessage = page.locator(
      "text=/サーバーに接続できません|ノートを取得できませんでした|エラーが発生しました/i",
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  // =============================================================================
  // T008: ノート一覧取得エラー時に適切なメッセージが表示されることをテスト
  // =============================================================================
  test("T008: ノート一覧取得エラー時に適切なメッセージが表示される", async ({
    page,
  }) => {
    // ノート一覧取得のみエラーをシミュレート（500 Internal Server Error）
    await page.route("**/notes", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Internal Server Error" }),
        });
      } else {
        route.continue();
      }
    });

    // ページに移動
    await page.goto("/");

    // エラーメッセージが表示されることを検証
    const errorMessage = page.locator(
      "text=/ノートを取得できませんでした|エラーが発生しました|サーバーエラー/i",
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("T008-2: ノート作成エラー時に適切なメッセージが表示される", async ({
    page,
  }) => {
    // ノート作成時にエラーをシミュレート
    await page.route("**/notes", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Failed to create note" }),
        });
      } else {
        route.continue();
      }
    });

    // 新規作成画面に移動
    await page.goto("/notes/new");

    // タイトルと本文を入力
    await page.fill('input[id="note-title"]', "エラーテストノート");
    await page.fill('textarea[id="note-content"]', "エラーテスト本文");

    // 保存ボタンをクリック
    await page.click("text=保存");

    // エラーメッセージが表示されることを検証
    const errorMessage = page.locator(
      "text=/保存できませんでした|エラーが発生しました|作成に失敗/i",
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("T008-3: ノート削除エラー時に適切なメッセージが表示される", async ({
    page,
  }) => {
    // テスト用ノートを作成
    const createResponse = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "削除エラーテスト",
        content: "削除テスト本文",
      }),
    });
    const note = await createResponse.json();

    // ノート削除時にエラーをシミュレート
    await page.route(`**/notes/${note.id}`, (route) => {
      if (route.request().method() === "DELETE") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Failed to delete note" }),
        });
      } else {
        route.continue();
      }
    });

    // 一覧ページに移動
    await page.goto("/");

    // ノートをクリックして編集画面に移動
    await page.click(`text=${note.title}`);

    // 削除ボタンをクリック
    await page.click("text=削除");

    // 確認ダイアログで削除を実行
    const confirmDialog = page.locator('[role="dialog"]');
    await expect(confirmDialog).toBeVisible();
    await page.click('button:has-text("削除する")');

    // エラーメッセージが表示されることを検証
    const errorMessage = page.locator(
      "text=/削除できませんでした|エラーが発生しました|削除に失敗/i",
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});
