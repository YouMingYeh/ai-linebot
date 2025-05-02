import { v4 as uuidv4 } from "uuid";

/**
 * Formats markdown text for LINE messages by removing syntax and adding emoji indicators
 */
export function removeMarkdown(markdownText: string) {
  if (!markdownText) return "";

  let text = markdownText;

  // Remove code blocks, keeping only the content inside
  text = text.replace(/```(?:[a-zA-Z0-9]*\n)?([\s\S]*?)```/g, "$1");

  // Remove inline code, keeping the content inside
  text = text.replace(/`([^`]+)`/g, "$1");

  // Replace headers with emoji prefix
  text = text.replace(/^(#{1,6})\s+(.+)$/gm, "📌 $2");

  // Remove emphasis
  text = text.replace(/\*\*(.*?)\*\*/g, "$1"); 

  // Replace blockquotes with emoji prefix
  text = text.replace(/^\s*>\s+(.+)$/gm, "💬 $1");

  // Replace bullet lists with emoji prefix
  text = text.replace(/^\s*[-*+]\s+(.+)$/gm, "🔹 $1");

  // Replace numbered lists with emoji prefix
  text = text.replace(/^\s*\d+\.\s+(.+)$/gm, "ℹ️ $1");

  // Replace links with text and URL format
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 🔗 ($2)");

  // Replace images with alt text and emoji
  text = text.replace(/!\[([^\]]+)\]\([^)]+\)/g, "🖼️ $1");

  // Clean up extra whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

/**
 * Generates a unique ID for database entries
 */
export const generateUuid = (): string => {
  return uuidv4();
};

/**
 * Converts Blob or Buffer to base64 string for storage
 */
export async function convertContentToBase64(content: Blob | Buffer): Promise<string> {
  if (Buffer.isBuffer(content)) {
    return content.toString("base64");
  } else if (content instanceof Blob) {
    const arrayBuffer = await content.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  }
  throw new Error("Unsupported content type for base64 conversion.");
}
