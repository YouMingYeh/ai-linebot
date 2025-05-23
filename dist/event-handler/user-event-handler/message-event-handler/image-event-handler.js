import { generateAiReply, processAiResponse } from "./utils.js";
import { convertContentToBase64 } from "../../../lib/utils.js"; // Import from the correct location
const imageEventHandler = async (event, user, clientApi, repo) => {
    if (event.message.type !== "image" || !event.replyToken)
        return;
    const msg = event.message;
    try {
        const content = await clientApi.getMessageFile(msg.id);
        const base64Data = await convertContentToBase64(content);
        const createResult = await repo.createMessage({
            id: msg.id,
            userId: user.id,
            role: "user",
            content: [
                { type: "text", text: `[Image]` },
                { type: "image", image: `data:${content.type};base64,${base64Data}` },
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
        const aiInput = (messagesResult.data ?? []).map(({ id, role, content }) => ({
            id,
            role,
            content,
        }));
        const aiReply = await generateAiReply(user, aiInput);
        await processAiResponse(clientApi, repo, user, event.replyToken, aiReply);
    }
    catch (e) {
        console.error("imageEventHandler:", e);
        await clientApi.replyTextMessage(event.replyToken, "抱歉，我在處理您的圖片時遇到了問題。請稍後再試。");
    }
};
export default imageEventHandler;
//# sourceMappingURL=image-event-handler.js.map