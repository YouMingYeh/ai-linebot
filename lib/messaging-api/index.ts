import { messagingApi } from "@line/bot-sdk";

class LINEAPIClient {
  private client: messagingApi.MessagingApiClient;
  private blobClient: messagingApi.MessagingApiBlobClient;
  constructor(
    client: messagingApi.MessagingApiClient,
    blobClient: messagingApi.MessagingApiBlobClient,
  ) {
    this.client = client;
    this.blobClient = blobClient;
  }
  async replyMessagesWithRequest(
    replyMessageRequest: messagingApi.ReplyMessageRequest,
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage(replyMessageRequest);
  }
  async replyMessages(
    replyToken: string,
    messages: messagingApi.Message[],
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage({
      replyToken,
      messages,
    });
  }
  async replySingleMessage(
    replyToken: string,
    message: messagingApi.Message,
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage({
      replyToken,
      messages: [message],
    });
  }

  async replyTextMessage(
    replyToken: string,
    text: string,
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    });
  }
  async replyImageMessage(
    replyToken: string,
    image: messagingApi.ImageMessage,
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage({
      replyToken,
      messages: [image],
    });
  }
  async replyVideoMessage(
    replyToken: string,
    video: messagingApi.VideoMessage,
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage({
      replyToken,
      messages: [video],
    });
  }
  async replyStickerMessage(
    replyToken: string,
    sticker: messagingApi.StickerMessage,
  ): Promise<messagingApi.ReplyMessageResponse> {
    return this.client.replyMessage({
      replyToken,
      messages: [sticker],
    });
  }

  async getUserProfile(
    userId: string,
  ): Promise<messagingApi.UserProfileResponse> {
    const profile = await this.client.getProfile(userId);
    return profile;
  }

  /**
   * @description Get the file content of a message
   * @param messageId
   * @returns File
   */
  async getMessageFile(messageId: string): Promise<File> {
    const { httpResponse, body } =
      await this.blobClient.getMessageContentWithHttpInfo(messageId);
    let contentStream;
    if (httpResponse.status === 200) {
      contentStream = body;
    }
    if (!contentStream) {
      throw new Error("Failed to get the content stream");
    }
    const contentType =
      httpResponse.headers.get("content-type") || "application/octet-stream";

    // get the mime type of the content stream
    const chunks: Buffer[] = [];
    for await (const chunk of contentStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = new File([buffer], `${messageId}`, {
      type: contentType,
    });
    return content;
  }
  /**
   *
   * @param userId Only User ID is supported
   * @param duration duration in seconds
   */

  async showLoadingAnimation(userId: string, duration?: number) {
    return this.client.showLoadingAnimation({
      chatId: userId,
      loadingSeconds: duration,
    });
  }

  /**
   *
   * @param messages
   * @param to
   * @returns
   */
  async sendMessages(
    messages: messagingApi.Message[],
    to: string,
  ): Promise<messagingApi.SentMessage[]> {
    const response = await this.client.pushMessage({
      to,
      messages,
    });
    return response.sentMessages;
  }
}

export { LINEAPIClient };
