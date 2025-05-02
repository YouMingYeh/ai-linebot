import { webhook } from "@line/bot-sdk";
import { CoreMessage } from "ai";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { User } from "@/lib/types.js";
import { generateAiReply, processAiResponse } from "./utils.js";

const textEventHandler = async (
  event: webhook.MessageEvent,
  user: User,
  clientApi: LINEAPIClient,
  repo: Repository
): Promise<void> => {
  if (event.message.type !== "text" || !event.replyToken) return;
  const text = (event.message as webhook.TextMessageContent).text;

  try {
    // Save user message to database
    const createResult = await repo.createMessage({
      id: event.message.id,
      userId: user.id,
      role: "user",
      content: [{ type: "text", text }],
    });
    
    if (createResult.error || !createResult.data) {
      console.error("Failed to create message:", createResult.error);
      throw new Error("Failed to save user message.");
    }

    // Get conversation history
    const messagesResult = await repo.getMessagesByUserId(user.id);
    if (messagesResult.error) {
      console.error("Failed to get messages:", messagesResult.error);
      throw new Error("Failed to retrieve message history.");
    }
    
    // Format messages for AI processing
    const aiInput = (messagesResult.data ?? []).map(({ id, role, content }) => ({
      id,
      role,
      content,
    }));

    // Generate AI response and send it back to user
    const aiReply = await generateAiReply(user, aiInput as CoreMessage[]);
    await processAiResponse(clientApi, repo, user, event.replyToken, aiReply);
  } catch (e) {
    console.error("textEventHandler:", e);
    await clientApi.replyTextMessage(event.replyToken, "抱歉，我遇到了一些問題。請稍後再試。");
  }
};

export default textEventHandler;
