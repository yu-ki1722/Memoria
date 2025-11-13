# Memoria（メモリア）
**思い出を地図に記録する思い出記録マップアプリ**

👉 https://memoria-nine-iota.vercel.app/

---

## 概要

Memoria（メモリア）は、写真・動画・文章・感情・タグ・場所・日付を  
ひとつの「思い出」として地図上に記録できる 思い出記録マップアプリです。

アプリ名の由来は  
Memory（記憶） + Aria（空気・空間） + Area（地域）  
からとっており、  
「人々の思い出が空気のように漂い、満ちていく場所」 をコンセプトにしています。

Memoria は単なる「思い出記録アプリ」ではなく、  
人の思い出と場所、そして感情をつなぐ「新しい地図体験」を目指したプロダクトです。

* 思い出したい記憶を、地図を開けばすぐに“その時の気持ちごと”思い出せる
* 大切な人との記録が、地図上に物語のように積み上がっていく
* 時間が経って薄れていく感情までも、場所に紐づけて残しておける

ただ場所に行った記録ではなく、「その瞬間の空気」を地図に閉じ込めるような体験を届けます。

---

## 主な機能

### マップページ
* 思い出をピンとして地図に記録（感情・タグ・写真/動画・場所・本文・日付）
* ピンをクリックして詳細表示
* 思い出の編集 / 削除
* Google Places / Mapbox の場所検索
* POI（観光地・店など）の詳細取得
* 思い出検索（タグ / 感情 / キーワード / 日付 / 場所）
* 現在地ボタン
* アカウントボタン（ログイン中メール表示・ログアウト）

### 思い出一覧ページ
* 月ごとに自動整理
* 1 / 2 / 4 カラム切替
* 詳細表示
* マップと同じ検索機能
* マップ上で該当思い出を表示

### タグ管理ページ
* タグの作成 / 削除 / 並び替え / お気に入り設定
* タグ反映が思い出作成フォームに即反映

### ログイン機能
* Email ログイン
* Google アカウント連携
* GitHub アカウント連携（Supabase Auth）

---

## 使用技術

### フロントエンド
* React 18
* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion

### バックエンド / DB
* Supabase (Database / Auth / Storage / Row Level Security)

### 外部 API
* Mapbox GL JS（マップ描画・逆ジオコーディング）
* Google Places API（POI検索・詳細情報取得）

### その他
* Twemoji（感情アイコンの統一表示）
* Vercel デプロイ

---

## ディレクトリ構成

```text
src/
├── app/
│   ├── api/                  # API Routes（Place検索 / 詳細 / Supabase 経由など）
│   │   ├── placeDetail/
│   │   │   └── route.ts      # Google Places 詳細取得
│   │   ├── places/
│   │   │   └── route.ts      # Google Places 検索
│   │   └── searchPlaces/
│   │       └── route.ts      # 検索用ルート
│   ├── login/
│   │   └── page.tsx          # ログインページ
│   ├── welcome/
│   │   └── page.tsx          # 初回ウェルカムページ
│   ├── map/
│   │   └── page.tsx          # メインのマップ画面
│   ├── memories/
│   │   └── page.tsx          # 思い出一覧ページ
│   ├── tag-manager/
│   │   └── page.tsx          # タグ管理ページ
│   ├── layout.tsx            # グローバルレイアウト
│   ├── page.tsx              # ルートページ
│   └── globals.css           # 全体スタイル
│
├── components/
│   ├── Map/
│   │   ├── index.tsx         # Map wrapper（機能集約）
│   │   └── Map.module.css    # Map 用スタイル
│   ├── Button.tsx            # 共通ボタン
│   ├── Footer.tsx            # フッター
│   ├── Header.tsx            # ヘッダー
│   ├── MapLoader.tsx         # ローディング画面
│   ├── SearchButton.tsx      # マップ用検索ボタン
│   ├── MemorySearchButton.tsx  # 思い出検索ボタン
│   ├── MemorySearchModal.tsx   # 思い出検索モーダル
│   ├── MemoriesListSearchModal.tsx # 一覧ページの検索モーダル
│   ├── MemoryDetailModal.tsx   # 思い出の詳細ポップアップ
│   ├── MemoryForm.tsx        # 思い出の作成・更新フォーム
│   ├── MemoryPinIcon.tsx     # ピンのSVG
│   ├── TagManagerModal.tsx   # タグ管理モーダル
│   ├── TagManagerButton.tsx  # タグボタン
│   ├── PlaceSearchModal.tsx  # Google Place 検索モーダル
│   ├── PlaceDetailPanel.tsx  # POI の詳細パネル
│   ├── RealtimeLocationMarker.tsx # 現在地マーカー
│   └── GeocoderControl.tsx   # Mapbox ジオコーダー
│
├── constants/
│
├── lib/
│   ├── supabaseClient.ts     # Supabase クライアント
│   └── twemoji.ts            # 絵文字 → Twemoji 変換
│
├── types/
│   ├── react-map-gl.d.ts     # Mapbox 用型定義
│   └── middleware.ts         # Auth セッション管理
│
├── .env.example              # 環境変数テンプレ
├── next.config.ts
├── tailwind.config.js
└── package.json
```
---
## セットアップ方法

