import { generateAiReply, processAiResponse } from "./utils.js";
import { convertContentToBase64 } from "../../../lib/utils.js"; // Import from the correct location
const audioEventHandler = async (event, user, clientApi, repo) => {
    if (event.message.type !== "audio" || !event.replyToken)
        return;
    const audioMsg = event.message;
    try {
        const content = await clientApi.getMessageFile(audioMsg.id);
        const base64Data = await convertContentToBase64(content);
        const createResult = await repo.createMessage({
            id: audioMsg.id,
            userId: user.id,
            role: "user",
            content: [
                { type: "text", text: `[Audio]` },
                { type: "file", data: base64Data, mimeType: content.type },
            ]
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
        const aiReply = await generateAiReply(user, (messagesResult.data ?? []).map(({ id, role, content }) => ({
            id,
            role,
            content,
        })));
        await processAiResponse(clientApi, repo, user, event.replyToken, aiReply);
    }
    catch (err) {
        console.error("audioEventHandler:", err);
        await clientApi.replyTextMessage(event.replyToken, "抱歉，我在處理您的音訊時遇到了問題。請稍後再試。");
    }
};
export default audioEventHandler;
//# sourceMappingURL=audio-event-handler.js.map