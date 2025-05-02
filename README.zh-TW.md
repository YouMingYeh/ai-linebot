# AI LINE 聊天機器人 (AI LINE Chatbot)

**AI LINE 聊天機器人**是一個現代化的 TypeScript 應用程式，實現了具有 AI 功能的 LINE 聊天機器人。它使用 Express、PostgreSQL 和 LINE Messaging API 構建，通過整合 [AI SDK](https://sdk.vercel.ai/) 中的 `@ai-sdk/google` 和 `@ai-sdk/openai` 智能處理並回應用戶訊息。

---

## 快速開始（5 分鐘）(Quick Start - 5 Minutes)

想要快速建立你的 AI LINE 聊天機器人嗎？請按照以下步驟操作：

1. **Fork 並 Clone 儲存庫：**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-linebot.git
   cd ai-linebot
   ```

2. **設定環境：**

   ```bash
   pnpm install
   pnpm run init:env
   ```

   根據提示輸入您的 LINE 憑證和 AI 設定等。

3. **（在雲端）使用 Docker Compose 部署：**
   ```bash
   docker compose up -d --build
   ```

就是這樣！應用程式就跑起來了，同時自動設定 AI 機器人和 PostgreSQL 資料庫。你不需單獨設定資料庫。

> **重要提示：** 要將此機器人與 LINE 一起使用，您必須將其部署到具有有效 HTTPS 端點的伺服器上。LINE 的 Messaging API 需要安全的 webhook URL。

---

## 目錄 (Table of Contents)

- [AI LINE 聊天機器人](#ai-line-聊天機器人-ai-line-chatbot)
  - [快速開始（5 分鐘）](#快速開始5-分鐘-quick-start---5-minutes)
  - [目錄](#目錄-table-of-contents)
  - [功能](#功能-features)
  - [你必須有：](#你必須有-prerequisites)
  - [部署要求](#部署要求-deployment-requirements)
  - [入門指南](#入門指南-getting-started)
    - [Clone 儲存庫](#clone-儲存庫-clone-the-repository)
    - [安裝依賴](#安裝依賴-install-dependencies)
    - [環境設定](#環境設定-environment-setup)
    - [資料庫初始化](#資料庫初始化-database-initialization)
  - [運行應用程式](#運行應用程式-running-the-application)
    - [開發模式](#開發模式-development-mode)
    - [生產模式](#生產模式-production-mode)
    - [端點](#端點-endpoints)
  - [Docker 部署](#docker-部署-docker-deployment)
    - [使用 Docker Compose（建議）](#使用-docker-compose建議-using-docker-compose-recommended)
    - [手動 Docker 部署](#手動-docker-部署-manual-docker-deployment)
  - [可用腳本](#可用腳本-available-scripts)
  - [項目結構](#項目結構-project-structure)
  - [安全最佳實踐](#安全最佳實踐-security-best-practices)
  - [資料庫管理](#資料庫管理-database-management)
  - [示範 Demo](#示範-demo-demonstration)
  - [支援與聯繫](#支援與聯繫-support-and-contact)
  - [授權條款](#授權條款-license)

---

## 功能 (Features)

- **LINE Messaging API 整合**：處理各種訊息類型（文字、圖片、音訊、影片、文件、貼圖）。
- **支援多 AI 模型**：目前包含 Google Generative AI (Gemini) 或 OpenAI (GPT)。你可以自行開發 [AI SDK](https://sdk.vercel.ai/) 提供的其他模型。
  > ⚠️ **注意**：OpenAI 的模型目前僅支援圖像與文字訊息類型。
- **資料庫整合**：使用 Prisma ORM 將對話歷史和用戶數據儲存在 PostgreSQL 中。
- **Docker 支持**：使用 Docker 和 Docker Compose 輕鬆部署。
- **TypeScript**：使用現代 ES 模塊的完全類型化程式碼。
- **互動式設定**：用戶友好的環境設定腳本。

---

## 你必須有： (Prerequisites)

- Node.js v18 或更高版本
- pnpm v9.15.4 或更高版本（推薦）或 npm
- PostgreSQL 資料庫
- LINE 開發者賬號和、官方帳號、Messaging API
- Google Generative AI API Key（如果使用 Google AI）
- OpenAI API Key（如果使用 OpenAI）
- **具有 HTTPS 端點的伺服器**（LINE webhook 必須）

> 需要幫助？聯絡我：ym911216@gmail.com

---

## 部署要求 (Deployment Requirements)

為了讓您的 LINE 機器人正常運作，您**必須**將其部署在具有以下條件的伺服器上：

1. 可由 LINE 伺服器訪問的公共 HTTPS 端點
2. 有效的 SSL 證書（非自簽名）

選項包括：

- 雲服務模型提供商，如 AWS、GCP、Azure、Heroku、Render 或 Railway
- 您自己的伺服器，配有適當的 SSL 終止

> 我自己是使用 DigitalOcean 的 VPS 伺服器，並使用 Cloudflare 的 SSL。

部署後，在 LINE 開發者控制台中設定您的 webhook URL 指向您的 `/callback` 端點。

> 如果您需要部署幫助或有任何問題，請聯繫：ym911216@gmail.com

---

## 入門指南 (Getting Started)

### Clone 儲存庫 (Clone the Repository)

```bash
# 首先，在 GitHub 上 fork 儲存庫
# 然後克隆您 fork 的儲存庫
git clone https://github.com/YOUR_USERNAME/ai-linebot.git
cd ai-linebot
```

### 安裝依賴 (Install Dependencies)

```bash
pnpm install
# 或者如果使用 npm
npm install
```

### 環境設定 (Environment Setup)

1. **運行互動式設定腳本：**

   ```bash
   pnpm run init:env
   ```

   此腳本引導您設定：

   - LINE 機器人憑證
   - AI 模型提供商選擇和 API Key
   - 資料庫
     > 你可以跳過一些已經設定好的選項，或自行複製 `.env.example` 至 `.env` 並手動編輯。

2. **驗證您的設定**：設定腳本將創建一個 `.env` 文件。示例設定：

   ```dotenv
   # LINE 機器人憑證
   CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
   CHANNEL_SECRET=your_line_channel_secret
   PORT=1234

   # AI 模型提供商設定
   DEFAULT_AI_PROVIDER=google  # 或 openai
   GOOGLE_AI_MODEL=gemini-2.0-flash-001
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key  # 如果使用 Google 則必填
   OPENAI_MODEL=gpt-4o
   OPENAI_API_KEY=your_openai_api_key  # 如果使用 OpenAI 則必填

   # 應用程式設定
   MAX_MESSAGE_LENGTH=30  # 每個用戶的訊息歷史限制

   # 資料庫連接
   DATABASE_URL=postgresql://user:password@host:port/database_name
   ```

### 資料庫初始化 (Database Initialization)

1. **用於本地開發**：

   - 確保您的 PostgreSQL 伺服器正在運行並可通過 `.env` 中的 `DATABASE_URL` 訪問。
   - 初始化資料庫架構：
     ```bash
     pnpm prisma:push
     ```

2. **用於 Docker 部署**：
   - 無需單獨設定資料庫！使用 Docker Compose 時，資料庫將自動創建和初始化。

---

## 運行應用程式 (Running the Application)

### 開發模式 (Development Mode)

使用：

```bash
pnpm dev
```

### 生產模式 (Production Mode)

構建並運行編譯後的版本：

```bash
pnpm build
pnpm start
```

### 端點 (Endpoints)

- `GET /` - 檢查伺服器是否運行正常
- `GET /health` - 檢查伺服器健康狀態
- `POST /callback` - LINE webhook 端點（在 LINE 開發者控制台中設定）

---

## Docker 部署 (Docker Deployment)

### 使用 Docker Compose（建議） (Using Docker Compose - Recommended)

1. 確保已安裝 Docker 和 Docker Compose。

2. 您可以：

   - 使用 Docker Compose 的正確資料庫 URL 更新您的 `.env` 文件，或者
   - 讓 `init:env` 腳本為您設定適合 Docker Compose 部署的所有內容

3. 運行：

   ```bash
   docker compose up -d --build
   ```

   這將設定應用程式和 PostgreSQL 資料庫容器，並設定所有必要的內容。

### 手動 Docker 部署 (Manual Docker Deployment)

```bash
# 構建映像
docker build -t ai-linebot .

# 運行容器
docker run -d \
  --env-file .env \
  -p 1234:1234 \
  --name ai-linebot-container \
  ai-linebot
```

---

## 可用腳本 (Available Scripts)

| 命令                         | 說明                            |
| ---------------------------- | ------------------------------- |
| `pnpm clean`                 | 移除 dist 目錄                  |
| `pnpm build`                 | 將 TypeScript 編譯為 JavaScript |
| `pnpm start`                 | 運行已編譯的應用程式            |
| `pnpm dev`                   | 使用熱重載啟動開發服務器        |
| `pnpm init:env`              | 運行互動式環境設定              |
| `pnpm test`                  | 運行 Jest 測試                  |
| `pnpm test:db`               | 測試資料庫連接                  |
| `pnpm test:prisma`           | 測試 Prisma 連接並列印數據計數  |
| `pnpm prisma:generate`       | 生成 Prisma 客戶端              |
| `pnpm prisma:migrate`        | 創建並應用新的遷移              |
| `pnpm prisma:migrate:deploy` | 在生產中部署遷移                |
| `pnpm prisma:studio`         | 打開 Prisma Studio 管理資料庫   |
| `pnpm prisma:push`           | 將 Prisma 架構推送到資料庫      |
| `pnpm db:sync`               | 同步資料庫架構（僅開發）        |
| `pnpm lint`                  | 運行 ESLint                     |
| `pnpm format`                | 使用 Prettier 格式化代碼        |

---

## 項目結構 (Project Structure)

```
├── client/                # 外部客戶端包裝器（LINE API、Prisma）
├── event-handler/         # Webhook 事件處理邏輯
│   ├── index.ts           # 主事件分派器
│   └── user-event-handler/# 用戶事件處理器
│       └── message-event-handler/ # 訊息事件處理器
├── lib/                   # 共享庫和工具
│   ├── types.ts           # TypeScript 類型定義
│   ├── utils.ts           # 通用工具函數
│   ├── messaging-api/     # Messaging API 特定工具
│   └── repository/        # 資料庫訪問層
├── prisma/                # Prisma ORM 設定和架構
│   └── schema.prisma      # 資料庫架構定義
├── scripts/               # 工具腳本（設定、測試）
├── index.ts               # 應用程式入口點
├── .env.example           # 示例環境變量文件
├── docker-compose.yml     # Docker Compose 設定
├── Dockerfile             # Docker 容器定義
├── environment.d.ts       # 環境變量類型聲明
└── tsconfig.json          # TypeScript 設定
```

---

## 安全最佳實踐 (Security Best Practices)

對於生產部署：

- 將 `.env` **添加到** `.gitignore` 以防止提交機密信息。
- 考慮使用 Key 管理器（例如 AWS Secrets Manager、HashiCorp Vault）。
- 對容器化部署使用 Docker secrets。
- 直接在生產主機或容器平台上設定環境變量。

---

## 資料庫管理 (Database Management)

本項目使用 Prisma ORM 進行資料庫操作：

- 架構定義在 `prisma/schema.prisma` 中。
- 儲存庫模式在 `lib/repository/index.ts` 中實現。
- 連接在 `client/prisma.ts` 中管理。

要直觀地查看和管理您的數據：

```bash
pnpm prisma:studio
```

---

## 示範 Demo (Demonstration)

添加 LINE 機器人為好友：<https://lin.ee/Fpn511N>

---

## 支援與聯繫 (Support and Contact)

如果您有任何問題、需要部署幫助或想報告問題：

- 聯繫電子郵件：ym911216@gmail.com
- 在 GitHub 儲存庫中開啟 issue

---

## 授權條款 (License)

MIT © Youming Yeh
