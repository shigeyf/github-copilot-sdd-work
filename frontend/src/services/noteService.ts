/**
 * ノート API サービス
 *
 * axios を使用してバックエンドの REST API と通信するサービス関数群。
 * Vite プロキシを経由してバックエンドに接続する。
 */
import axios from 'axios'
import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  ListNotesParams,
  ListNotesResponse,
} from '../types/note'

/**
 * API ベース URL
 * Vite プロキシを経由してバックエンドに接続する
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * ノート一覧を取得する
 */
export async function listNotes(params?: ListNotesParams): Promise<ListNotesResponse> {
  const response = await apiClient.get<ListNotesResponse>('/notes', {
    params,
  })
  return response.data
}

/**
 * 指定された ID のノートを取得する
 */
export async function getNote(noteId: string): Promise<Note> {
  const response = await apiClient.get<Note>(`/notes/${noteId}`)
  return response.data
}

/**
 * 新しいノートを作成する
 */
export async function createNote(data: CreateNoteRequest): Promise<Note> {
  const response = await apiClient.post<Note>('/notes', data)
  return response.data
}

/**
 * 指定された ID のノートを更新する
 */
export async function updateNote(noteId: string, data: UpdateNoteRequest): Promise<Note> {
  const response = await apiClient.put<Note>(`/notes/${noteId}`, data)
  return response.data
}

/**
 * 指定された ID のノートを削除する
 */
export async function deleteNote(noteId: string): Promise<void> {
  await apiClient.delete(`/notes/${noteId}`)
}

/**
 * ヘルスチェック
 */
export async function healthCheck(): Promise<{
  status: string
  database: string
}> {
  const response = await apiClient.get<{ status: string; database: string }>('/health')
  return response.data
}
