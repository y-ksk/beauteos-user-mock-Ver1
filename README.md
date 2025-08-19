# BeauteOS User Mock (Shareable)

本モックは Vite + React + Tailwind で構築しています。**スマホ/タブレット/PC**の挙動を一つのURLで共有できます。

## ローカル実行（開発者向け）
```bash
npm install
npm run dev
# http://localhost:5173 へアクセス
```

## ビルド & 簡易配布（非エンジニアにも）
```bash
npm run build
# dist/ を静的ホスティングへアップロード
# 例: GitHub Pages / S3 / 社内Webサーバ / Vercel / Netlify など
```

## よくある共有パターン
- **Vercel/Netlify**: リポジトリを連携するだけでブランチ毎にURLが発行されます。
- **ZIP配布**: `npm run build` 後に `dist/` をまとめて送付すれば、`npx serve dist` で同じ挙動を再現可能。

## 使い方メモ
- 右上「🤖 ヘルプ」… PCでAIコパイロットを開閉。スマホは中央の黒丸で開閉。
- 「AIプラン作成」… 画像付き目標/カテゴリ/予算から8週間プラン生成（モック）。
- 「プランのタイムライン」… ワンクリック予約でHPB連携の擬似挙動を表示。
- 「おすすめ商品」… 3つ中2つは「あなた向け」表示。根拠はサロン提供データに依拠（モック）。
- 画面下タブ右端の **HPB** … ホットペッパービューティへ遷移。

## 依存
- Node.js 18+ 推奨
