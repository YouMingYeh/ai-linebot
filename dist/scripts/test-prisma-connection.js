import { prisma } from '../client/prisma.js';
import chalk from 'chalk';
/**
 * Tests the connection to the database using Prisma
 */
async function testPrismaConnection() {
    try {
        console.log(chalk.blue('Testing Prisma database connection...'));
        const result = await prisma.$queryRaw `SELECT 1 as result`;
        console.log(chalk.green('✓ Successfully connected to the database!'));
        // Count number of users
        const userCount = await prisma.user.count();
        console.log(chalk.blue(`Found ${userCount} users in the database.`));
        // Count number of messages
        const messageCount = await prisma.message.count();
        console.log(chalk.blue(`Found ${messageCount} messages in the database.`));
        return true;
    }
    catch (error) {
        console.error(chalk.red('✗ Failed to connect to the database:'));
        console.error(error);
        return false;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the test if this script is executed directly
if (require.main === module) {
    testPrismaConnection()
        .then(success => {
        process.exit(success ? 0 : 1);
    })
        .catch(err => {
        console.error(chalk.red('An unexpected error occurred:'), err);
        process.exit(1);
    });
}
export { testPrismaConnection };
//# sourceMappingURL=test-prisma-connection.js.map