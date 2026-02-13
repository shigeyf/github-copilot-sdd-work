/**
 * ノート管理カスタムフック
 *
 * React Query を使用してノートデータのフェッチとキャッシュを管理する。
 */
import { useQuery } from '@tanstack/react-query'
import { listNotes } from '../services/noteService'
import type { ListNotesParams, ListNotesResponse } from '../types/note'

/**
 * ノート一覧を取得するカスタムフック
 */
export function useNotes(params?: ListNotesParams) {
  return useQuery<ListNotesResponse>({
    queryKey: ['notes', params],
    queryFn: () => listNotes(params),
  })
}
