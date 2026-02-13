/**
 * ノート管理カスタムフック
 *
 * React Query を使用してノートデータのフェッチとキャッシュを管理する。
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listNotes, createNote, getNote, updateNote, deleteNote } from '../services/noteService'
import type {
  ListNotesParams,
  ListNotesResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  Note,
} from '../types/note'

/**
 * ノート一覧を取得するカスタムフック
 */
export function useNotes(params?: ListNotesParams) {
  return useQuery<ListNotesResponse>({
    queryKey: ['notes', params],
    queryFn: () => listNotes(params),
  })
}

/**
 * ノート作成ミューテーションフック
 */
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation<Note, Error, CreateNoteRequest>({
    mutationFn: (data: CreateNoteRequest) => createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

/**
 * 指定された ID のノートを取得するカスタムフック
 */
export function useNote(noteId: string) {
  return useQuery<Note>({
    queryKey: ['notes', noteId],
    queryFn: () => getNote(noteId),
    enabled: !!noteId,
  })
}

/**
 * ノート更新ミューテーションフック
 */
export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation<Note, Error, { noteId: string; data: UpdateNoteRequest }>({
    mutationFn: ({ noteId, data }) => updateNote(noteId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', variables.noteId] })
    },
  })
}

/**
 * ノート削除ミューテーションフック
 */
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
