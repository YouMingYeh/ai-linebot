/**
 * Test script to verify PostgreSQL connection
 */
import { createPostgresClient, query } from "../client/postgres.js";
import * as dotenv from "dotenv";
dotenv.config();
async function testConnection() {
    console.log("Testing PostgreSQL connection...");
    try {
        // Try to connect and run a simple query
        const result = await query("SELECT current_timestamp as time");
        if (result.error) {
            console.error("Error connecting to PostgreSQL:", result.error);
            process.exit(1);
        }
        console.log("Successfully connected to PostgreSQL!");
        console.log("Current timestamp from database:", result.data[0].time);
        // Test a more complex query to verify schema
        const tablesResult = await query(`SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'
       ORDER BY table_name`);
        if (tablesResult.error) {
            console.error("Error querying tables:", tablesResult.error);
            process.exit(1);
        }
        console.log("\nDatabase tables:");
        tablesResult.data.forEach((table) => {
            console.log(`- ${table.table_name}`);
        });
        // Verify user table structure
        const userTableResult = await query(`SELECT column_name, data_type 
       FROM information_schema.columns
       WHERE table_name = 'user'
       ORDER BY ordinal_position`);
        if (userTableResult.error) {
            console.error("Error querying user table structure:", userTableResult.error);
        }
        else {
            console.log("\nUser table structure:");
            userTableResult.data.forEach((column) => {
                console.log(`- ${column.column_name}: ${column.data_type}`);
            });
        }
        // Verify message table structure
        const messageTableResult = await query(`SELECT column_name, data_type 
       FROM information_schema.columns
       WHERE table_name = 'message'
       ORDER BY ordinal_position`);
        if (messageTableResult.error) {
            console.error("Error querying message table structure:", messageTableResult.error);
        }
        else {
            console.log("\nMessage table structure:");
            messageTableResult.data.forEach((column) => {
                console.log(`- ${column.column_name}: ${column.data_type}`);
            });
        }
        // Close the connection pool
        const pool = createPostgresClient();
        await pool.end();
        console.log("\nConnection test completed successfully!");
    }
    catch (err) {
        console.error("Unexpected error:", err);
        process.exit(1);
    }
}
testConnection();
//# sourceMappingURL=test-db-connection.js.map