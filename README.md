# seven_segments_timer

ブラウザだけで動く **7セグメント表示のカウントダウンタイマー**（HTML 1枚）です。

- 入力：`h:m:s`（例：`0:10:0`）
- 表示：`HH:MM:SS`（例：`00:10:00`）
- 操作：スタート / 一時停止 / リセット
- レスポンシブ：画面幅に合わせて7セグのサイズが自動フィット

## デモ（GitHub Pages）

▶ https://tarosay.github.io/seven_segments_timer/

## PWA（ホーム画面に追加 / オフライン対応）

このタイマーは **PWA 対応**しています。

- **インストール（PC）**：Chrome / Edge などでページを開き、アドレスバー付近の「インストール」から追加できます。
- **インストール（iOS）**：Safari で開き、共有メニューから **「ホーム画面に追加」**。
- **オフライン**：一度表示した後は、オフラインでも起動できます（Service Worker のキャッシュ）。

### 技術メモ

- `index.html` から `manifest.webmanifest` を参照し、Service Worker を登録しています。
- `service-worker.js` は `index.html` / `manifest.webmanifest` / アイコン類を **pre-cache** します。
- `end_sound.mp3` / `warn_sound.mp3` もオフラインで鳴らしたい場合は、`service-worker.js` の `OPTIONAL_ASSETS` に追加してください。
- キャッシュ更新を確実に反映したい場合は、`service-worker.js` の `CACHE_NAME` を更新（例：`...-v2`）してください。

## 使い方

### 1) すぐ試す

上の **デモ** を開いて、入力欄に `h:m:s` 形式で時間を入れて **スタート**。

- 入力を変更すると、停止中は即座に表示が更新されます（動作中は誤動作防止のため一度停止して反映）。
- 残り時間表示は「残りが分かりやすい」ように **切り上げ** で更新します。
- 0秒到達で `00:00:00` 表示になり、完了状態（配色変更）になります。


### 1.5) URLクエリで初期時間を指定（time パラメータ）

入力欄に手で入れる代わりに、URLのクエリ `time`（**秒**）で初期時間をセットできます。

- 例：`index.html?time=600` → **10分**（600秒）をセット
- 自動スタートはしません（スタートボタン押下で開始）
- `time` が数値でない／負数など不正な場合は無視されます

> 補足：画面上の入力フォーマットは従来どおり `h:m:s` ですが、`time` は「秒指定」です。

### 2) ローカルで動かす

このリポジトリを取得して `index.html` をブラウザで開くだけです（ビルド不要）。

```bash
git clone https://github.com/tarosay/seven_segments_timer.git
cd seven_segments_timer
# index.html をダブルクリックでOK
```

> ※ 追加の依存ライブラリはありません（素の HTML/CSS/JavaScript）。
> ※ **PWA（Service Worker）は** `file://` 直開きでは有効にならないため、必要ならローカルサーバ（例：`python -m http.server`）で開いてください。

## 仕様メモ

- 7セグ点灯マップ：`a,b,c,d,e,f,g` の7要素で管理
- 更新：`performance.now()` を基準に残り時間を計算し、約100ms間隔で描画
- 表示フィット：表示領域幅から各桁の幅/高さやセグ厚などのCSS変数を算出して追従

## ファイル構成

- `index.html` : 本体（UI + ロジック）
- `manifest.webmanifest` : PWA マニフェスト
- `service-worker.js` : PWA（オフライン用キャッシュ）
- `icons/` : PWA アイコン
- `LICENSE` : MIT

## ライセンス

MIT License（詳細は `LICENSE` を参照）
