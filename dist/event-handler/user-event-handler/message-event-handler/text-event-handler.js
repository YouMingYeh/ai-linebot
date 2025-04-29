import { generateAiReply, processAiResponse } from "./utils.js";
const textEventHandler = async (event, user, clientApi, repo) => {
    if (event.message.type !== "text" || !event.replyToken)
        return;
    const text = event.message.text;
    try {
        // Normal message handling
        const createResult = await repo.createMessage({
            id: event.message.id,
            userId: user.id,
            role: "user",
            content: [{ type: "text", text }],
        });
        // Check if message creation was successful
        if (createResult.error || !createResult.data) {
            console.error("Failed to create message:", createResult.error);
            throw new Error("Failed to save user message.");
        }
        // Fetch messages and check for errors
        const messagesResult = await repo.getMessagesByUserId(user.id);
        if (messagesResult.error) {
            console.error("Failed to get messages:", messagesResult.error);
            throw new Error("Failed to retrieve message history.");
        }
        // Use messagesResult.data which can be []
        const aiInput = (messagesResult.data ?? []).map(({ id, role, content }) => ({
            id,
            role,
            content,
        }));
        console.log("aiInput", aiInput);
        // Handle case where aiInput might be empty if needed, though generateAiReply should handle it.
        const aiReply = await generateAiReply(user, aiInput);
        await processAiResponse(clientApi, repo, user, event.replyToken, aiReply);
    }
    catch (e) {
        console.error("textEventHandler:", e);
        await clientApi.replyTextMessage(event.replyToken, "抱歉，我遇到了一些問題。請稍後再試。");
    }
};
export default textEventHandler;
//# sourceMappingURL=text-event-handler.js.map