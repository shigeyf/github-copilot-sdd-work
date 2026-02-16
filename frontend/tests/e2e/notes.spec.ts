/**
 * ノート管理 E2E テスト
 *
 * US2: 新規作成フロー (T048)
 * US3: 編集フロー (T064)
 * US4: 削除フロー (T082)
 * US5: WYSIWYG モード切り替え (T094)
 * US6: リアルタイムプレビュー (T105)
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
// T048: US2 - 新規作成フロー全体
// =============================================================================
test.describe("US2: 新規Markdownノートの作成", () => {
  test("新規ノートを作成して一覧に表示されること", async ({ page }) => {
    await page.goto("/");
    // 「新規作成」ボタンをクリック
    await page.click("text=新規作成");
    await expect(page).toHaveURL("/notes/new");

    // タイトルと本文を入力
    await page.fill('input[id="note-title"]', "テストノート1");
    await page.fill(
      'textarea[id="note-content"]',
      "# テスト\n\nこれはテストノートです。",
    );

    // 保存ボタンをクリック
    await page.click('button:has-text("保存")');

    // 一覧ページに遷移し、ノートが表示されること
    await expect(page).toHaveURL("/");
    await expect(page.locator("text=テストノート1")).toBeVisible();
  });

  test("タイトルが空の場合は保存ボタンが無効であること", async ({ page }) => {
    await page.goto("/notes/new");
    const saveButton = page.locator('button:has-text("保存")');
    await expect(saveButton).toBeDisabled();
  });

  test("タイトルを入力すると保存ボタンが有効になること", async ({ page }) => {
    await page.goto("/notes/new");
    const saveButton = page.locator('button:has-text("保存")');
    await expect(saveButton).toBeDisabled();

    await page.fill('input[id="note-title"]', "テストタイトル");
    await expect(saveButton).toBeEnabled();
  });
});

// =============================================================================
// T064: US3 - 編集フロー全体
// =============================================================================
test.describe("US3: Markdownノートの編集", () => {
  test("既存ノートを編集して保存できること", async ({ page }) => {
    // ノートを API で事前作成
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "編集テスト", content: "編集前の内容" }),
    });
    const note = await res.json();

    // 一覧ページからノートをクリックして編集ページへ遷移
    await page.goto("/");
    await page.click("text=編集テスト");
    await expect(page).toHaveURL(`/notes/${note.id}/edit`);

    // タイトルと本文を編集
    await page.fill('input[id="note-title"]', "編集後テスト");
    await page.fill('textarea[id="note-content"]', "編集後の内容");

    // 保存
    await page.click('button:has-text("保存")');
    await expect(page).toHaveURL("/");

    // 更新されたタイトルが一覧に表示される
    await expect(page.locator("text=編集後テスト")).toBeVisible();
  });

  test("「一覧に戻る」ボタンで一覧ページに戻れること", async ({ page }) => {
    // ノートを事前作成
    await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "戻るテスト", content: "" }),
    });

    await page.goto("/");
    await page.click("text=戻るテスト");
    await page.click("text=一覧に戻る");
    await expect(page).toHaveURL("/");
  });
});

// =============================================================================
// T082: US4 - 削除フロー全体、確認ダイアログ
// =============================================================================
test.describe("US4: Markdownノートの削除", () => {
  test("削除ボタンをクリックすると確認ダイアログが表示されること", async ({
    page,
  }) => {
    // ノートを事前作成
    await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "削除テスト", content: "" }),
    });

    await page.goto("/");
    // 一覧の削除ボタンをクリック
    await page.click('button:has-text("削除")');
    // 確認ダイアログが表示される
    await expect(page.locator("text=ノートを削除しますか？")).toBeVisible();
    await expect(page.locator("text=「削除テスト」を削除します")).toBeVisible();
  });

  test("確認ダイアログでキャンセルするとノートが残ること", async ({ page }) => {
    await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "キャンセルテスト", content: "" }),
    });

    await page.goto("/");
    await page.click('button:has-text("削除")');
    await page.click('button:has-text("キャンセル")');
    // ノートがまだ表示されている
    await expect(page.locator("text=キャンセルテスト")).toBeVisible();
  });

  test("確認ダイアログで削除を実行するとノートが削除されること", async ({
    page,
  }) => {
    await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "完全削除テスト", content: "" }),
    });

    await page.goto("/");
    await expect(page.locator('h3:has-text("完全削除テスト")')).toBeVisible();

    // ダイアログ内の削除ボタンをクリック
    await page.click('button:has-text("削除")'); // 一覧の削除ボタン
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.locator('[role="dialog"] button:has-text("削除")').click(); // ダイアログの削除ボタン

    // ダイアログが閉じて、ノートが一覧から消えること
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(
      page.locator('h3:has-text("完全削除テスト")'),
    ).not.toBeVisible();
  });

  test("編集ページから削除できること", async ({ page }) => {
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "編集画面削除テスト", content: "" }),
    });
    const note = await res.json();

    await page.goto(`/notes/${note.id}/edit`);
    await page.click('button:has-text("削除")');
    await expect(page.locator("text=ノートを削除しますか？")).toBeVisible();
    await page.locator('[role="dialog"] button:has-text("削除")').click();
    await expect(page).toHaveURL("/");
  });
});

// =============================================================================
// T094: US5 - WYSIWYG モード切り替え、フォーマット適用
// =============================================================================
test.describe("US5: WYSIWYG エディタでの編集", () => {
  test("Markdown モードと WYSIWYG モードを切り替えられること", async ({
    page,
  }) => {
    await page.goto("/notes/new");

    // デフォルトは Markdown モード
    await expect(page.locator('textarea[id="note-content"]')).toBeVisible();

    // WYSIWYG モードに切り替え
    await page.click('button:has-text("WYSIWYGモード")');

    // textarea が非表示になり、TipTap エディタが表示される
    await expect(page.locator('textarea[id="note-content"]')).not.toBeVisible();
    await expect(page.locator(".ProseMirror")).toBeVisible();

    // Markdown モードに戻す
    await page.click('button:has-text("Markdownモード")');
    await expect(page.locator('textarea[id="note-content"]')).toBeVisible();
  });

  test("WYSIWYG モードでツールバーボタンが表示されること", async ({ page }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');

    // ツールバーボタンの存在を確認
    await expect(page.locator('button[aria-label="太字"]')).toBeVisible();
    await expect(page.locator('button[aria-label="斜体"]')).toBeVisible();
  });

  test("WYSIWYG モードで入力してから保存できること", async ({ page }) => {
    await page.goto("/notes/new");
    await page.fill('input[id="note-title"]', "WYSIWYGテスト");
    await page.click('button:has-text("WYSIWYGモード")');

    // TipTap エディタに入力
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.pressSequentially("WYSIWYG で入力したテキスト");

    // 保存
    await page.click('button:has-text("保存")');
    await expect(page).toHaveURL("/");
    await expect(page.locator("text=WYSIWYGテスト")).toBeVisible();
  });
});

// =============================================================================
// T105: US6 - プレビューのリアルタイム更新、表示/非表示切り替え
// =============================================================================
test.describe("US6: リアルタイムプレビュー表示", () => {
  test("Markdown モードでプレビューパネルが表示されること", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    // プレビューパネルが表示されている
    await expect(page.locator('[aria-label="プレビューパネル"]')).toBeVisible();
  });

  test("プレビューの表示/非表示を切り替えられること", async ({ page }) => {
    await page.goto("/notes/new");
    await expect(page.locator('[aria-label="プレビューパネル"]')).toBeVisible();

    // 「プレビューを非表示」ボタンをクリック
    await page.click('button:has-text("プレビューを非表示")');
    await expect(
      page.locator('[aria-label="プレビューパネル"]'),
    ).not.toBeVisible();

    // 「プレビューを表示」ボタンをクリックして再表示
    await page.click('button:has-text("プレビューを表示")');
    await expect(page.locator('[aria-label="プレビューパネル"]')).toBeVisible();
  });

  test("Markdown 入力がプレビューにリアルタイムで反映されること", async ({
    page,
  }) => {
    await page.goto("/notes/new");

    // Markdown を入力
    await page.fill(
      'textarea[id="note-content"]',
      "# 見出しテスト\n\n**太字テキスト**",
    );

    // デバウンス (300ms) を待つ
    await page.waitForTimeout(500);

    // プレビューパネルに見出しと太字が反映される
    const preview = page.locator('[aria-label="プレビューパネル"]');
    await expect(preview.locator("h1")).toContainText("見出しテスト");
    await expect(preview.locator("strong")).toContainText("太字テキスト");
  });

  test("WYSIWYG モードではプレビュー切り替えボタンが非表示であること", async ({
    page,
  }) => {
    await page.goto("/notes/new");
    await page.click('button:has-text("WYSIWYGモード")');
    await expect(
      page.locator('button:has-text("プレビューを非表示")'),
    ).not.toBeVisible();
    await expect(
      page.locator('button:has-text("プレビューを表示")'),
    ).not.toBeVisible();
  });
});

// =============================================================================
// T005-T006: FR-019 - 重複タイトルの自動番号付加テスト
// =============================================================================
test.describe("FR-019: 重複タイトルの自動番号付加", () => {
  test("T005: 同じタイトルのノートを作成すると番号が付加される", async ({
    page,
  }) => {
    // 最初のノートを作成
    await page.goto("/notes/new");
    await page.fill('input[id="note-title"]', "テストノート");
    await page.fill('textarea[id="note-content"]', "最初のノート");
    await page.click("text=保存");

    // 一覧に戻ることを確認
    await expect(page).toHaveURL("/");
    await expect(page.locator("text=テストノート")).toBeVisible();

    // 再度同じタイトルでノートを作成
    await page.click("text=新規作成");
    await page.fill('input[id="note-title"]', "テストノート");
    await page.fill('textarea[id="note-content"]', "2番目のノート");
    await page.click("text=保存");

    // 一覧に戻ることを確認
    await expect(page).toHaveURL("/");

    // 「テストノート (2)」として保存されることを検証
    await expect(page.locator("text=テストノート (2)")).toBeVisible();
  });

  test("T006: 番号付きタイトルが既に存在する場合は次の番号が付加される", async ({
    page,
  }) => {
    // 最初のノートを作成
    await page.goto("/notes/new");
    await page.fill('input[id="note-title"]', "テストノート");
    await page.fill('textarea[id="note-content"]', "最初のノート");
    await page.click("text=保存");

    await expect(page).toHaveURL("/");

    // 2番目のノートを作成（自動的に「テストノート (2)」になる）
    await page.click("text=新規作成");
    await page.fill('input[id="note-title"]', "テストノート");
    await page.fill('textarea[id="note-content"]', "2番目のノート");
    await page.click("text=保存");

    await expect(page).toHaveURL("/");

    // 3番目のノートを作成
    await page.click("text=新規作成");
    await page.fill('input[id="note-title"]', "テストノート");
    await page.fill('textarea[id="note-content"]', "3番目のノート");
    await page.click("text=保存");

    await expect(page).toHaveURL("/");

    // 「テストノート (3)」として保存されることを検証
    await expect(page.locator("text=テストノート (3)")).toBeVisible();
  });
});

// =============================================================================
// T011: US3-3 - キャンセルボタンの動作テスト
// =============================================================================
test.describe("US3-3: キャンセルボタンの動作", () => {
  test("T011: キャンセルボタンで変更が破棄され一覧に戻る", async ({
    page,
  }) => {
    // 準備: テスト用ノートを作成
    const res = await fetch("http://localhost:8000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "キャンセルテスト",
        content: "元の内容",
      }),
    });
    const note = await res.json();

    // ノート編集画面に移動
    await page.goto(`/notes/${note.id}/edit`);

    // 元のタイトルと本文を確認
    await expect(page.locator('input[id="note-title"]')).toHaveValue(
      "キャンセルテスト",
    );
    await expect(page.locator('textarea[id="note-content"]')).toHaveValue(
      "元の内容",
    );

    // タイトルと本文を変更
    await page.fill('input[id="note-title"]', "変更されたタイトル");
    await page.fill('textarea[id="note-content"]', "変更された内容");

    // キャンセルボタンをクリック
    await page.click("text=キャンセル");

    // 一覧に戻ることを確認
    await expect(page).toHaveURL("/");

    // ノートをクリックして再度編集画面に移動
    await page.click("text=キャンセルテスト");

    // 変更が保存されていないことを確認
    await expect(page.locator('input[id="note-title"]')).toHaveValue(
      "キャンセルテスト",
    );
    await expect(page.locator('textarea[id="note-content"]')).toHaveValue(
      "元の内容",
    );
  });

  test("T011-2: 新規作成画面でキャンセルボタンをクリックすると一覧に戻る", async ({
    page,
  }) => {
    // 新規作成画面に移動
    await page.goto("/notes/new");

    // タイトルと本文を入力
    await page.fill('input[id="note-title"]', "キャンセルされるノート");
    await page.fill('textarea[id="note-content"]', "キャンセルされる内容");

    // キャンセルボタンをクリック
    await page.click("text=キャンセル");

    // 一覧に戻ることを確認
    await expect(page).toHaveURL("/");

    // ノートが作成されていないことを確認
    await expect(
      page.locator("text=キャンセルされるノート"),
    ).not.toBeVisible();
  });
});
