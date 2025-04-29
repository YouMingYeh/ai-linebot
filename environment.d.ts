declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // LINE Bot Credentials
      CHANNEL_ACCESS_TOKEN: string;
      CHANNEL_SECRET: string;

      // Server Port
      PORT?: string; // Optional, defaults to 3000 or 1234

      // AI Provider Configuration
      DEFAULT_AI_PROVIDER?: string; // Optional, defaults to 'google'
      GOOGLE_AI_MODEL?: string; // Optional, defaults to 'gemini-2.0-flash-001'
      GOOGLE_GENERATIVE_AI_API_KEY?: string; // Optional, but required if provider is google
      OPENAI_MODEL?: string; // Optional, defaults to 'gpt-4o'
      OPENAI_API_KEY?: string; // Optional, but required if provider is openai

      // Application Settings
      MAX_MESSAGE_LENGTH?: string; // Optional, defaults to '30'

      // Database Connection
      DATABASE_URL: string;
    }
  }
}

export {};
