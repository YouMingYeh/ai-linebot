import { CoreMessage } from "ai";

export type CoreMessageContent = CoreMessage["content"];
export type CoreMessageRole = CoreMessage["role"];

// Types for database entities and operations, matching Prisma schema (camelCase)
export interface User {
  id: string;
  createdAt: Date; // Prisma uses Date objects
  updatedAt: Date; // Prisma uses Date objects
  displayName: string;
  email?: string | null; // Prisma uses null for optional fields
  pictureUrl?: string | null;
  onboarded: boolean;
}

export interface UserInsert {
  id: string;
  displayName: string;
  pictureUrl?: string | null;
  email?: string | null;
  onboarded?: boolean;
}

export type UserUpdate = Partial<Omit<UserInsert, "id">>;

export interface Message {
  id: string;
  createdAt: Date; // Prisma uses Date objects
  userId: string;
  role: CoreMessageRole;
  content: CoreMessageContent; // Prisma handles JSON conversion
}

export interface MessageInsert {
  id: string;
  userId: string;
  role: CoreMessageRole;
  content: CoreMessageContent;
}
