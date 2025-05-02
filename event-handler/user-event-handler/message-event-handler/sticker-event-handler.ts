import { webhook } from "@line/bot-sdk";
import { CoreMessage } from "ai";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import { User } from "@/lib/types.js";
import { generateAiReply, processAiResponse } from "./utils.js";

const stickerEventHandler = async (
  event: webhook.MessageEvent,
  user: User,
  clientApi: LINEAPIClient,
  repo: Repository
): Promise<void> => {
  if (event.message.type !== "sticker" || !event.replyToken) return;
  const msg = event.message as webhook.StickerMessageContent;
  try {
    const url = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${msg.stickerId}/ANDROID/sticker.png`;
    const createResult = await repo.createMessage({
      id: msg.id,
      userId: user.id,
      role: "user",
      content: [
        { type: "text", text: `[Sticker](${url})` },
        { type: "image", image: url },
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
    console.error("stickerEventHandler:", err);
    await clientApi.replyTextMessage(
      event.replyToken,
      "抱歉，我在處理您的貼圖時遇到了問題。請稍後再試。"
    );
  }
};

export default stickerEventHandler;
