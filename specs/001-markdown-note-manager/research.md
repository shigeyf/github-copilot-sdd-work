---

description: "Markdownノート管理アプリの技術調査結果"

---

# 調査報告書: Markdownノート管理アプリ

**日付**: 2026-02-12 | **計画書**: [plan.md](./plan.md)

このドキュメントは、実装計画の技術コンテキストで「要確認」とマークされた項目について調査した結果をまとめたものです。

## フロントエンド技術選定

### 1. Markdown エディタライブラリ (WYSIWYG 機能用)

**決定**: **TipTap** を採用

**根拠**:
- React 18+ と TypeScript に完全対応
- 拡張可能なアーキテクチャで Markdown 拡張を簡単に追加可能
- WYSIWYG と Markdown モードの両方をサポート
- ProseMirror ベースで堅牢な編集体験を提供
- アクティブに開発・保守されている (2024年以降も更新継続)
- MIT ライセンスで商用利用可能

**検討した代替案**:
- **CodeMirror 6**: 高性能だが、WYSIWYG 機能の実装が複雑
- **Draft.js**: Facebook 製だが、開発が停滞気味
- **Slate**: 柔軟性は高いが、学習コストが高い
- **Quill**: シンプルだが、Markdown ネイティブサポートが弱い

### 2. Markdown パーサー/レンダラー (プレビュー機能用)

**決定**: **react-markdown** を採用

**根拠**:
- React コンポーネントとして Markdown をレンダリング
- 軽量で高速、セキュリティ対策 (XSS 防止) が組み込み済み
- remark プラグインエコシステムに対応し、拡張性が高い
- GitHub Flavored Markdown (GFM) をサポート
- TypeScript 型定義が充実
- アクティブに保守されている

**検討した代替案**:
- **marked**: 高速だが、React 統合が手動で必要
- **markdown-it**: プラグインが豊富だが、React コンポーネント化が複雑
- **unified (remark/rehype)**: 最も柔軟だが、設定が複雑

### 3. 状態管理ライブラリ

**決定**: **Zustand** を採用

**根拠**:
- 軽量 (1KB 未満) でシンプルな API
- React 18+ の concurrent features と互換性あり
- TypeScript サポートが優れている
- ボイラープレートが少なく、学習コストが低い
- Redux DevTools と統合可能
- グローバル状態とローカル状態の両方に対応

**検討した代替案**:
- **React Query (TanStack Query)**: サーバー状態管理には最適だが、今回はシンプルなクライアント状態管理で十分
- **Redux Toolkit**: 大規模アプリには適しているが、今回のスコープにはオーバースペック
- **Jotai**: Zustand と同様に軽量だが、atom ベースの概念が複雑
- **Recoil**: Facebook 製だが、API が安定していない

**補足**: サーバー状態管理 (API 呼び出しのキャッシュ、再取得など) には **React Query** の併用を検討。ノート一覧の取得・更新で有用。

### 4. HTTP クライアントライブラリ

**決定**: **axios** を採用

**根拠**:
- 広く使用されており、実績が豊富
- インターセプター機能でリクエスト/レスポンスの共通処理を実装可能
- エラーハンドリングが fetch より直感的
- TypeScript サポートが充実
- ブラウザとNode.js の両方で動作 (テスト時に有用)
- リクエストキャンセル機能あり

**検討した代替案**:
- **fetch (ネイティブ)**: 追加ライブラリ不要だが、エラーハンドリングやインターセプターを手動実装する必要がある
- **ky**: モダンで軽量だが、axios ほど広く使用されていない
- **superagent**: 古典的だが、最近の更新頻度が低い

**補足**: React Query を導入する場合、fetch ベースでも問題ないが、axios のインターセプターはエラー処理やログ出力に便利。

### 5. UI コンポーネントライブラリ (オプション)

**決定**: **Tailwind CSS** + **Headless UI** を採用

**根拠**:
- Tailwind CSS: ユーティリティファーストで開発速度が速い、カスタマイズ性が高い
- Headless UI: アクセシビリティに配慮された UI プリミティブを提供
- React 18+ と TypeScript に対応
- 軽量で、必要な部分のみを使用可能
- デザインシステムの構築が容易

