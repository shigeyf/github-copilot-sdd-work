/**
 * アクセシビリティチェック
 *
 * T122: axe-core を使用してコンポーネントのアクセシビリティを検証する。
 * WCAG 2.1 AA 基準に準拠していることを確認する。
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('アクセシビリティチェック', () => {
  test('ノート一覧ページのアクセシビリティ', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('新規作成ページのアクセシビリティ', async ({ page }) => {
    await page.goto('/notes/new')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('新規作成ページ（WYSIWYGモード）のアクセシビリティ', async ({ page }) => {
    await page.goto('/notes/new')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("WYSIWYGモード")')
    await expect(page.locator('.ProseMirror')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('ノート編集ページのアクセシビリティ', async ({ page }) => {
    // テスト用ノートを作成
    const res = await fetch('http://localhost:8000/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'A11yテスト', content: '# テスト' }),
    })
    const note = await res.json()

    await page.goto(`/notes/${note.id}/edit`)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    // クリーンアップ
    await fetch(`http://localhost:8000/notes/${note.id}`, { method: 'DELETE' })

    expect(results.violations).toEqual([])
  })
})
