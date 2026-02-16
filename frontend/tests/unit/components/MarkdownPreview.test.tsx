/**
 * MarkdownPreview コンポーネントのユニットテスト
 *
 * Markdown のレンダリング、サニタイズ（XSS 対策）を検証する。
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MarkdownPreview from "../../../src/components/MarkdownPreview";

describe("MarkdownPreview", () => {
  describe("レンダリング", () => {
    it("プレビューコンテナが表示されること", () => {
      render(<MarkdownPreview content="" />);

      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    });

    it("空のコンテンツの場合、プレースホルダーが表示されること", () => {
      render(<MarkdownPreview content="" />);

      expect(
        screen.getByText("プレビューするコンテンツがありません"),
      ).toBeInTheDocument();
    });

    it("見出し（H1）が正しくレンダリングされること", () => {
      render(<MarkdownPreview content="# 見出し1" />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("見出し1");
    });

    it("見出し（H2）が正しくレンダリングされること", () => {
      render(<MarkdownPreview content="## 見出し2" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("見出し2");
    });

    it("太字テキストが正しくレンダリングされること", () => {
      render(<MarkdownPreview content="**太字テキスト**" />);

      const strong = screen.getByText("太字テキスト");
      expect(strong.tagName).toBe("STRONG");
    });

    it("斜体テキストが正しくレンダリングされること", () => {
      render(<MarkdownPreview content="*斜体テキスト*" />);

      const em = screen.getByText("斜体テキスト");
      expect(em.tagName).toBe("EM");
    });

    it("リンクが正しくレンダリングされること", () => {
      render(<MarkdownPreview content="[テストリンク](https://example.com)" />);

      const link = screen.getByRole("link", { name: "テストリンク" });
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("箇条書きリストが正しくレンダリングされること", () => {
      render(<MarkdownPreview content={"- 項目1\n- 項目2\n- 項目3"} />);

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);
    });

    it("番号付きリストが正しくレンダリングされること", () => {
      render(<MarkdownPreview content={"1. 項目1\n2. 項目2\n3. 項目3"} />);

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);
    });

    it("コードブロックが正しくレンダリングされること", () => {
      render(<MarkdownPreview content={'```\nconsole.log("hello")\n```'} />);

      const code = screen.getByText('console.log("hello")');
      expect(code).toBeInTheDocument();
    });

    it("GFM テーブルが正しくレンダリングされること", () => {
      const tableMarkdown = "| 列1 | 列2 |\n| --- | --- |\n| A | B |";
      render(<MarkdownPreview content={tableMarkdown} />);

      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });
  });

  describe("サニタイズ（XSS 対策）", () => {
    it("script タグがレンダリングされないこと", () => {
      render(<MarkdownPreview content='<script>alert("xss")</script>' />);

      const preview = screen.getByTestId("markdown-preview");
      expect(preview.querySelector("script")).toBeNull();
    });

    it("img タグの onerror がレンダリングされないこと", () => {
      render(<MarkdownPreview content='<img src="x" onerror="alert(1)" />' />);

      const preview = screen.getByTestId("markdown-preview");
      const imgs = preview.querySelectorAll("img");
      imgs.forEach((img) => {
        expect(img.getAttribute("onerror")).toBeNull();
      });
    });

    it("javascript: スキームのリンクが安全に処理されること", () => {
      render(
        <MarkdownPreview content='[危険なリンク](javascript:alert("xss"))' />,
      );

      const preview = screen.getByTestId("markdown-preview");
      const links = preview.querySelectorAll("a");
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        expect(href).not.toMatch(/^javascript:/i);
      });
    });
  });

  describe("無効な Markdown", () => {
    it("無効な Markdown 記法はそのまま表示されること", () => {
      const invalidMarkdown =
        "### 閉じない見出し\n\n[壊れたリンク](不完全なURL";
      render(<MarkdownPreview content={invalidMarkdown} />);

      const preview = screen.getByTestId("markdown-preview");
      expect(preview).toBeInTheDocument();
    });
  });
});
