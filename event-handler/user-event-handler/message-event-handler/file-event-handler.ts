import { webhook } from "@line/bot-sdk";
import { CoreMessage } from "ai";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { User } from "@/lib/types.js";
import { convertContentToBase64 } from "@/lib/utils.js"; // Import from the correct location
import { generateAiReply, processAiResponse } from "./utils.js";

const fileEventHandler = async (
  event: webhook.MessageEvent,
  user: User,
  clientApi: LINEAPIClient,
  repo: Repository
): Promise<void> => {
  if (event.message.type !== "file" || !event.replyToken) return;
  const msg = event.message as webhook.FileMessageContent;
  try {
    const content = await clientApi.getMessageFile(msg.id);
    const base64Data = await convertContentToBase64(content);
    const createResult = await repo.createMessage({
      id: msg.id,
      userId: user.id,
      role: "user",
      content: [
        { type: "text", text: `[File: ${msg.fileName}]` },
        { type: "file", data: base64Data, mimeType: content.type },
      ],
    });
    // Check if message creation was successful
    if (createResult.error || !createResult.data) {
      console.error("Failed to create message:", createResult.error);
      throw new Error("Failed to save user message.");
    }

    const messagesResult = await repo.getMessagesByUserId(user.id);
    if (messagesResult.error) {
      console.error("Failed to get messages:", messagesResult.error);
      throw new Error("Failed to retrieve message history.");
    }

    const aiInput = (messagesResult.data ?? []).map(({ id, role, content }) => ({
      id,
      role,
      content,
    }));
    const aiReply = await generateAiReply(user, aiInput as CoreMessage[]);
    await processAiResponse(clientApi, repo, user, event.replyToken, aiReply);
  } catch (err) {
    console.error("fileEventHandler:", err);
    await clientApi.replyTextMessage(
      event.replyToken,
      "抱歉，我在處理您的檔案時遇到了問題。請稍後再試。"
    );
  }
};

export default fileEventHandler;
