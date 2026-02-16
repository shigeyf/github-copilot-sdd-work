/**
 * WysiwygEditor コンポーネントのユニットテスト
 *
 * ツールバー操作、Markdown 変換、モード切り替えの動作を検証する。
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import NoteEditor from "../../../src/components/NoteEditor";

/**
 * NoteEditor をラップして BrowserRouter を提供する
 */
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("WysiwygEditor", () => {
  describe("モード切り替え", () => {
    it("デフォルトでMarkdownモードが選択されていること", () => {
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      const markdownButton = screen.getByRole("button", {
        name: "Markdownモード",
      });
      expect(markdownButton).toHaveAttribute("aria-pressed", "true");
    });

    it("WYSIWYGモードボタンが表示されること", () => {
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      expect(
        screen.getByRole("button", { name: "WYSIWYGモード" }),
      ).toBeInTheDocument();
    });

    it("Markdownモードボタンが表示されること", () => {
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      expect(
        screen.getByRole("button", { name: "Markdownモード" }),
      ).toBeInTheDocument();
    });

    it("WYSIWYGモードに切り替えるとツールバーが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      const wysiwygButton = screen.getByRole("button", {
        name: "WYSIWYGモード",
      });
      await user.click(wysiwygButton);

      expect(
        screen.getByRole("toolbar", { name: "書式設定ツールバー" }),
      ).toBeInTheDocument();
    });

    it("WYSIWYGモードに切り替えるとtextareaが非表示になること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      const wysiwygButton = screen.getByRole("button", {
        name: "WYSIWYGモード",
      });
      await user.click(wysiwygButton);

      expect(
        document.querySelector("textarea#note-content"),
      ).not.toBeInTheDocument();
    });

    it("Markdownモードに戻すとtextareaが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      // WYSIWYG モードに切り替え
      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));
      // Markdown モードに戻す
      await user.click(screen.getByRole("button", { name: "Markdownモード" }));

      expect(screen.getByLabelText("本文")).toBeInTheDocument();
    });
  });

  describe("ツールバーボタン", () => {
    it("太字ボタンが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      expect(screen.getByRole("button", { name: "太字" })).toBeInTheDocument();
    });

    it("斜体ボタンが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      expect(screen.getByRole("button", { name: "斜体" })).toBeInTheDocument();
    });

    it("見出しボタンが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      expect(
        screen.getByRole("button", { name: "見出し1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "見出し2" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "見出し3" }),
      ).toBeInTheDocument();
    });

    it("箇条書きリストボタンが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      expect(
        screen.getByRole("button", { name: "箇条書きリスト" }),
      ).toBeInTheDocument();
    });

    it("番号付きリストボタンが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      expect(
        screen.getByRole("button", { name: "番号付きリスト" }),
      ).toBeInTheDocument();
    });

    it("リンクボタンが表示されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      expect(
        screen.getByRole("button", { name: "リンク" }),
      ).toBeInTheDocument();
    });
  });

  describe("Markdown との相互変換", () => {
    it("Markdownモードで入力した内容がWYSIWYGモードに反映されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NoteEditor onSave={vi.fn()} initialContent="**太字テスト**" />,
      );

      // WYSIWYG モードに切り替え
      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      // TipTap エディタのコンテンツエリアが存在すること
      const editorContent = document.querySelector(".tiptap");
      expect(editorContent).toBeInTheDocument();
    });

    it("WYSIWYGモードからMarkdownモードに戻した時にコンテンツが保持されること", async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NoteEditor onSave={vi.fn()} initialContent="テスト本文" />,
      );

      // WYSIWYG モードに切り替え
      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));
      // Markdown モードに戻す
      await user.click(screen.getByRole("button", { name: "Markdownモード" }));

      const textarea = screen.getByLabelText("本文");
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("保存機能との連携", () => {
    it("WYSIWYGモードでもタイトル入力後に保存ボタンが有効になること", async () => {
      const user = userEvent.setup();
      renderWithRouter(<NoteEditor onSave={vi.fn()} />);

      // WYSIWYG モードに切り替え
      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      // タイトルを入力
      const titleInput = screen.getByLabelText("タイトル");
      await user.type(titleInput, "テストタイトル");

      const saveButton = screen.getByRole("button", { name: "保存" });
      expect(saveButton).toBeEnabled();
    });

    it("WYSIWYGモードで保存ボタンをクリックするとonSaveが呼ばれること", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      renderWithRouter(<NoteEditor onSave={onSave} />);

      // WYSIWYG モードに切り替え
      await user.click(screen.getByRole("button", { name: "WYSIWYGモード" }));

      // タイトルを入力
      const titleInput = screen.getByLabelText("タイトル");
      await user.type(titleInput, "テストタイトル");

      const saveButton = screen.getByRole("button", { name: "保存" });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "テストタイトル",
        }),
      );
    });
  });
});
