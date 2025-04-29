import { input, select, confirm } from "@inquirer/prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, "../.env");
const envExampleFilePath = path.resolve(__dirname, "../.env.example");
async function setupEnv() {
    // Introduction and Prerequisites
    console.log(chalk.cyanBright(`\n🔧 Interactive Environment Setup\n--------------------------------------------------`));
    console.log(chalk.yellow(`Before you begin, make sure you have completed these steps:`));
    console.log(` 1) Create a LINE Official Account: ${chalk.underline("https://entry.line.biz/form/entry/unverified")}`);
    console.log(chalk.cyanBright(`--------------------------------------------------`));
    console.log(chalk.dim("Press Enter to accept defaults in brackets."));
    console.log(chalk.blueBright(`\n📚 Quick Links:`));
    console.log(`  LINE Developers Console: ${chalk.underline("https://developers.line.biz/console/")}`);
    console.log(`  LINE Messaging API Docs: ${chalk.underline("https://developers.line.biz/en/docs/messaging-api/")}`);
    console.log(`  Google AI Studio:        ${chalk.underline("https://aistudio.google.com/apikey")}`);
    console.log(`  OpenAI API Keys:         ${chalk.underline("https://platform.openai.com/api-keys")}`);
    console.log(chalk.cyanBright("--------------------------------------------------\n"));
    // Load defaults from .env.example
    let defaultValues = {};
    try {
        const content = fs.readFileSync(envExampleFilePath, "utf-8");
        content.split("\n").forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const [key, val] = trimmed.split("=");
                defaultValues[key.trim()] = (val || "").trim();
            }
        });
    }
    catch (err) {
        console.warn(chalk.yellow("⚠️  No .env.example found—starting with empty defaults."));
    }
    const answers = {};
    // Set default values for non-critical configs
    answers.PORT = defaultValues["PORT"] || "1234";
    console.log(chalk.blueBright(`\n🔑 LINE Bot Configuration:`));
    console.log(`   Go to the LINE Developers Console (${chalk.underline("https://developers.line.biz/console/")})`);
    console.log(`   Select your Provider → Select the Messaging API channel you just configured.`);
    console.log(`   Navigate to the 'Messaging API' tab.`);
    answers.CHANNEL_ACCESS_TOKEN = await input({
        message: chalk.green(`👉 Paste your Channel Access Token (long-lived) [${chalk.italic(defaultValues["CHANNEL_ACCESS_TOKEN"] || "")}]:`) +
            chalk.dim(`\n   (Find this in the 'Messaging API' tab of your channel settings. Issue a new one if you don't have one)`),
        default: defaultValues["CHANNEL_ACCESS_TOKEN"] || "",
        validate: (v) => (v.trim() ? true : chalk.red("Access Token is required")),
    });
    answers.CHANNEL_SECRET = await input({
        message: chalk.green(`👉 Paste your Channel Secret [${chalk.italic(defaultValues["CHANNEL_SECRET"] || "")}]:`) +
            chalk.dim(`\n   (Find this in the 'Basic settings' tab of your channel settings)`),
        default: defaultValues["CHANNEL_SECRET"] || "",
        validate: (v) => (v.trim() ? true : chalk.red("Secret is required")),
    });
    console.log(chalk.blueBright(`\n⚙️  AI Configuration:`));
    answers.DEFAULT_AI_PROVIDER = await select({
        message: chalk.green(`🤖 Default AI Provider [${chalk.italic(defaultValues["DEFAULT_AI_PROVIDER"] || "google")}]:`) +
            chalk.dim(`\n   (Choose which AI service to use for generating responses)`),
        choices: [
            { name: "google", value: "google" },
            { name: "openai", value: "openai" },
        ],
        default: defaultValues["DEFAULT_AI_PROVIDER"] || "google",
    });
    // Conditionally prompt for Google AI details
    if (answers.DEFAULT_AI_PROVIDER === "google") {
        answers.GOOGLE_AI_MODEL = await input({
            message: chalk.green(`🔍 Google AI Model [${chalk.italic(defaultValues["GOOGLE_AI_MODEL"] || "gemini-2.0-flash-001")}]:`) + chalk.dim(`\n   (Specify the Google AI model name to use)`),
            default: defaultValues["GOOGLE_AI_MODEL"] || "gemini-2.0-flash-001",
        });
        console.log(chalk.blueBright(`   ➡️ Get your Google API Key here: ${chalk.underline("https://aistudio.google.com/apikey")}`));
        answers.GOOGLE_GENERATIVE_AI_API_KEY = await input({
            message: chalk.green(`🔑 Google API Key [${chalk.italic(defaultValues["GOOGLE_GENERATIVE_AI_API_KEY"] || "")}]:`) +
                chalk.dim(`\n   (Your API key for Google AI, required if using Google as default provider)`),
            default: defaultValues["GOOGLE_GENERATIVE_AI_API_KEY"] || "",
            validate: (v) => !v.trim()
                ? chalk.red("Google API Key is required when provider is Google")
                : true,
        });
    }
    else {
        // Set defaults or empty strings if Google is not selected
        answers.GOOGLE_AI_MODEL =
            defaultValues["GOOGLE_AI_MODEL"] || "gemini-2.0-flash-001";
        answers.GOOGLE_GENERATIVE_AI_API_KEY =
            defaultValues["GOOGLE_GENERATIVE_AI_API_KEY"] || "";
    }
    // Conditionally prompt for OpenAI details
    if (answers.DEFAULT_AI_PROVIDER === "openai") {
        answers.OPENAI_MODEL = await input({
            message: chalk.green(`🔍 OpenAI Model [${chalk.italic(defaultValues["OPENAI_MODEL"] || "gpt-4o")}]:`) + chalk.dim(`\n   (Specify the OpenAI model name to use)`),
            default: defaultValues["OPENAI_MODEL"] || "gpt-4o",
        });
        console.log(chalk.blueBright(`   ➡️ Get your OpenAI API Key here: ${chalk.underline("https://platform.openai.com/api-keys")}`));
        answers.OPENAI_API_KEY = await input({
            message: chalk.green(`🔑 OpenAI API Key [${chalk.italic(defaultValues["OPENAI_API_KEY"] || "")}]:`) +
                chalk.dim(`\n   (Your API key for OpenAI, required if using OpenAI as default provider)`),
            default: defaultValues["OPENAI_API_KEY"] || "",
            validate: (v) => !v.trim()
                ? chalk.red("OpenAI API Key is required when provider is OpenAI")
                : true,
        });
    }
    else {
        // Set defaults or empty strings if OpenAI is not selected
        answers.OPENAI_MODEL = defaultValues["OPENAI_MODEL"] || "gpt-4o";
        answers.OPENAI_API_KEY = defaultValues["OPENAI_API_KEY"] || "";
    }
    // Set default value for MAX_MESSAGE_LENGTH
    answers.MAX_MESSAGE_LENGTH = defaultValues["MAX_MESSAGE_LENGTH"] || "30";
    // Database configuration
    console.log(chalk.blueBright(`\n💾 Database Configuration:`));
    const useDocker = await confirm({
        message: chalk.green(`🐳 Will you be using Docker to run the application?`),
        default: true,
    });
    if (useDocker) {
        console.log(chalk.dim(`\n  Using Docker Compose configuration for PostgreSQL.`));
        console.log(chalk.dim(`  Database will be available at postgres:5432.`));
        answers.DATABASE_URL = "postgresql://linebot:password@postgres:5432/linebot";
    }
    else {
        console.log(chalk.dim(`\n  Configure your PostgreSQL connection details.`));
        const dbHost = await input({
            message: chalk.green(`🖥️  Database Host [localhost]:`),
            default: "localhost"
        });
        const dbPort = await input({
            message: chalk.green(`🔌 Database Port [5432]:`),
            default: "5432"
        });
        const dbName = await input({
            message: chalk.green(`📁 Database Name [linebot]:`),
            default: "linebot"
        });
        const dbUser = await input({
            message: chalk.green(`👤 Database User [postgres]:`),
            default: "postgres"
        });
        const dbPassword = await input({
            message: chalk.green(`🔒 Database Password:`),
            default: ""
        });
        answers.DATABASE_URL = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    }
    console.log(chalk.green(`✅ Database URL configured as: ${chalk.dim(answers.DATABASE_URL)}`));
    // Add any remaining values from .env.example that we didn't explicitly set
    for (const [key, value] of Object.entries(defaultValues)) {
        if (answers[key] === undefined) {
            answers[key] = value;
        }
    }
    // Preview and confirmation
    const envContent = Object.entries(answers)
        .map(([k, v]) => `${chalk.blue(k)}=${chalk.magenta(v)}`) // Style key-value pairs
        .join("\n");
    console.log(chalk.blueBright(`\n🖨️  Preview of .env file:`));
    console.log(envContent);
    console.log(chalk.yellow("\n📝 Note: You can manually edit the .env file later to configure additional settings."));
    console.log(chalk.yellow("\n🛡️ Security Note: Do not commit the .env file to version control. For production, consider using a secrets manager or Docker secrets to manage sensitive information securely."));
    const confirmed = await confirm({
        message: chalk.yellow("✅ Save these values to .env?"),
        default: true,
    });
    if (!confirmed) {
        console.log(chalk.red("🛑 Setup canceled—no file written."));
        process.exit(0);
    }
    // Write .env
    try {
        // Write the unstyled content to the file
        const plainEnvContent = Object.entries(answers)
            .map(([k, v]) => `${k}=${v}`)
            .join("\n");
        fs.writeFileSync(envFilePath, plainEnvContent);
        console.log(chalk.green(`\n🎉 Successfully created .env at ${envFilePath}`));
        console.log(chalk.yellow("🔒 Don't forget to add '.env' to .gitignore."));
        console.log(chalk.cyan("🚀 You can now start building!"));
        console.log(chalk.cyan("💡 To modify additional configuration options, edit the .env file directly."));
        console.log(chalk.blueBright("\n📊 Database Setup:"));
        if (useDocker) {
            console.log(chalk.green(`  Run ${chalk.bold("docker-compose up")} to start the application with PostgreSQL.`));
        }
        else {
            console.log(chalk.green(`  Run ${chalk.bold("pnpm prisma:push")} to create the database schema.`));
            console.log(chalk.green(`  Run ${chalk.bold("pnpm prisma:studio")} to view and manage your database.`));
        }
    }
    catch (err) {
        console.error(chalk.red("❌ Error writing .env file:"), err);
    }
}
setupEnv();
//# sourceMappingURL=setup.js.map