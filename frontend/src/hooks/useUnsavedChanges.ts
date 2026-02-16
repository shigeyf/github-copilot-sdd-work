/**
 * 未保存変更検出カスタムフック
 *
 * フォームの変更を監視し、未保存の変更があるかどうかを追跡する。
 * ページ遷移時に確認ダイアログを表示するための状態管理を提供する。
 */
import { useState, useCallback, useEffect } from "react";

interface UseUnsavedChangesReturn {
  /** 未保存の変更があるかどうか */
  hasUnsavedChanges: boolean;

  /** 未保存変更のフラグを設定する */
  setHasUnsavedChanges: (value: boolean) => void;

  /** 確認ダイアログが表示中かどうか */
  showDialog: boolean;

  /** 確認ダイアログを表示する */
  openDialog: () => void;

  /** 確認ダイアログを閉じる */
  closeDialog: () => void;

  /** 変更を破棄して遷移を続行する */
  confirmDiscard: () => void;

  /** 遷移先パスを設定するコールバック */
  setPendingNavigation: (callback: (() => void) | null) => void;
}

/**
 * 未保存変更の検出と警告ダイアログの状態管理を行うカスタムフック
 */
export function useUnsavedChanges(): UseUnsavedChangesReturn {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigationState] = useState<
    (() => void) | null
  >(null);

  const openDialog = useCallback(() => {
    setShowDialog(true);
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setPendingNavigationState(null);
  }, []);

  const confirmDiscard = useCallback(() => {
    setShowDialog(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      pendingNavigation();
    }
    setPendingNavigationState(null);
  }, [pendingNavigation]);

  const setPendingNavigation = useCallback((callback: (() => void) | null) => {
    setPendingNavigationState(() => callback);
  }, []);

  // ブラウザの beforeunload イベントで警告を表示する
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    showDialog,
    openDialog,
    closeDialog,
    confirmDiscard,
    setPendingNavigation,
  };
}
