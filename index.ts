// Load environment variables first
import "dotenv/config";
import { HTTPFetchError, middleware, webhook } from "@line/bot-sdk";
import express, { Application, Request, Response } from "express";
import { middlewareConfig } from "./client/messaging-api.js";
import { prisma } from "./client/prisma.js";
import { messageEventHandler } from "./event-handler/user-event-handler/message-event-handler/index.js"; // Direct import

const PORT = process.env.PORT || 3000;

const app: Application = express();

app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    status: "success",
    message: "Connected successfully!",
  });
});

app.get("/health", async (_: Request, res: Response): Promise<Response> => {
  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "success",
      message: "Healthy!",
      database: "connected",
    });
  } catch (err) {
    console.error("Database health check failed:", err);
    return res.status(500).json({
      status: "error",
      message: "Application running but database connection failed",
      database: "disconnected",
    });
  }
});

app.post(
  "/callback",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const callbackRequest: webhook.CallbackRequest = req.body;
    const events: webhook.Event[] = callbackRequest.events!;
    console.log("Events: ", events);
    if (!events) {
      return res.status(400).json({ status: "error", message: "No events found" });
    }

    const results = await Promise.all(
      events.map(async (event: webhook.Event) => {
        try {
          // Simplified event routing
          if (event.source?.type === "user") {
            switch (event.type) {
              case "message":
                await messageEventHandler(event);
                break;
              // TODO: Handle other user event types like follow, unfollow, etc.
              default:
                console.log(`Unhandled user event type: ${event.type}`);
                break;
            }
          } else {
            // Handle non-user events if necessary
            console.log(`Unhandled event source type: ${event.source?.type}`);
          }
        } catch (err: unknown) {
          console.error("Error handling event:", event);
          if (err instanceof HTTPFetchError) {
            console.error(`LINE API Error: ${err.status}`);
            console.error(err.headers.get("x-line-request-id"));
            console.error(err.body);
          } else if (err instanceof Error) {
            console.error(`General Error: ${err.message}`);
            console.error(err.stack);
          } else {
            console.error("Unknown error:", err);
          }
          // Return error status for this specific event
          return {
            status: "error",
            eventId: (event as any).webhookEventId,
            error: err instanceof Error ? err.message : String(err),
          };
        }
        // Return success status for this specific event
        return { status: "success", eventId: (event as any).webhookEventId };
      })
    );

    // Check if *any* event processing failed
    const hasErrors = results.some((result) => result.status === "error");

    if (hasErrors) {
      // Log all errors for easier debugging
      console.error(
        "Errors occurred during event processing:",
        results.filter((r) => r.status === "error")
      );
      // Return a 500 status, but include detailed results
      return res.status(500).json({ status: "partial_error", results });
    } else {
      // All events processed successfully
      return res.status(200).json({ status: "success", results });
    }
  }
);

// Create a server and listen to it.
app.listen(PORT, () => {
  console.log(`Application is live and listening on port ${PORT} at ${new Date()}.`);
});

// Handle application shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT - Application shutting down");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM - Application shutting down");
  await prisma.$disconnect();
  process.exit(0);
});