**検討した代替案**:
- **Material-UI (MUI)**: 完全なコンポーネントセットだが、デザインの自由度が低い
- **Ant Design**: 企業向けデザインだが、カスタマイズが複雑
- **Chakra UI**: 優れたアクセシビリティだが、バンドルサイズが大きい
- **素の CSS / CSS Modules**: 完全な自由度だが、開発速度が遅い

## バックエンド技術選定

### 6. MongoDB ドライバー

**決定**: **motor** を採用

**根拠**:
- FastAPI の非同期処理 (asyncio) にネイティブ対応
- pymongo の非同期ラッパーで、API が類似しており学習コストが低い
- 公式の MongoDB ドライバーで、安定性と信頼性が高い
- FastAPI のパフォーマンスを最大限に活用可能

**検討した代替案**:
- **pymongo**: 同期処理のため、FastAPI の非同期処理の恩恵を受けられない
- **odmantic**: ODM (Object-Document Mapper) だが、今回はシンプルなスキーマなのでオーバースペック
- **beanie**: Pydantic ベースの ODM で魅力的だが、追加の抽象化レイヤーが不要

### 7. CORS ミドルウェア設定

**決定**: FastAPI 組み込みの **CORSMiddleware** を使用

**根拠**:
- FastAPI に標準搭載されており、追加のライブラリが不要
- 設定が簡潔で、origins、methods、headers を柔軟に指定可能
- 開発環境では `allow_origins=["*"]` で簡単に設定
- 本番環境ではフロントエンドのドメインのみを許可

**実装例**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite のデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 8. ロギング・モニタリング設定

**決定**: Python 標準ライブラリの **logging** + **structlog** を採用

**根拠**:
- logging: Python 標準で、追加のインストール不要
- structlog: 構造化ログ (JSON 形式) をサポートし、CloudWatch や Azure Monitor との統合が容易
- ログレベル (DEBUG, INFO, WARNING, ERROR, CRITICAL) の適切な管理
- リクエスト ID をログに含めることで、トレーサビリティを確保

**検討した代替案**:
- **loguru**: シンプルで強力だが、標準ライブラリで十分
- **Python Logging のみ**: 構造化ログのサポートが弱い
- **OpenTelemetry**: 将来的な監視強化には有用だが、初期段階ではオーバースペック

**補足**: 将来的に Azure Application Insights と統合する場合は、`opencensus-ext-azure` を追加。

## テスト技術選定

### 9. E2E テストフレームワーク

**決定**: **Playwright** を採用

**根拠**:
- 複数ブラウザ (Chromium, Firefox, WebKit) に対応
- 高速で信頼性の高いテスト実行
- TypeScript サポートが優れている
- ヘッドレスモードとヘッドフルモードの両方に対応
- トレースビューアーでデバッグが容易
- Microsoft 製で、Azure Pipelines との統合が良好

**検討した代替案**:
- **Cypress**: 人気が高いが、複数タブのサポートが弱い
- **Puppeteer**: Chromium のみで、他のブラウザをサポートしない
- **Selenium**: 古典的だが、遅くて脆弱なテストになりがち

### 10. API 契約テスト

**決定**: **pytest** + **httpx** + **OpenAPI スキーマ検証** を組み合わせて使用

**根拠**:
- pytest: バックエンドのユニットテストと統合しやすい
- httpx: FastAPI の非同期テストクライアントで、TestClient よりも柔軟
- OpenAPI スキーマ検証: FastAPI が自動生成する OpenAPI スキーマを検証に使用

**実装アプローチ**:
1. FastAPI の `/openapi.json` エンドポイントからスキーマを取得
2. レスポンスがスキーマに準拠しているかを `jsonschema` ライブラリで検証
3. すべてのエンドポイントに対してスキーマ準拠テストを自動化

**検討した代替案**:
- **Dredd**: 契約テスト専用ツールだが、Python エコシステムとの統合が弱い
- **Pact**: コンシューマー駆動契約テストだが、今回はシンプルな構成なので不要
- **Schemathesis**: プロパティベーステストで魅力的だが、学習コストが高い

## アーキテクチャパターン

### 11. フロントエンドのデータフェッチ戦略

**決定**: **React Query (TanStack Query)** を採用

