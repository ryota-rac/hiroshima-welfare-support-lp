# 障害福祉の相談・支援 LP

広島市の作業療法士・はり師・きゅう師による相談・支援サービスの静的LPです。

## ローカル確認

```bash
npm ci
npm run check
npm run build
npm run preview
```

## 公開

`main` へのpushでGitHub Actionsが `dist/` を生成し、GitHub Pagesへ公開します。Repository Settings > Pages > Source は **GitHub Actions** を選択します。

## 公開前に差し替える項目

- `[氏名]`、`[ひとこと]`、`[ ]`
- note / Instagram のURL
- 写真プレースホルダー
- `assets/js/site-config.js` のTRAEL・鍼灸院LP URL
- 特定商取引法に基づく表記の運営責任者・所在地・電話番号・支払・キャンセル・返金条件

## コラム追加

`content/stories/` にMarkdownを置くと、ビルド時に一覧カードが生成されます。記事が0件の間は準備中表示になります。

```md
---
title: 記事タイトル
tag: タグ
image: 写真の指示
url: 記事URL
---
```

架空の記事は置かないでください。
