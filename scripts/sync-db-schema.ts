import { execSync } from "child_process";
import chalk from "chalk";

/**
 * This script synchronizes the database schema with the Prisma schema
 * It should be used in development only - for production, use proper migrations
 */
async function syncDatabaseSchema() {
  try {
    console.log(chalk.blue("🔄 Synchronizing database schema with Prisma schema..."));

    // Run db push to synchronize schema without migrations
    console.log(chalk.yellow("Running prisma db push..."));
    execSync("npx prisma db push", { stdio: "inherit" });

    console.log(chalk.green("✅ Database schema synchronized successfully!"));
    return true;
  } catch (error) {
    console.error(chalk.red("❌ Failed to synchronize database schema:"));
    console.error(error);
    return false;
  }
}

// Run the sync if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDatabaseSchema()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error(chalk.red("An unexpected error occurred:"), err);
      process.exit(1);
    });
}

export { syncDatabaseSchema };
