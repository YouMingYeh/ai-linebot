import { messagingApi } from "@line/bot-sdk";
// Setup all LINE client and Express configurations.
const clientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
};
const middlewareConfig = {
    channelSecret: process.env.CHANNEL_SECRET || "",
};
// Create a new LINE SDK client.
const client = new messagingApi.MessagingApiClient(clientConfig);
const blobClient = new messagingApi.MessagingApiBlobClient(clientConfig);
export { client, middlewareConfig, blobClient };
//# sourceMappingURL=messaging-api.js.map