import { input, select, confirm } from "@inquirer/prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

// ---------------------------------------------------------------------------
// Interactive Environment Setup — fully bilingual & non-dev-friendly
// ---------------------------------------------------------------------------
// Type-safety notes
// • We use Record<string, string> for free-form key/value maps (`defaults`, `answers`).
// • `LangKey` is the union of the keys of `translations`.
// • All dynamic `select` returns are cast to `LangKey` for strictness.
// ---------------------------------------------------------------------------

/* eslint @typescript-eslint/no-explicit-any: 0 */

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFilePath = path.resolve(__dirname, "../.env");
const envExampleFilePath = path.resolve(__dirname, "../.env.example");

// ────────────────────────────────────────────────────────────────────────────
//  🔤  Translations –  English  &  繁體中文
// ────────────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    // Generic helpers -------------------------------------------------------
    stepLabel: "Step", // e.g. “Step 3”
    pressEnter: "Press Enter to accept defaults in brackets.",
    yes: "Yes",
    no: "No",

    // Title & prerequisites -------------------------------------------------
    titleBanner: "🔧  Interactive Environment Setup",
    welcome: "Let’s prepare your LINE bot environment together!",
    prereqTitle: "Things you MUST do before we start:",
    prereq1: "Create a LINE Official Account (free).",
    prereq2: "Enable the Messaging API in the Developer Console.",
    prereq3: "(Optional) Sign-up for Google AI Studio / OpenAI Platform.",
    quickLinks: "Quick links you may need:",

    // Section titles --------------------------------------------------------
    stepLineAccount: "Create or sign-in to your LINE Official Account",
    stepToken: "Collect credentials from LINE (Access Token & Secret)",
    stepAi: "Choose and configure your AI provider",
    stepDb: "Set-up the database connection",
    stepSave: "Preview & save your .env file",
    done: "🎉  All done!  You can now run the application.",

    // LINE Credentials ------------------------------------------------------
    goConsole:
      "Open the LINE Developers Console → select your provider → open the channel you just created → Messaging API tab.",
    askAccessToken: "Paste your *Channel Access Token* (long-lived)",
    hintAccessToken: "(Issue one in the Messaging API tab in LINE Developer Console if you haven’t already)",
    needAccess: "Access Token is required",
    askSecret: "Paste your *Channel Secret*",
    hintSecret: "(Find it in the Basic Settings tab in LINE Developer Console)",
    needSecret: "Channel Secret is required",

    // AI provider -----------------------------------------------------------
    chooseProvider: "Select the AI service you’d like GPT-style replies from",
    googleModel: "Google model name (e.g. gemini-2.0-flash-001)",
    googleKey: "Google API Key",
    needGoogleKey: "Google API Key is required when Google is selected",
    openaiModel: "OpenAI model name (e.g. gpt-4o)",
    openaiKey: "OpenAI API Key",
    needOpenAIKey: "OpenAI API Key is required when OpenAI is selected",

    // Database --------------------------------------------------------------
    dockerQuestion: "Will you run PostgreSQL via Docker?",
    usingDocker:
      "Awesome – we’ll assume a Docker Compose postgres service at postgres:5432.",
    localDb: "Enter details for your own PostgreSQL instance.",
    dbHost: "Database host",
    dbPort: "Database port",
    dbName: "Database name",
    dbUser: "Database user",
    dbPass: "Database password (leave blank for none)",

    // Save & finish ---------------------------------------------------------
    preview: "Here’s what will be written to .env:",
    editLater: "You can edit this file later to tweak anything.",
    noCommit: "Never commit .env to Git.  Treat it like a password vault!",
    okToSave: "Save these values?",
    cancelled: "Setup cancelled – nothing was written.",
    saved: "Successfully wrote .env!",
  },
  "zh-TW": {
    // Generic helpers -------------------------------------------------------
    stepLabel: "步驟", // e.g. “步驟 3”
    pressEnter: "按 Enter 以接受 [預設值]。",
    yes: "是",
    no: "否",

    // Title & prerequisites -------------------------------------------------
    titleBanner: "🔧  互動式環境設定",
    welcome: "讓我們一起完成 LINE 機器人的環境設定！",
    prereqTitle: "開始之前必做的事：",
    prereq1: "建立 LINE 官方帳號（免費）",
    prereq2: "在開發者主控台啟用 Messaging API。",
    prereq3: "（可選）註冊 Google AI Studio / OpenAI Platform。",
    quickLinks: "可能會用到的連結：",

    // Section titles --------------------------------------------------------
    stepLineAccount: "登入或建立 LINE 官方帳號",
    stepToken: "取得 LINE 憑證（Access Token 與 Secret）",
    stepAi: "選擇並設定 AI 提供者",
    stepDb: "設定資料庫連線",
    stepSave: "預覽並儲存 .env 檔案",
    done: "🎉  完成！您可以啟動應用程式了。",

    // LINE Credentials ------------------------------------------------------
    goConsole:
      "開啟 LINE 開發者主控台 → 選擇您的 Provider → 點入剛建立的 Channel → Messaging API 分頁。",
    askAccessToken: "貼上 *Channel Access Token*（long-lived）",
    hintAccessToken: "（若尚未建立，請前往 LINE Developer Console 的 Messaging API 分頁並點擊 Issue）",
    needAccess: "必須填寫 Access Token",
    askSecret: "貼上 *Channel Secret*",
    hintSecret: "（在 LINE Developer Console 的 Basic Settings 分頁）",
    needSecret: "必須填寫 Channel Secret",

    // AI provider -----------------------------------------------------------
    chooseProvider: "選擇想用來產生回覆的 AI",
    googleModel: "Google 模型名稱（例：gemini-2.0-flash-001）",
    googleKey: "Google API Key",
    needGoogleKey: "選擇 Google 時必須填寫 Google API Key",
    openaiModel: "OpenAI 模型名稱（例：gpt-4o）",
    openaiKey: "OpenAI API Key",
    needOpenAIKey: "選擇 OpenAI 時必須填寫 OpenAI API Key",

    // Database --------------------------------------------------------------
    dockerQuestion: "您會使用 Docker 來執行 PostgreSQL 嗎？",
    usingDocker: "太好了！我們會假設 Docker Compose 服務位於 postgres:5432。",
    localDb: "請輸入您自己的 PostgreSQL 連線資訊。",
    dbHost: "資料庫主機",
    dbPort: "資料庫埠號",
    dbName: "資料庫名稱",
    dbUser: "資料庫使用者",
    dbPass: "資料庫密碼（無則留空）",

    // Save & finish ---------------------------------------------------------
    preview: "以下內容將寫入 .env：",
    editLater: "之後仍可手動編輯此檔案。",
    noCommit: "切勿將 .env 提交到 Git，視同密碼保管！",
    okToSave: "是否儲存這些設定？",
    cancelled: "已取消，未寫入任何檔案。",
    saved: "已成功寫入 .env！",
  },
} as const;

