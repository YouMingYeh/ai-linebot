import { prisma } from "@/client/prisma.js";
import { Message, MessageInsert, User, UserInsert, UserUpdate } from "@/lib/types.js";

const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || "30", 10);

class Repository {
  async getUserById(id: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return { data: user as User, error: null };
    } catch (error) {
      console.error("getUserById error:", error);
      return { data: null, error: error as Error };
    }
  }

  async createUser(user: UserInsert): Promise<{ data: User | null; error: Error | null }> {
    try {
      const createdUser = await prisma.user.create({
        data: {
          id: user.id,
          displayName: user.displayName,
          pictureUrl: user.pictureUrl,
          email: user.email,
          onboarded: user.onboarded ?? false,
        },
      });

      return { data: createdUser as User, error: null };
    } catch (error) {
      console.error("createUser error:", error);
      return { data: null, error: error as Error };
    }
  }

  async updateUserById(
    id: string,
    user: UserUpdate
  ): Promise<{ data: User | null; error: Error | null }> {
    try {
      if (Object.keys(user).length === 0) {
        return { data: null, error: new Error("No fields to update") };
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          displayName: user.displayName,
          pictureUrl: user.pictureUrl,
          email: user.email,
          onboarded: user.onboarded,
          updatedAt: new Date(), // Ensure updatedAt is always refreshed
        },
      });

      return { data: updatedUser as User, error: null };
    } catch (error) {
      console.error("updateUserById error:", error);
      return { data: null, error: error as Error };
    }
  }

  async getMessagesByUserId(
    userId: string
  ): Promise<{ data: Message[] | null; error: Error | null }> {
    try {
      let messages;

      if (MAX_MESSAGE_LENGTH === -1) {
        // Get all messages without limit
        messages = await prisma.message.findMany({
          where: { userId },
          orderBy: { createdAt: "asc" }, // Already in ascending order by created_at
        });
      } else {
        // Get limited number of most recent messages
        messages = await prisma.message.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: MAX_MESSAGE_LENGTH,
        });

        // Reverse to get them in ascending order
        messages = messages.reverse();
      }

      return { data: messages as Message[], error: null };
    } catch (error) {
      console.error("getMessagesByUserId error:", error);
      return { data: null, error: error as Error };
    }
  }

  async createMessage(
    message: MessageInsert
  ): Promise<{ data: Message | null; error: Error | null }> {
    try {
      const createdMessage = await prisma.message.create({
        data: {
          id: message.id,
          userId: message.userId,
          role: message.role,
          content: message.content as any, // Prisma will handle JSON serialization
        },
      });

      return { data: createdMessage as Message, error: null };
    } catch (error) {
      console.error("createMessage error:", error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Upload a file to the our r2 server.
   * @param filename We use the message ID as the filename as convention.
   */
  async uploadFile(file: File, filename: string) {
    // TODO: USE S3 PACKAGE AND UPLOAD TO R2
    return "";
  }
}

export { Repository };
