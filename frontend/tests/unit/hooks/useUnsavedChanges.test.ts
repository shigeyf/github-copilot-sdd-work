/**
 * useUnsavedChanges フックのユニットテスト
 *
 * T004: useUnsavedChanges フックの動作を検証
 * - 変更があるときに hasUnsavedChanges が true になる
 * - beforeunload イベントが登録される
 * - ナビゲーション時に確認ダイアログが表示される
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUnsavedChanges } from "../../../src/hooks/useUnsavedChanges";

describe("useUnsavedChanges フック", () => {
  let beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

  beforeEach(() => {
    // beforeunload イベントリスナーをキャプチャする
    vi.spyOn(window, "addEventListener").mockImplementation(
      (event, handler) => {
        if (event === "beforeunload" && typeof handler === "function") {
          beforeUnloadHandler = handler as (e: BeforeUnloadEvent) => void;
        }
      },
    );

    vi.spyOn(window, "removeEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    beforeUnloadHandler = null;
    vi.restoreAllMocks();
  });

  it("初期状態では hasUnsavedChanges が false である", () => {
    const { result } = renderHook(() => useUnsavedChanges());

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.showDialog).toBe(false);
  });

  it("setHasUnsavedChanges で変更があることを設定できる", () => {
    const { result } = renderHook(() => useUnsavedChanges());

    act(() => {
      result.current.setHasUnsavedChanges(true);
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("beforeunload イベントリスナーが登録される", () => {
    renderHook(() => useUnsavedChanges());

    expect(window.addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("未保存の変更がある場合、beforeunload イベントで preventDefault が呼ばれる", async () => {
    const { result } = renderHook(() => useUnsavedChanges());

    // 未保存の変更を設定
    act(() => {
      result.current.setHasUnsavedChanges(true);
    });

    // beforeunload イベントをシミュレート
    const event = new Event("beforeunload") as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    if (beforeUnloadHandler) {
      beforeUnloadHandler(event);
    }

    await waitFor(() => {
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  it("未保存の変更がない場合、beforeunload イベントで preventDefault が呼ばれない", async () => {
    renderHook(() => useUnsavedChanges());

    // beforeunload イベントをシミュレート
    const event = new Event("beforeunload") as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    if (beforeUnloadHandler) {
      beforeUnloadHandler(event);
    }

    // preventDefaultが呼ばれないことを確認するため、少し待機
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("openDialog で確認ダイアログを表示できる", () => {
    const { result } = renderHook(() => useUnsavedChanges());

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.showDialog).toBe(true);
  });

  it("closeDialog で確認ダイアログを閉じることができる", () => {
    const { result } = renderHook(() => useUnsavedChanges());

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.showDialog).toBe(true);

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.showDialog).toBe(false);
  });

  it("confirmDiscard で変更を破棄し、ペンディングナビゲーションを実行できる", () => {
    const { result } = renderHook(() => useUnsavedChanges());
    const mockNavigate = vi.fn();

    // 未保存の変更とペンディングナビゲーションを設定
    act(() => {
      result.current.setHasUnsavedChanges(true);
      result.current.openDialog();
      result.current.setPendingNavigation(mockNavigate);
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.showDialog).toBe(true);

    // confirmDiscard を呼び出す
    act(() => {
      result.current.confirmDiscard();
    });

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.showDialog).toBe(false);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("setPendingNavigation でナビゲーションコールバックを設定できる", () => {
    const { result } = renderHook(() => useUnsavedChanges());
    const mockNavigate = vi.fn();

    act(() => {
      result.current.setPendingNavigation(mockNavigate);
    });

    // confirmDiscard で実行されることを確認
    act(() => {
      result.current.confirmDiscard();
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("closeDialog でペンディングナビゲーションがクリアされる", () => {
    const { result } = renderHook(() => useUnsavedChanges());
    const mockNavigate = vi.fn();

    act(() => {
      result.current.setHasUnsavedChanges(true);
      result.current.setPendingNavigation(mockNavigate);
      result.current.openDialog();
    });

    // ダイアログを閉じる
    act(() => {
      result.current.closeDialog();
    });

    // confirmDiscard を呼んでもナビゲーションは実行されない
    act(() => {
      result.current.confirmDiscard();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("アンマウント時に beforeunload イベントリスナーが削除される", () => {
    const { unmount } = renderHook(() => useUnsavedChanges());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });
});
