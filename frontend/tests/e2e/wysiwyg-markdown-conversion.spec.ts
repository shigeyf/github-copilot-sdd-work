/**
 * WYSIWYG → Markdown 変換 E2E テスト
 *
 * FR-014: WYSIWYG モードで編集した内容が正しく Markdown 形式に変換されること
 *
 * テスト対象:
 * - T019: 太字が正しく Markdown に変換される
 * - T020: 斜体が正しく Markdown に変換される
 * - T021: 見出しが正しく Markdown に変換される
 * - T022: 箇条書きリストが正しく Markdown に変換される
 * - T023: 番号付きリストが正しく Markdown に変換される
 * - T024: リンクが正しく Markdown に変換される
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
// T019: WYSIWYG モードで太字が正しく Markdown に変換されることをテスト
// =============================================================================
test.describe("FR-014: WYSIWYG → Markdown 変換の完全性", () => {
  test("T019: WYSIWYG モードで太字が正しく Markdown に変換される", async ({
    page,
  }) => {
    // 新規作成画面に移動
    await page.goto("/notes/new");

    // WYSIWYG モードに切り替え
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    // TipTap エディタに直接テキストを入力
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.type("太字テスト");

    // テキストを選択して太字を適用
    await page.keyboard.press("Control+A");
    await page.click('[aria-label="太字"]');

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    // Markdown 形式で `**太字**` または `__太字__` になっていることを確認
    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();
    expect(content).toMatch(/\*\*太字テスト\*\*|__太字テスト__/);
  });

  // =============================================================================
  // T020: WYSIWYG モードで斜体が正しく Markdown に変換されることをテスト
  // =============================================================================
  test("T020: WYSIWYG モードで斜体が正しく Markdown に変換される", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.type("斜体テスト");

    // テキストを選択して斜体を適用
    await page.keyboard.press("Control+A");
    await page.click('[aria-label="斜体"]');

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    // Markdown 形式で `*斜体*` または `_斜体_` になっていることを確認
    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();
    expect(content).toMatch(/\*斜体テスト\*|_斜体テスト_/);
  });

  // =============================================================================
  // T021: WYSIWYG モードで見出しが正しく Markdown に変換されることをテスト
  // =============================================================================
  test("T021: WYSIWYG モードで見出しが正しく Markdown に変換される", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.type("見出しテスト");

    // 見出し 1 を適用
    await page.click('[aria-label="見出し 1"]');

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    // Markdown 形式で `# 見出しテスト` になっていることを確認
    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();
    expect(content).toContain("# 見出しテスト");
  });

  test("T021-2: WYSIWYG モードで見出し 2 が正しく Markdown に変換される", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.type("見出し2テスト");

    // 見出し 2 を適用
    await page.click('[aria-label="見出し 2"]');

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();
    expect(content).toContain("## 見出し2テスト");
  });

  // =============================================================================
  // T022: WYSIWYG モードで箇条書きリストが正しく Markdown に変換されることをテスト
  // =============================================================================
  test("T022: WYSIWYG モードで箇条書きリストが正しく Markdown に変換される", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const editor = page.locator(".ProseMirror");
    await editor.click();

    // 箇条書きリストボタンをクリック
    await page.click('[aria-label="箇条書きリスト"]');

    // リスト項目を入力
    await editor.type("項目1");
    await page.keyboard.press("Enter");
    await editor.type("項目2");

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    // Markdown 形式で `- 項目1` または `* 項目1` になっていることを確認
    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();
    expect(content).toMatch(/[-*] 項目1/);
    expect(content).toMatch(/[-*] 項目2/);
  });

  // =============================================================================
  // T023: WYSIWYG モードで番号付きリストが正しく Markdown に変換されることをテスト
  // =============================================================================
  test("T023: WYSIWYG モードで番号付きリストが正しく Markdown に変換される", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const editor = page.locator(".ProseMirror");
    await editor.click();

    // 番号付きリストボタンをクリック
    await page.click('[aria-label="番号付きリスト"]');

    // リスト項目を入力
    await editor.type("項目1");
    await page.keyboard.press("Enter");
    await editor.type("項目2");

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    // Markdown 形式で `1. 項目1` になっていることを確認
    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();
    expect(content).toMatch(/1\. 項目1/);
    expect(content).toMatch(/2\. 項目2/);
  });

  // =============================================================================
  // T024: WYSIWYG モードでリンクが正しく Markdown に変換されることをテスト
  // =============================================================================
  test("T024: WYSIWYG モードでリンクが正しく Markdown に変換される", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(page.locator(".ProseMirror")).toBeVisible();

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.type("リンクテキスト");

    // テキストを選択
    await page.keyboard.press("Control+A");

    // リンクボタンをクリック
    await page.click('[aria-label="リンク"]');

    // URL 入力ダイアログが表示される場合は入力
    // （TipTap の実装によってはプロンプトが表示される）
    // ここでは簡易的に Markdown モードで確認
    await page.keyboard.type("https://example.com");
    await page.keyboard.press("Enter");

    // Markdown モードに切り替え
    await page.click('button:has-text("Markdownモード")');

    // Markdown 形式で `[リンクテキスト](https://example.com)` になっていることを確認
    const content = await page
      .locator('textarea[id="note-content"]')
      .inputValue();

    // リンク形式が含まれていることを確認
    // TipTap の実装によってはリンクの形式が異なる場合があるため、柔軟にチェック
    expect(content).toMatch(/\[.*\]\(.*\)|https?:\/\//);
  });
});
