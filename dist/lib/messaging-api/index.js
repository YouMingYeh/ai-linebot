class LINEAPIClient {
    client;
    blobClient;
    constructor(client, blobClient) {
        this.client = client;
        this.blobClient = blobClient;
    }
    async replyMessagesWithRequest(replyMessageRequest) {
        return this.client.replyMessage(replyMessageRequest);
    }
    async replyMessages(replyToken, messages) {
        return this.client.replyMessage({
            replyToken,
            messages,
        });
    }
    async replySingleMessage(replyToken, message) {
        return this.client.replyMessage({
            replyToken,
            messages: [message],
        });
    }
    async replyTextMessage(replyToken, text) {
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
    async replyImageMessage(replyToken, image) {
        return this.client.replyMessage({
            replyToken,
            messages: [image],
        });
    }
    async replyVideoMessage(replyToken, video) {
        return this.client.replyMessage({
            replyToken,
            messages: [video],
        });
    }
    async replyStickerMessage(replyToken, sticker) {
        return this.client.replyMessage({
            replyToken,
            messages: [sticker],
        });
    }
    async getUserProfile(userId) {
        const profile = await this.client.getProfile(userId);
        return profile;
    }
    /**
     * @description Get the file content of a message
     * @param messageId
     * @returns File
     */
    async getMessageFile(messageId) {
        const { httpResponse, body } = await this.blobClient.getMessageContentWithHttpInfo(messageId);
        let contentStream;
        if (httpResponse.status === 200) {
            contentStream = body;
        }
        if (!contentStream) {
            throw new Error("Failed to get the content stream");
        }
        const contentType = httpResponse.headers.get("content-type") || "application/octet-stream";
        // get the mime type of the content stream
        const chunks = [];
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
    async showLoadingAnimation(userId, duration) {
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
    async sendMessages(messages, to) {
        const response = await this.client.pushMessage({
            to,
            messages,
        });
        return response.sentMessages;
    }
}
export { LINEAPIClient };
//# sourceMappingURL=index.js.map