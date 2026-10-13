# Zoom VTT Cleaner (研究室向け文字起こし整形 Webアプリ)

Zoomの会議録画から出力される文字起こし（`.vtt`）ファイルから、不要なタイムスタンプ・キュー番号・ヘッダーを除去し、AI要約（ChatGPT / Claude / Gemini）やWord議事録に最適なクリーンテキストに整形するWebアプリケーションです。

---

## 🌟 主な特徴

1. **研究室のデータも安全（100% ブラウザ完結）**
   - アップロードされた `.vtt` ファイルや文字起こしデータは、**外部サーバーや第三者クラウドに一切送信されません**。すべてお使いのブラウザ内部（JavaScript）で処理されるため、機密性の高い研究ディスカッションや未発表データも安心して扱えます。
2. **Zoom特有の細切れ発言を自動マージ**
   - 「連続発言を1つに結合」オプションにより、Zoomの自動認識で数秒ごとに細切れになった同じ話者の発言を自然な1つの段落にまとめます。
3. **ワンクリックでAI要約プロンプトを付与**
   - 「標準的な要約」「研究室ゼミ・進捗報告用」「ToDo抽出」など、目的に合わせたプロンプトをテキスト先頭に自動挿入。そのままChatGPTやGeminiに貼り付けるだけで高精度な要約が得られます。
4. **複数ファイル一括処理 & ZIPダウンロード**
   - 複数回分のミーティング文字起こしを一括でドラッグ＆ドロップして変換し、まとめてZIP形式でダウンロード可能です。
5. **完全無料で運用可能**
   - 静的Webアプリケーション（SPA）のため、GitHubとVercel（Hobby無料プラン）で永続的に無料公開・共有できます。

---

## 🚀 使い方

1. **文字起こしを入力**:
   - Zoomからダウンロードした `.vtt` ファイルをドラッグ＆ドロップ（または「テキスト直貼り」タブにコピペ）。
   - ※画面右上の「研究室MTGのサンプルを試す」を押すと、実際の動作を1秒で体験できます。
2. **オプションを調整**:
   - タイムスタンプの有無（なし / 簡易 [01:23] / 詳細）
   - 話者名の有無
   - フィラー表現（「えー」「あのー」等）の自動削除
3. **AIプロンプトを選択（任意）**:
   - ゼミ記録用、標準要約、ToDo抽出などのテンプレートを選択。
4. **コピーまたはダウンロード**:
   - 「コピー」ボタンを押してAIチャットに貼り付けるか、「.txt 保存」で手元に保存。

---

## 🛠️ GitHub & Vercel へのデプロイ手順（無料公開マニュアル）

研究室のメンバー全員がブラウザからアクセスできるように、GitHubとVercelを使って無料でデプロイする手順です。所要時間は**約3〜5分**です。

### ステップ1: GitHubにリポジトリを作成

1. [GitHub](https://github.com/) にログインし、右上の「＋」アイコンから **「New repository」** をクリックします。
2. リポジトリ名（例: `zoom-vtt-cleaner`）を入力します。
3. 「Public」または「Private」を選択します（どちらでもVercelに連携可能ですが、研究室メンバーのみにURLを共有したい場合はPrivateでも構いません）。
4. 「Create repository」をクリックします。

### ステップ2: ローカルからGitHubへPush

ターミナル（PowerShell等）で本プロジェクトのディレクトリを開き、以下のコマンドを順に実行します（`<YOUR-GITHUB-USERNAME>` はご自身のGitHubユーザー名に置き換えてください）：

```bash
# Git初期化とコミット（まだの場合）
git init
git add .
git commit -m "Initial commit: Zoom VTT Cleaner"

# ブランチ名を main に設定
git branch -M main

# GitHubのリモートリポジトリを紐付け
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/zoom-vtt-cleaner.git

# GitHubへプッシュ
git push -u origin main
```

### ステップ3: Vercelで無料デプロイ

1. [Vercel](https://vercel.com/) にアクセスし、**「Sign Up」または「Log In」**（GitHubアカウントでログインすると最もスムーズです）。
2. ダッシュボードの右上にある **「Add New...」** → **「Project」** をクリックします。
3. 先ほどGitHubにPushした `zoom-vtt-cleaner` リポジトリを探し、**「Import」** をクリックします。
4. 設定画面が表示されます：
   - **Framework Preset**: `Vite` が自動検出されます（そのままでOK）。
   - **Build and Output Settings**: デフォルトのままでOK（Build: `npm run build`, Output: `dist`）。
5. **「Deploy」** ボタンをクリックします。
6. 約30秒〜1分でビルドが完了し、`https://zoom-vtt-cleaner-xxxx.vercel.app` のような公開URLが発行されます！🎉

### ステップ4: 研究室メンバーへの共有

発行されたURLを研究室のSlackやLINE、Notion等に共有するだけで、メンバー全員が追加インストールなしでブラウザから即座に利用できます。
GitHubの `main` ブランチにコードを push すると、Vercelが自動的に検知して常に最新版へと更新されます。

---

## 💻 ローカルでの開発・実行

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動 (http://localhost:5173)
npm run dev

# プロダクションビルド
npm run build

# ビルド成果物のプレビュー
npm run preview
```

---

## 📄 ライセンス

MIT License
