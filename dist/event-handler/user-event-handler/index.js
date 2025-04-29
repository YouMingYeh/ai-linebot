import { messageEventHandler } from "../../event-handler/user-event-handler/message-event-handler/index.js";
export const userEventHandler = async (event) => {
    if (event.source?.type !== "user") {
        return;
    }
    // TODO: Implement other event types.
    switch (event.type) {
        case "message":
            return messageEventHandler(event);
        default:
            return;
    }
};
//# sourceMappingURL=index.js.map