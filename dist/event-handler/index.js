import { userEventHandler } from "./user-event-handler/index.js";
export const eventHandler = async (event) => {
    if (event.source?.type === "user") {
        return userEventHandler(event);
    }
};
//# sourceMappingURL=index.js.map