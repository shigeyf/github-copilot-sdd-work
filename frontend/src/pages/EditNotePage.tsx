/**
 * ノート編集ページ
 *
 * 既存のノートデータをロードし、NoteEditor を使って編集する。
 * 保存後に一覧画面へ遷移する。
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NoteEditor from "../components/NoteEditor";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import UnsavedChangesDialog from "../components/UnsavedChangesDialog";
import { useNote, useUpdateNote, useDeleteNote } from "../hooks/useNotes";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import type { CreateNoteRequest } from "../types/note";

/**
 * ノート編集ページコンポーネント
 */
function EditNotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: note, isLoading, isError, error } = useNote(id ?? "");
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    showDialog,
    closeDialog,
    confirmDiscard,
    openDialog,
    setPendingNavigation,
  } = useUnsavedChanges();

  const handleSave = (data: CreateNoteRequest) => {
    if (!id) return;
    updateNote.mutate(
      { noteId: id, data: { title: data.title, content: data.content } },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          navigate("/");
        },
      },
    );
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigate("/"));
      openDialog();
    } else {
      navigate("/");
    }
  };

  const handleChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!id) return;
    deleteNote.mutate(id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        navigate("/");
      },
    });
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>エラーが発生しました</p>
        <p className="text-sm mt-2">
          {error instanceof Error
            ? error.message
            : "ノートの取得に失敗しました"}
        </p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>ノートが見つかりません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">ノート編集</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            削除
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            一覧に戻る
          </button>
        </div>
      </div>
      {updateNote.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ノートの更新に失敗しました。もう一度お試しください。
        </div>
      )}
      {deleteNote.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ノートの削除に失敗しました。もう一度お試しください。
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-6">
        <NoteEditor
          onSave={handleSave}
          initialTitle={note.title}
          initialContent={note.content}
          isSaving={updateNote.isPending}
          onChange={handleChange}
        />
      </div>
      <UnsavedChangesDialog
        isOpen={showDialog}
        onCancel={closeDialog}
        onDiscard={confirmDiscard}
      />
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        noteTitle={note.title}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteNote.isPending}
      />
    </div>
  );
}

export default EditNotePage;
