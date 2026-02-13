/**
 * ノート管理カスタムフック
 *
 * React Query を使用してノートデータのフェッチとキャッシュを管理する。
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listNotes, createNote } from '../services/noteService'
import type { ListNotesParams, ListNotesResponse, CreateNoteRequest, Note } from '../types/note'

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