**根拠**:
- サーバー状態管理に特化しており、キャッシュ、再取得、楽観的更新を自動化
- Zustand (クライアント状態) と併用可能
- ローディング、エラー、成功状態の管理が簡単
- DevTools でデータフローを可視化可能
- 自動的な背景更新 (stale-while-revalidate)

**実装アプローチ**:
- ノート一覧の取得: `useQuery` で自動キャッシュ・再取得
- ノート作成/編集/削除: `useMutation` で楽観的更新

### 12. バックエンドの依存性注入

**決定**: FastAPI の **Depends** システムを使用

**根拠**:
- FastAPI に組み込まれており、追加のライブラリが不要
- テスト時にモック化が容易
- MongoDB 接続、設定、サービス層の注入に使用

**実装例**:
```python
from fastapi import Depends

async def get_database():
    # MongoDB 接続を返す
    ...

@app.get("/notes")
async def list_notes(db = Depends(get_database)):
    # db を使用してノートを取得
    ...
```

## セキュリティ考慮事項

### 13. XSS (クロスサイトスクリプティング) 対策

**決定**:
- **react-markdown**: デフォルトで HTML タグをサニタイズ
- **DOMPurify**: 追加の HTML サニタイズが必要な場合に使用
- **Content-Security-Policy (CSP)**: HTTP ヘッダーで外部スクリプトの実行を制限

**実装アプローチ**:
1. react-markdown の `allowedElements` プロパティで許可する HTML タグを制限
2. ユーザー入力をそのまま `dangerouslySetInnerHTML` で挿入しない
3. FastAPI の応答ヘッダーに CSP を設定

### 14. 入力バリデーション

**決定**: Pydantic モデルで厳密なバリデーション

**根拠**:
- FastAPI は Pydantic と統合されており、自動バリデーションが可能
- タイトルの最大長、本文の最大長を制限
- UUID v4 の形式検証
- 不正な文字列や SQL/NoSQL インジェクション対策

**バリデーションルール**:
- タイトル: 1〜200文字、必須
- 本文: 0〜50,000文字、任意
- ID: UUID v4 形式、自動生成

## パフォーマンス最適化

### 15. フロントエンドの最適化

**決定**:
- **コード分割**: React.lazy と Suspense でページごとにバンドルを分割
- **メモ化**: React.memo でコンポーネントの不要な再レンダリングを防止
- **仮想スクロール**: 大量のノート一覧表示時に react-window を使用
- **デバウンス**: Markdown プレビュー更新を 300ms デバウンスして負荷軽減

### 16. バックエンドの最適化

**決定**:
- **MongoDB インデックス**: `created_at` と `updated_at` にインデックスを作成
- **ページネーション**: ノート一覧 API に `skip` と `limit` パラメータを追加
- **非同期処理**: motor で非同期 I/O を最大限活用
- **キャッシュ**: 将来的に Redis キャッシュを検討 (現時点では不要)

## 開発環境セットアップ

### 17. Docker 構成

**決定**: Docker Compose で MongoDB、バックエンド、フロントエンドを管理

**根拠**:
- 環境の一貫性を確保
- CI/CD パイプラインとの統合が容易
- 新しい開発者のオンボーディングが簡単

**docker-compose.yml の構成**:
```yaml
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/notes
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

## まとめ

すべての「要確認」項目について調査を完了しました。主要な技術選定の結果:

**フロントエンド**:
- エディタ: TipTap (WYSIWYG + Markdown)
- Markdown レンダラー: react-markdown
- 状態管理: Zustand (クライアント状態) + React Query (サーバー状態)
- HTTP クライアント: axios
- UI: Tailwind CSS + Headless UI
- E2E テスト: Playwright

**バックエンド**:
- MongoDB ドライバー: motor (非同期)
- CORS: FastAPI CORSMiddleware
- ロギング: structlog
- 依存性注入: FastAPI Depends

**アーキテクチャ**:
- フロントエンド: React Query でデータフェッチ、Zustand で UI 状態管理
- バックエンド: Repository → Service → Router の3層構造
- セキュリティ: Pydantic バリデーション、react-markdown による XSS 対策

これらの選定により、モダンで保守性の高い、パフォーマンスに優れたアプリケーションを構築できます。

---

**次のステップ**: フェーズ 1 (設計) を開始し、`data-model.md`、`contracts/openapi.yaml`、`quickstart.md` を作成します。
