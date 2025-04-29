import { Pool, types } from "pg";
import { v4 as uuidv4 } from "uuid";
// Disable automatic UUID parsing
// This ensures that string values aren't automatically converted to UUID
// LINE user IDs are text strings that might look like UUIDs but aren't valid UUIDs
types.setTypeParser(types.builtins.UUID, (val) => val);
let pool;
export const createPostgresClient = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }
    return pool;
};
/**
 * Generic query executor with type parameters
 */
export const query = async (text, params = []) => {
    const client = await createPostgresClient().connect();
    // Optional: Log query and params for debugging
    // console.log('Executing query:', text);
    // console.log('With parameters:', params);
    try {
        const result = await client.query(text, params);
        // Ensure result.rows is correctly typed as T (which might be an array or single object depending on the query)
        return { data: result.rows, error: null };
    }
    catch (error) {
        console.error("Query failed:", error); // Log the actual error object for better diagnostics
        return { data: null, error: error };
    }
    finally {
        client.release();
    }
};
/**
 * Utility function to convert camelCase to snake_case for database columns
 */
export const camelToSnakeCase = (obj) => {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) { // Added check for array
        return obj;
    }
    const result = {};
    Object.keys(obj).forEach((key) => {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        // Do not recursively convert nested objects/arrays here, let the caller handle if needed
        result[snakeKey] = obj[key];
    });
    return result;
};
/**
 * Utility function to convert snake_case to camelCase for JavaScript objects
 */
export const snakeToCamelCase = (obj) => {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    if (Array.isArray(obj)) {
        // If it's an array, map over its elements and convert each one
        return obj.map((item) => snakeToCamelCase(item));
    }
    // If it's an object, convert its keys
    const result = {};
    Object.keys(obj).forEach((key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        // Do not recursively convert nested objects/arrays here unless specifically required
        result[camelKey] = obj[key];
    });
    return result;
};
/**
 * Generate a UUID
 */
export const generateUuid = () => {
    return uuidv4();
};
//# sourceMappingURL=postgres.js.map