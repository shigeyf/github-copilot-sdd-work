/**
 * ノート作成ページ
 *
 * NoteEditor を表示し、保存後に一覧画面へ遷移する。
 */
import { useNavigate } from "react-router-dom";
import NoteEditor from "../components/NoteEditor";
import UnsavedChangesDialog from "../components/UnsavedChangesDialog";
import { useCreateNote } from "../hooks/useNotes";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import type { CreateNoteRequest } from "../types/note";

/**
 * ノート作成ページコンポーネント
 */
function CreateNotePage() {
  const navigate = useNavigate();
  const createNote = useCreateNote();
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
    createNote.mutate(data, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        navigate("/");
      },
    });
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">新規ノート作成</h2>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          一覧に戻る
        </button>
      </div>
      {createNote.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          ノートの作成に失敗しました。もう一度お試しください。
        </div>
      )}
      <div className="bg-white shadow rounded-lg p-6">
        <NoteEditor
          onSave={handleSave}
          isSaving={createNote.isPending}
          onChange={handleChange}
        />
      </div>
      <UnsavedChangesDialog
        isOpen={showDialog}
        onCancel={closeDialog}
        onDiscard={confirmDiscard}
      />
    </div>
  );
}

export default CreateNotePage;
