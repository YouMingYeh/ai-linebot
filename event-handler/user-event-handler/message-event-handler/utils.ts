import { messagingApi } from "@line/bot-sdk";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { CoreMessage, generateText } from "ai";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { User } from "@/lib/types.js";
import { generateUuid, removeMarkdown } from "@/lib/utils.js";

// AI model configuration from environment variables
const DEFAULT_AI_PROVIDER = process.env.DEFAULT_AI_PROVIDER || "google";
const GOOGLE_AI_MODEL = process.env.GOOGLE_AI_MODEL || "gemini-2.0-flash-001";
const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// In-memory storage for user AI provider preferences
const userAIProviderPreference: Record<string, string> = {};

/**
 * Processes AI response and sends it to the user via LINE
 */
export async function processAiResponse(
  client: LINEAPIClient,
  repo: Repository,
  user: User,
  replyToken: string,
  aiResponse: string,
  quoteToken?: string
): Promise<void> {
  const reply = aiResponse.trim();
  if (!reply) return;
  const msg: messagingApi.TextMessage = {
    type: "text",
    text: removeMarkdown(reply),
    quoteToken,
  };
  await client.replyMessages(replyToken, [msg]);

  // Save AI response to the database
  const aiMessageId = `ai-${generateUuid()}`;
  await repo.createMessage({
    id: aiMessageId,
    userId: user.id,
    role: "assistant",
    content: [{ type: "text", text: aiResponse }],
  });
}

/**
 * Gets the current AI provider for a user
 */
export function getUserAIProvider(userId: string): string {
  return userAIProviderPreference[userId] || DEFAULT_AI_PROVIDER;
}

/**
 * Sets the AI provider preference for a user
 */
export function setUserAIProvider(userId: string, provider: string): boolean {
  if (provider !== "google" && provider !== "openai") {
    return false;
  }

  // Verify API key availability
  if (provider === "google" && !GOOGLE_GENERATIVE_AI_API_KEY) {
    return false;
  }
  if (provider === "openai" && !OPENAI_API_KEY) {
    return false;
  }

  userAIProviderPreference[userId] = provider;
  return true;
}

/**
 * Generates AI reply based on user conversation history
 */
export async function generateAiReply(user: User, msgs: CoreMessage[]): Promise<string> {
  try {
    const provider = getUserAIProvider(user.id);

    if (provider === "openai") {
      if (!OPENAI_API_KEY) {
        return "OpenAI API key not configured. Please contact the administrator.";
      }

      const r = await generateText({
        model: openai(OPENAI_MODEL),
        messages: msgs,
        temperature: 0.7,
      });
      return r.text;
    } else {
      // Default to Google
      if (!GOOGLE_GENERATIVE_AI_API_KEY) {
        return "Google API key not configured. Please contact the administrator.";
      }

      const r = await generateText({
        model: google(GOOGLE_AI_MODEL),
        messages: msgs,
        temperature: 0.7,
      });
      return r.text;
    }
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return "抱歉，我遇到了一些問題。請稍後再試。";
  }
}
