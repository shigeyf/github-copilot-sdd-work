/**
 * 大規模ノート編集パフォーマンステスト
 *
 * SC-008 検証: 10,000 文字のノートの編集操作が 2 秒以内に完了すること
 */
import { test, expect } from "@playwright/test";

/**
 * テスト用の長いテキストを生成する
 */
function generateLargeText(charCount: number): string {
  const line =
    "# テスト見出し\n\nこれは長いテキストのテストです。パフォーマンスを確認します。\n\n";
  let text = "";
  while (text.length < charCount) {
    text += line;
  }
  return text.substring(0, charCount);
}

test.describe("SC-008: 大規模ノート編集パフォーマンス", () => {
  test("10,000文字のノートの保存が2秒以内に完了すること", async ({ page }) => {
    const largeContent = generateLargeText(10000);

    // ノートを API で事前作成
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "大規模テスト", content: largeContent }),
    });
    const note = await res.json();

    // 編集ページを開く
    await page.goto(`/notes/${note.id}/edit`);
    await expect(page.locator('input[id="note-title"]')).toHaveValue(
      "大規模テスト",
    );

    // 計測開始: タイトルを変更して保存
    const startTime = Date.now();
    await page.fill('input[id="note-title"]', "大規模テスト更新");
    await page.click('button:has-text("保存")');

    // 一覧に戻ることを確認
    await expect(page).toHaveURL("/");
    const elapsed = Date.now() - startTime;

    // 2秒以内であること
    expect(elapsed).toBeLessThan(2000);

    // クリーンアップ
    await fetch(`http://localhost:8000/notes/${note.id}`, { method: "DELETE" });
  });

  test("10,000文字のノートの編集ページが正常にロードされること", async ({
    page,
  }) => {
    const largeContent = generateLargeText(10000);

    // ノートを API で事前作成
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "ロードテスト", content: largeContent }),
    });
    const note = await res.json();

    // 計測開始: 編集ページを開く
    const startTime = Date.now();
    await page.goto(`/notes/${note.id}/edit`);
    await expect(page.locator('input[id="note-title"]')).toHaveValue(
      "ロードテスト",
    );
    const elapsed = Date.now() - startTime;

    // 2秒以内であること
    expect(elapsed).toBeLessThan(2000);

    // クリーンアップ
    await fetch(`http://localhost:8000/notes/${note.id}`, { method: "DELETE" });
  });
});