以下の手順を進めれば、開発環境・Supabase・API 連携まで含めてMemoriaを動かせます。

1.  **リポジトリのクローン**
    ```bash
    git clone https://github.com/yu-ki1722/Memoria.git
    cd Memoria
    ```

2.  **依存パッケージのインストール**
    ```bash
    npm install
    ```

3.  **.env の設定**
    1.  テンプレートをコピー
        ```bash
        cp .env.example .env
        ```
    2.  `.env` に以下を記述（Supabase / Mapbox / Google API）
        ```env
        NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
        
        NEXT_PUBLIC_MAPBOX_TOKEN=あなたのMapbox公開トークン
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=あなたのGoogle Maps APIキー
        ```

4.  **Supabase のセットアップ**
    1.  **Supabase プロジェクト作成**
        * [https://supabase.com](https://supabase.com)にログイン
        * New project → プロジェクト作成
        * Project URL と anon key を `.env` に貼る
    2.  **Database Schema の導入**
        * Supabase の Dashboard → SQL Editor → 以下を貼って実行
        ```sql
        -- users（認証は auth.users、ここには拡張カラムのみ必要なら追加）
        -- 今回は auth.users のみを使用
        
        -- memories
        create table memories (
          id bigint generated always as identity primary key,
          user_id uuid references auth.users(id) on delete cascade,
          emotion text not null,
          text text not null,
          image_url text,
          latitude double precision not null,
          longitude double precision not null,
          tags text[],
          prefecture text,
          city text,
          place_name text,
          place_id text,
          place_address text,
          created_at timestamp with time zone default now()
        );
        
        -- tags
        create table tags (
          id bigint generated always as identity primary key,
          user_id uuid references auth.users(id) on delete cascade,
          name text not null,
          is_favorite boolean default false,
          order int default 0,
          created_at timestamp with time zone default now()
        );
        
        -- user_preferences
        create table user_preferences (
          user_id uuid primary key references auth.users(id) on delete cascade,
          sort_option text default 'newest'
        );
        ```
    3.  **Row Level Security (RLS) の設定**
        * Supabase の Dashboard → SQL Editor → 以下を（テーブルごとに）貼って実行
        ```sql
        -- memories
        alter table memories enable row level security;
        
        create policy "ユーザー本人の思い出のみ閲覧"
        on memories for select
        using (auth.uid() = user_id);
        
        create policy "ユーザー本人のみ挿入"
        on memories for insert
        with check (auth.uid() = user_id);
        
        create policy "ユーザー本人のみ更新"
        on memories for update
        using (auth.uid() = user_id);
        
        create policy "ユーザー本人のみ削除"
        on memories for delete
        using (auth.uid() = user_id);
        
        -- tags
        alter table tags enable row level security;
        
        create policy "ユーザー本人のタグのみ閲覧"
        on tags for select
        using (auth.uid() = user_id);
        
        create policy "ユーザー本人のみ追加"
        on tags for insert
        with check (auth.uid() = user_id);
        
        create policy "ユーザー本人のみ更新"
        on tags for update
        using (auth.uid() = user_id);
        
        create policy "ユーザー本人のみ削除"
        on tags for delete
        using (auth.uid() = user_id);
        
        -- user_preferences
        alter table user_preferences enable row level security;
        
        create policy "本人のみ閲覧"
        on user_preferences for select
        using (auth.uid() = user_id);
        
        create policy "本人のみ書き込み"
        on user_preferences for insert
        with check (auth.uid() = user_id);
        
        create policy "本人のみ更新"
        on user_preferences for update
        using (auth.uid() = user_id);
        ```

5.  **認証プロバイダの設定（Google / GitHub）**
    * Supabase → Authentication → Providers → Google と GitHub を有効化。
    * Google の場合：
        * OAuth Client ID / Secret を登録
        * "Authorized redirect URI" に以下を設定：  
            `https://<あなたのプロジェクト>.supabase.co/auth/v1/callback`

6.  **API（Mapbox & Google Places）の設定**
    * **Mapbox**
        * [https://account.mapbox.com/](https://account.mapbox.com/)
        * Public Access Token を取得、`.env` の `NEXT_PUBLIC_MAPBOX_TOKEN` に貼る
        * "Allowed Domains" に以下を追加  
            `http://localhost:3000`
    * **Google Cloud Platform**
        * [https://console.cloud.google.com](https://console.cloud.google.com)
        * API を有効化
            * Places API
            * Maps JavaScript API
        * API Key を発行し `.env` に貼る
        * Application restrictions →  
            `http://localhost:3000` を許可

7.  **ローカル開発サーバーの起動**
    ```bash
    npm run dev
    ```
    http://localhost:3000にアクセス。  
    ログイン → マップページ → 思い出記録 まで動けば成功

8.  **ビルド（本番）**
    ```bash
    npm run build
    npm start
    ```

---

## 工夫したポイント

### 人とのつながりや「幸せな記憶」を育てる設計
Memoria は、単に写真を保存するだけでなく、「誰かとの思い出が地図上に残っていくこと」でつながりを感じられるアプリを目指しました。同じ場所をまた訪れたときに、「ここでこんなことがあったな」と懐かしさを思い出したり、時間とともに薄れてしまった記憶をそっと呼び起こせるような体験を意識しています。

### アプリの構想と汎用性
Memoria は単なる“思い出記録アプリ”ではなく、  
「人と場所、感情をつなぐ新しい地図体験」 を目指したプロダクトです。  
個人の思い出を残すだけでなく、使い方次第でどこまでも拡張できる柔軟な設計にしています。

* **個人のライフログとして** 旅・日常・食べ物・イベントなど、自分だけの記憶地図を作成できる。
* **大切な人との思い出共有に** 恋人、友人、家族と、一緒に行った場所やそこでの思い出を可視化し、将来見返したときや同じ血を音連れたときに「あの時の思い出」を思い出せる。
* **クリエイター・有名人の公開マップとして** 例えばアーティストがライブ会場やイベントごとに思い出を投稿すれば、ファンは “その人が歩んできた軌跡” を辿ることができる。聖地巡礼の地図としても活用できる。Memoriaを通じてファンとつながることができる。
* **グルメ・スポットの個人ガイドマップとして** タグ機能を活かして、「食べ物」「カフェ」「絶景スポット」など、様々な分野の思い出を記録し、自分の興味でマップを育てられる。
* **自由度の高い拡張性** 感情タグ × フォト/動画 × 位置情報 という構造のため、ユーザーが好きなテーマで“世界に1つだけのマップ”を作れる。

Memoria は “思い出 × 地図 × 感情” を軸に、人それぞれのストーリーを地図上に描ける新しい体験を提供したいという想いから作成しました。

### ふんわりとした世界観のUIデザイン
感情を扱うアプリであることから、尖った印象ではなく、落ち着いて思い出に浸れるような「ふんわり感」のある UI をデザインしました。淡いカラーリング、丸みのあるカードやボタン、柔らかいシャドウを組み合わせることで、地図全体が一冊の思い出アルバムのように感じられるよう工夫しています。

### スマホ特化の直感的なUX設計
スマートフォンでの利用を前提に、できる限り直感的に操作できるようUI/UXを工夫しました。片手操作でもストレスなく使えるように、ボタンの配置・サイズ・指の届きやすさを重視しました。よく使うアクションは親指だけで届く位置にまとめ、ストレスなく操作できる“手に馴染む体験”を実現しています。

### セキュリティ面への配慮
認証まわりは Supabase Auth を利用し、メールログイン・Google / GitHub OAuth を安全に扱えるよう実装しています。  
また、ユーザーごとの思い出データは適切にアクセス制御を行い、他ユーザーに閲覧されないよう RLS（Row Level Security）を設定。  
画像アップロードではファイル名の sanitizing（無効文字削除）やストレージパスの管理を徹底し、不正なパス操作が起こらないよう配ido しています。  
これらにより、個人の思い出や位置情報を扱うアプリとして、安全に利用できる基盤を整えました。

---

## 今後のアップデート案

* マップのシェア機能（他ユーザーの思い出閲覧、編集）
* 公開・非公開設定
* 感情ヒートマップ（感情の色をマップ上で可視化）
* 思い出を日付順や場所ごとに辿ることのできる、軌跡モード
* 思い出がある場所の近くを通ると、通知で教えてくれる機能

---

## ライセンス

このプロジェクトは MIT License で公開されています。
