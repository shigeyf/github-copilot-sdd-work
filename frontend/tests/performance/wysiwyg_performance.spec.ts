/**
 * WYSIWYG フォーマット反映時間パフォーマンステスト
 *
 * SC-005 検証: WYSIWYG エディタでフォーマット操作が 1 秒以内に反映されること
 */
import { test, expect } from '@playwright/test'

test.describe('SC-005: WYSIWYG フォーマット反映時間', () => {
  test('太字フォーマットが1秒以内に反映されること', async ({ page }) => {
    await page.goto('/notes/new')

    // WYSIWYG モードに切り替え
    await page.click('button:has-text("WYSIWYGモード")')
    await expect(page.locator('.ProseMirror')).toBeVisible()

    // テキストを入力
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('テストテキスト')

    // テキストを全選択
    await page.keyboard.press('Control+a')

    // 計測開始: 太字ボタンをクリック
    const startTime = Date.now()
    await page.click('button[aria-label="太字"]')

    // 太字が反映されていることを確認
    await expect(editor.locator('strong')).toBeVisible()
    const elapsed = Date.now() - startTime

    // 1秒以内であること
    expect(elapsed).toBeLessThan(1000)
  })

  test('斜体フォーマットが1秒以内に反映されること', async ({ page }) => {
    await page.goto('/notes/new')

    // WYSIWYG モードに切り替え
    await page.click('button:has-text("WYSIWYGモード")')
    await expect(page.locator('.ProseMirror')).toBeVisible()

    // テキストを入力
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('テストテキスト')

    // テキストを全選択
    await page.keyboard.press('Control+a')

    // 計測開始: 斜体ボタンをクリック
    const startTime = Date.now()
    await page.click('button[aria-label="斜体"]')

    // 斜体が反映されていることを確認
    await expect(editor.locator('em')).toBeVisible()
    const elapsed = Date.now() - startTime

    // 1秒以内であること
    expect(elapsed).toBeLessThan(1000)
  })
})
