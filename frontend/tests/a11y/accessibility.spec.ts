/**
 * アクセシビリティチェック
 *
 * T122: axe-core を使用してコンポーネントのアクセシビリティを検証する。
 * WCAG 2.1 AA 基準に準拠していることを確認する。
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("アクセシビリティチェック", () => {
  test("ノート一覧ページのアクセシビリティ", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("新規作成ページのアクセシビリティ", async ({ page }) => {
    await page.goto("/notes/new");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("新規作成ページ（WYSIWYGモード）のアクセシビリティ", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("ノート編集ページのアクセシビリティ", async ({ page }) => {
    // テスト用ノートを作成
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "A11yテスト", content: "# テスト" }),
    });
    const note = await res.json();

    await page.goto(`/notes/${note.id}/edit`);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    // クリーンアップ
    await fetch(`http://localhost:8000/notes/${note.id}`, { method: "DELETE" });

    expect(results.violations).toEqual([]);
  });

  // =============================================================================
  // T016-T017: アクセシビリティテストの拡張
  // =============================================================================
  test("T016: 削除確認ダイアログのアクセシビリティ", async ({ page }) => {
    // テスト用ノートを作成
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "削除ダイアログA11yテスト",
        content: "テスト内容",
      }),
    });
    const note = await res.json();

    // ノート編集画面に移動
    await page.goto(`/notes/${note.id}/edit`);
    await page.waitForLoadState("networkidle");

    // 削除ボタンをクリック
    await page.click("text=削除");

    // 削除確認ダイアログが表示されるまで待機
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // ダイアログのアクセシビリティを検証
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    // クリーンアップ: ダイアログを閉じてノートを削除
    await page.click("text=キャンセル");
    await fetch(`http://localhost:8000/notes/${note.id}`, { method: "DELETE" });
  });

  test("T017: 空タイトルエラー状態のアクセシビリティ", async ({ page }) => {
    // 新規作成画面を開く
    await page.goto("/notes/new");
    await page.waitForLoadState("networkidle");

    // 本文のみを入力（タイトルは空のまま）
    await page.fill('textarea[id="note-content"]', "本文のみ入力");

    // 保存ボタンをクリック
    await page.click("text=保存");

    // エラーメッセージが表示されるまで少し待機
    await page.waitForTimeout(500);

    // エラーメッセージのアクセシビリティを検証
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
