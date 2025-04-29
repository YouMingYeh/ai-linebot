import { ClientConfig, messagingApi, MiddlewareConfig } from "@line/bot-sdk";

// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
};

const middlewareConfig: MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_SECRET || "",
};

// Create a new LINE SDK client.
const client = new messagingApi.MessagingApiClient(clientConfig);

const blobClient = new messagingApi.MessagingApiBlobClient(clientConfig);

export { client, middlewareConfig, blobClient };
