/**
 * 未保存変更の確認ダイアログ E2E テスト
 *
 * FR-018: 未保存の変更がある場合、ページ遷移前に確認ダイアログを表示する
 *
 * テスト対象:
 * - T001: 編集中に一覧に戻ろうとすると確認ダイアログが表示される
 * - T002: 確認ダイアログで「編集に戻る」を選択すると編集画面に留まる
 * - T003: 編集中にブラウザの戻るボタンを押すと確認ダイアログが表示される
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
 * テスト用のノートを作成する
 */
async function createTestNote(title: string, content: string) {
  const res = await fetch("http://localhost:8000/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}

test.beforeEach(async () => {
  await cleanupNotes();
});

test.afterAll(async () => {
  await cleanupNotes();
});

// =============================================================================
// T001: 編集中に一覧に戻ろうとすると確認ダイアログが表示されることをテスト
// =============================================================================
test.describe("FR-018: 未保存変更の確認ダイアログ", () => {
  test("T001: 編集中に一覧に戻ろうとすると確認ダイアログが表示される", async ({
    page,
  }) => {
    // 準備: テスト用ノートを作成
    const note = await createTestNote("既存ノート", "元の内容");

    // ノート編集画面に移動
    await page.goto(`/notes/${note.id}/edit`);

    // タイトルを変更
    const titleInput = page.locator('input[id="note-title"]');
    await titleInput.fill("変更されたタイトル");

    // 一覧に戻るボタンをクリック
    await page.click("text=一覧に戻る");

    // 確認ダイアログが表示されることを検証
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("未保存の変更があります");

    // 「変更を破棄」ボタンをクリック
    await page.click("text=変更を破棄");

    // 一覧ページに遷移したことを確認
    await expect(page).toHaveURL("/");
  });

  // =============================================================================
  // T002: 確認ダイアログで「編集に戻る」を選択すると編集画面に留まることをテスト
  // =============================================================================
  test("T002: 確認ダイアログで「編集に戻る」を選択すると編集画面に留まる", async ({
    page,
  }) => {
    // 準備: テスト用ノートを作成
    const note = await createTestNote("既存ノート2", "元の内容2");

    // ノート編集画面に移動
    await page.goto(`/notes/${note.id}/edit`);

    // 本文を変更
    const contentTextarea = page.locator('textarea[id="note-content"]');
    await contentTextarea.fill("変更された本文");

    // 一覧に戻るボタンをクリック
    await page.click("text=一覧に戻る");

    // 確認ダイアログが表示されることを検証
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // 「編集に戻る」ボタンをクリック
    await page.click("text=編集に戻る");

    // ダイアログが閉じられることを確認
    await expect(dialog).not.toBeVisible();

    // 編集画面に留まっていることを確認
    await expect(page).toHaveURL(`/notes/${note.id}/edit`);

    // 変更が保持されていることを確認
    await expect(contentTextarea).toHaveValue("変更された本文");
  });

  // =============================================================================
  // T003: 編集中にブラウザの戻るボタンを押すと確認ダイアログが表示されることをテスト
  // =============================================================================
  test("T003: 編集中にブラウザの戻るボタンを押すと確認ダイアログが表示される", async ({
    page,
  }) => {
    // 準備: テスト用ノートを作成
    const note = await createTestNote("既存ノート3", "元の内容3");

    // まず一覧ページに移動
    await page.goto("/");

    // ノート編集画面に移動
    await page.goto(`/notes/${note.id}/edit`);

    // タイトルを変更
    const titleInput = page.locator('input[id="note-title"]');
    await titleInput.fill("ブラウザ戻るテスト");

    // ブラウザの戻るボタンを押す
    await page.goBack();

    // 確認ダイアログが表示されることを検証
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("未保存の変更があります");

    // 「変更を破棄」ボタンをクリック
    await page.click("text=変更を破棄");

    // 一覧ページに遷移したことを確認
    await expect(page).toHaveURL("/");
  });
});