type LangKey = keyof typeof translations;

// ────────────────────────────────────────────────────────────────────────────
// Helper: colourful step banners
// ────────────────────────────────────────────────────────────────────────────
let currentStep = 1;
function banner(t: (typeof translations)[LangKey], title: string) {
  const header = `${t.stepLabel} ${currentStep}: ${title}`;
  console.log(chalk.blueBright.bold(`\n${header}`));
  currentStep += 1;
}

// ────────────────────────────────────────────────────────────────────────────
async function setupEnv(): Promise<void> {
  // Step 0: Language selection ---------------------------------------------
  const language = (await select({
    message: "🌐  Select your language / 選擇語言:",
    choices: [
      { name: "English", value: "en" },
      { name: "繁體中文", value: "zh-TW" },
    ],
    default: "en",
  })) as LangKey;
  const t = translations[language];

  // Welcome & prerequisites ------------------------------------------------
  console.log(chalk.cyanBright(`\n${t.titleBanner}`));
  console.log(chalk.bold(t.welcome));
  banner(t, t.prereqTitle);
  console.log(`• ${t.prereq1}`);
  console.log(`• ${t.prereq2}`);
  console.log(`• ${t.prereq3}`);
  console.log(chalk.dim(`\n${t.pressEnter}`));

  // Quick links ------------------------------------------------------------
  console.log(chalk.blueBright(`\n${t.quickLinks}`));
  console.log("  https://developers.line.biz/console/");
  console.log("  https://developers.line.biz/en/docs/messaging-api/");
  console.log("  https://aistudio.google.com/apikey");
  console.log("  https://platform.openai.com/api-keys\n");

  // Load defaults from .env.example ---------------------------------------
  const defaults: Record<string, string> = {};
  if (fs.existsSync(envExampleFilePath)) {
    fs.readFileSync(envExampleFilePath, "utf-8")
      .split("\n")
      .forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [k, ...v] = trimmed.split("=");
          defaults[k!.trim()] = v.join("=").trim();
        }
      });
  }

  // Answers placeholder ----------------------------------------------------
  const answers: Record<string, string> = {};

  // ── Step 1: LINE Credentials -------------------------------------------
  banner(t, t.stepLineAccount);
  console.log(t.goConsole);

  banner(t, t.stepToken);
  answers.CHANNEL_ACCESS_TOKEN = await input({
    message: `${t.askAccessToken}\n${chalk.dim(t.hintAccessToken)}\n→ `,
    default: defaults.CHANNEL_ACCESS_TOKEN ?? "",
    validate: (v: string) => (v.trim() ? true : chalk.red(t.needAccess)),
  });
  answers.CHANNEL_SECRET = await input({
    message: `${t.askSecret}\n${chalk.dim(t.hintSecret)}\n→ `,
    default: defaults.CHANNEL_SECRET ?? "",
    validate: (v: string) => (v.trim() ? true : chalk.red(t.needSecret)),
  });

  // ── Step 2: AI Provider -------------------------------------------------
  banner(t, t.stepAi);
  answers.DEFAULT_AI_PROVIDER = (await select({
    message: t.chooseProvider,
    choices: [
      { name: "Google AI", value: "google" },
      { name: "OpenAI", value: "openai" },
    ],
    default: defaults.DEFAULT_AI_PROVIDER ?? "google",
  })) as string;

  if (answers.DEFAULT_AI_PROVIDER === "google") {
    answers.GOOGLE_AI_MODEL = await input({
      message: `${t.googleModel} → `,
      default: defaults.GOOGLE_AI_MODEL ?? "gemini-2.0-flash-001",
    });
    answers.GOOGLE_GENERATIVE_AI_API_KEY = await input({
      message: `${t.googleKey} → `,
      default: defaults.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
      validate: (v: string) => (v.trim() ? true : chalk.red(t.needGoogleKey)),
    });
    answers.OPENAI_MODEL = defaults.OPENAI_MODEL ?? "gpt-4o";
    answers.OPENAI_API_KEY = defaults.OPENAI_API_KEY ?? "";
  } else {
    answers.OPENAI_MODEL = await input({
      message: `${t.openaiModel} → `,
      default: defaults.OPENAI_MODEL ?? "gpt-4o",
    });
    answers.OPENAI_API_KEY = await input({
      message: `${t.openaiKey} → `,
      default: defaults.OPENAI_API_KEY ?? "",
      validate: (v: string) => (v.trim() ? true : chalk.red(t.needOpenAIKey)),
    });
    answers.GOOGLE_AI_MODEL =
      defaults.GOOGLE_AI_MODEL ?? "gemini-2.0-flash-001";
    answers.GOOGLE_GENERATIVE_AI_API_KEY =
      defaults.GOOGLE_GENERATIVE_AI_API_KEY ?? "";
  }

  // ── Step 3: Database ----------------------------------------------------
  banner(t, t.stepDb);
  const useDocker: boolean = await confirm({
    message: t.dockerQuestion,
    default: true,
  });

  if (useDocker) {
    console.log(chalk.dim(t.usingDocker));
    answers.DATABASE_URL =
      "postgresql://linebot:password@postgres:5432/linebot";
  } else {
    console.log(chalk.dim(t.localDb));
    const host = await input({
      message: `${t.dbHost} [localhost] → `,
      default: "localhost",
    });
    const port = await input({
      message: `${t.dbPort} [5432] → `,
      default: "5432",
    });
    const name = await input({
      message: `${t.dbName} [linebot] → `,
      default: "linebot",
    });
    const user = await input({
      message: `${t.dbUser} [postgres] → `,
      default: "postgres",
    });
    const pass = await input({ message: `${t.dbPass} → `, default: "" });
    answers.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}`;
  }

  // ── Step 4: Save .env ---------------------------------------------------
  banner(t, t.stepSave);
  const envText = Object.entries(answers)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  console.log(chalk.blueBright(`\n${t.preview}\n`));
  console.log(envText);
  console.log(`\n${t.editLater}\n${chalk.yellow(t.noCommit)}\n`);

  const ok: boolean = await confirm({ message: t.okToSave, default: true });
  if (!ok) {
    console.log(chalk.red(t.cancelled));
    process.exit(0);
  }

  fs.writeFileSync(envFilePath, envText);
  console.log(chalk.green(t.saved));
  console.log(chalk.cyan(t.done));
}

setupEnv().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
