/**
 * Note エンティティの型定義
 */
export interface Note {
  /** ノートの一意識別子 (UUID v4) */
  id: string

  /** ノートのタイトル */
  title: string

  /** Markdown 形式の本文 */
  content: string

  /** 作成日時 (ISO 8601 文字列) */
  created_at: string

  /** 最終更新日時 (ISO 8601 文字列) */
  updated_at: string
}

/**
 * ノート作成時のリクエスト型
 */
export interface CreateNoteRequest {
  /** ノートのタイトル */
  title: string

  /** Markdown 形式の本文 (任意) */
  content?: string
}

/**
 * ノート更新時のリクエスト型
 */
export interface UpdateNoteRequest {
  /** ノートのタイトル (任意) */
  title?: string

  /** Markdown 形式の本文 (任意) */
  content?: string
}

/**
 * ノート一覧取得時のクエリパラメータ型
 */
export interface ListNotesParams {
  /** ソート順 (created_at または updated_at) */
  sort_by?: 'created_at' | 'updated_at'

  /** ソート方向 (asc または desc) */
  order?: 'asc' | 'desc'

  /** ページネーション: スキップする件数 */
  skip?: number

  /** ページネーション: 取得する件数 */
  limit?: number
}

/**
 * ノート一覧レスポンス型
 */
export interface ListNotesResponse {
  /** ノートの配列 */
  notes: Note[]

  /** 全ノート数 */
  total: number

  /** スキップした件数 */
  skip: number

  /** 取得した件数 */
  limit: number
}
