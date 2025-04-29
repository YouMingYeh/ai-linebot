import { v4 as uuidv4 } from "uuid";
/**
 * Removes common markdown syntax from text and adds emojis for layout
 * @param {string} markdownText - The markdown text to process
 * @return {string} Plain text with markdown syntax removed and emojis added
 */
export function removeMarkdown(markdownText) {
    if (!markdownText)
        return "";
    let text = markdownText;
    // Remove code blocks, keeping only the content inside
    text = text.replace(/```(?:[a-zA-Z0-9]*\n)?([\s\S]*?)```/g, "$1");
    // Remove inline code, keeping the content inside
    text = text.replace(/`([^`]+)`/g, "$1");
    // Remove headers and prepend with 📌 emoji
    text = text.replace(/^(#{1,6})\s+(.+)$/gm, "📌 $2");
    // Remove emphasis, only when used as markdown syntax
    text = text.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
    // Remove blockquotes and prepend with 💬 emoji
    text = text.replace(/^\s*>\s+(.+)$/gm, "💬 $1");
    // Convert bullet lists to plain text with 🔹 emoji
    text = text.replace(/^\s*[-*+]\s+(.+)$/gm, "🔹 $1");
    // Convert numbered lists to plain text with ℹ️ emoji
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, "ℹ️ $1");
    // Remove link syntax, keep text and URL with 🔗 emoji)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 🔗 ($2)");
    // Remove image syntax, keep alt text with 🖼️ emoji
    text = text.replace(/!\[([^\]]+)\]\([^)]+\)/g, "🖼️ $1");
    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, "\n\n");
    text = text.trim();
    return text;
}
/**
 * Generate a UUID for use as an identifier
 * @returns A new UUID string
 */
export const generateUuid = () => {
    return uuidv4();
};
/**
 * Converts Blob or Buffer content to a base64 string.
 * @param content The content to convert (Blob or Buffer).
 * @returns A promise resolving to the base64 encoded string.
 */
export async function convertContentToBase64(content) {
    if (Buffer.isBuffer(content)) {
        return content.toString('base64');
    }
    else if (content instanceof Blob) {
        const arrayBuffer = await content.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    }
    throw new Error("Unsupported content type for base64 conversion.");
}
//# sourceMappingURL=utils.js.map