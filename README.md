# 元 dialogflow functions

※ 現在は firebase functions のみとなっている

## 開発環境構築

- 対象プロジェクトから Realtime Database を export し `functions/data` 配下に `default-rtdb-export.json` という名称でデータを置く
- `.firebaserc` を設定する

.firebaserc sample

```
{
  "projects": {
    "default": "aaa"
  }
}
```

## 実行

1. `functions` ディレクトリで `npm run serve` する
1. Postman に保存されているリクエストの body を変えて実行テストしたい機能を呼び出す

## その他

direnv が必須