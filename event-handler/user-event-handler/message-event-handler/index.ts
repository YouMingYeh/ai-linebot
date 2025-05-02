import { webhook } from "@line/bot-sdk";
import { blobClient, client } from "@/client/messaging-api.js";
import { prisma } from "@/client/prisma.js";
import { LINEAPIClient } from "@/lib/messaging-api/index.js";
import { Repository } from "@/lib/repository/index.js";
import audioEventHandler from "./audio-event-handler.js";
import fileEventHandler from "./file-event-handler.js";
import imageEventHandler from "./image-event-handler.js";
import stickerEventHandler from "./sticker-event-handler.js";
import textEventHandler from "./text-event-handler.js";
import videoEventHandler from "./video-event-handler.js";

export const messageEventHandler = async (event: webhook.MessageEvent): Promise<void> => {
  const lineApiClient = new LINEAPIClient(client, blobClient);
  const repository = new Repository();

  if (!event.source || !event.source.userId) {
    console.error("No source found.");
    return;
  }

  await lineApiClient.showLoadingAnimation(event.source.userId);

  try {
    const profile = await lineApiClient.getUserProfile(event.source.userId);

    // Get or create user using Prisma's upsert operation
    const user = await prisma.user.upsert({
      where: { id: profile.userId },
      update: {
        // Only update display name and picture URL if they've changed
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
      create: {
        id: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        onboarded: false,
      },
    });

    // Now we can use the user directly without having to do an additional query
    switch (event.message.type) {
      case "text":
        return textEventHandler(event, user, lineApiClient, repository);
      case "image":
        return imageEventHandler(event, user, lineApiClient, repository);
      case "sticker":
        return stickerEventHandler(event, user, lineApiClient, repository);
      case "file":
        return fileEventHandler(event, user, lineApiClient, repository);
      case "audio":
        return audioEventHandler(event, user, lineApiClient, repository);
      case "video":
        return videoEventHandler(event, user, lineApiClient, repository);
      default:
        if (!event.replyToken) {
          return;
        }
        await lineApiClient.replyTextMessage(
          event.replyToken,
          "哎呀！🚨 這個訊息好像超出我的理解範圍！請試試其他類型的訊息，希望下次能幫上忙！。"
        );
    }
  } catch (error) {
    console.error("Error in messageEventHandler:", error);
    if (event.replyToken) {
      await lineApiClient.replyTextMessage(
        event.replyToken,
        "⚠️ 我剛剛遇到了一點小問題 🛠️，讓我重新啟動一下，請稍後再試。"
      );
    }
  }
};

export default messageEventHandler;
