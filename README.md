# AI LINE Bot

**AI LINE Bot** is a modern TypeScript application implementing a LINE chatbot with AI capabilities. Built with Express, PostgreSQL, and the LINE Messaging API SDK, it intelligently processes and responds to user messages by integrating advanced AI models via [AI SDK](https://sdk.vercel.ai/)'s `@ai-sdk/google` and `@ai-sdk/openai`.

*Read this in other languages: [繁體中文](README.zh-TW.md)*

---

## For the Impatient (5-Minute Setup)

Want to get started quickly? Follow these steps:

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-linebot.git
   cd ai-linebot
   ```

2. **Configure your environment:**

   ```bash
   pnpm install
   pnpm run init:env
   ```

   Enter your LINE credentials and AI provider details when prompted.

3. **(In cloud) Deploy with Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

That's it! The application will be running with both the AI bot and a PostgreSQL database configured automatically. No need for separate database setup.

> **IMPORTANT:** To use this bot with LINE, you must deploy it to a server with a valid HTTPS endpoint. LINE's Messaging API requires secure webhook URLs.

---

## Table of Contents

- [AI LINE Bot](#ai-line-bot)
  - [For the Impatient (5-Minute Setup)](#for-the-impatient-5-minute-setup)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Deployment Requirements](#deployment-requirements)
  - [Getting Started](#getting-started)
    - [Clone the repository](#clone-the-repository)
    - [Install dependencies](#install-dependencies)
    - [Environment setup](#environment-setup)
    - [Database initialization](#database-initialization)
  - [Running the Application](#running-the-application)
    - [Development mode](#development-mode)
    - [Production mode](#production-mode)
    - [Endpoints](#endpoints)
  - [Docker Deployment](#docker-deployment)
    - [Using Docker Compose (recommended)](#using-docker-compose-recommended)
    - [Manual Docker deployment](#manual-docker-deployment)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Security Best Practices](#security-best-practices)
  - [Database Management](#database-management)
  - [Demo](#demo)
  - [Support and Contact](#support-and-contact)
  - [License](#license)

---

## Features

- **LINE Messaging API Integration**: Handles various message types (text, image, audio, video, files, stickers).
- **Multiple AI Model Support**: Currently includes Google Generative AI (Gemini) or OpenAI (GPT). You can develop integrations for other models supported by [AI SDK](https://sdk.vercel.ai/).
> ⚠️ **Note**: OpenAI models currently only support image and text message types.
- **Database Integration**: Stores conversation history and user data in PostgreSQL using Prisma ORM.
- **Docker Support**: Easy deployment with Docker and Docker Compose.
- **TypeScript**: Fully typed codebase using modern ES modules.
- **Interactive Setup**: User-friendly script for environment configuration.

---

## Prerequisites

- Node.js v18 or later
- pnpm v9.15.4 or later (recommended) or npm
- PostgreSQL database
- LINE developer account, official account, and Messaging API
- Google Generative AI API key (if using Google AI)
- OpenAI API key (if using OpenAI)
- **A server with an HTTPS endpoint** (required for LINE webhook)

> Need help? Contact me: ym911216@gmail.com

---

## Deployment Requirements

For your LINE bot to work properly, you **must** deploy it on a server with:

1. A public HTTPS endpoint accessible by LINE's servers
2. A valid SSL certificate (not self-signed)

Options include:

- Cloud service providers like AWS, GCP, Azure, Heroku, Render, or Railway
- Your own server with proper SSL termination

> I personally use a DigitalOcean VPS server with Cloudflare SSL.

After deployment, configure your webhook URL in the LINE Developer Console to point to your `/callback` endpoint.

> If you need assistance with deployment or have any questions, please contact: ym911216@gmail.com

---

## Getting Started

### Clone the repository

```bash
# First, fork the repository on GitHub
# Then clone your forked repository
git clone https://github.com/YOUR_USERNAME/ai-linebot.git
cd ai-linebot
```

### Install dependencies

```bash
pnpm install
# or if using npm
npm install
```

### Environment setup

1. **Run the interactive setup script:**

   ```bash
   pnpm run init:env
   ```

   This script guides you through configuring:

   - LINE bot credentials
   - AI model provider selection and API keys
   - Database configuration
   
> You can skip some options that are already configured, or copy `.env.example` to `.env` and edit it manually.

2. **Verify your configuration**: The setup script creates a `.env` file. Example settings:

   ```dotenv
   # LINE Bot Credentials
   CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
   CHANNEL_SECRET=your_line_channel_secret
   PORT=1234

   # AI Provider Configuration
   DEFAULT_AI_PROVIDER=google  # or openai
   GOOGLE_AI_MODEL=gemini-2.0-flash-001
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key  # Required if using Google
   OPENAI_MODEL=gpt-4o
   OPENAI_API_KEY=your_openai_api_key  # Required if using OpenAI

   # Application Settings
   MAX_MESSAGE_LENGTH=30  # Message history limit per user

   # Database Connection
   DATABASE_URL=postgresql://user:password@host:port/database_name
   ```

### Database initialization

1. **For local development**:

   - Ensure your PostgreSQL server is running and accessible via the `DATABASE_URL` in your `.env`.
   - Initialize the database schema:
     ```bash
     pnpm prisma:push
     ```

2. **For Docker deployment**:
   - No separate database setup required! The database will be automatically created and initialized when using Docker Compose.

---

## Running the Application

### Development mode

Use:

```bash
pnpm dev
```

### Production mode

Build and run the compiled version:

```bash
pnpm build
pnpm start
```

### Endpoints

- `GET /` - Check if server is running properly
- `GET /health` - Check server health status
- `POST /callback` - LINE webhook endpoint (configure in LINE Developer Console)

---

## Docker Deployment

### Using Docker Compose (recommended)

1. Ensure Docker and Docker Compose are installed.

2. You can either:

   - Update your `.env` file with the correct database URL for Docker Compose, or
   - Let the `init:env` script configure everything for you with Docker Compose deployment in mind

3. Run:

   ```bash
   docker compose up -d --build
   ```

   This will set up both the application and a PostgreSQL database container, and configure all necessary components.

### Manual Docker deployment

```bash
# Build the image
docker build -t ai-linebot .

# Run the container
docker run -d \
  --env-file .env \
  -p 1234:1234 \
  --name ai-linebot-container \
  ai-linebot
```

---

## Available Scripts

| Command                     | Description                                  |
| --------------------------- | -------------------------------------------- |
| `pnpm clean`                | Remove the dist directory                    |
| `pnpm build`                | Compile TypeScript to JavaScript             |
| `pnpm start`                | Run the compiled application                 |
| `pnpm dev`                  | Start development server with hot reloading  |
| `pnpm init:env`             | Run interactive environment setup            |
| `pnpm test`                 | Run Jest tests                               |
| `pnpm test:db`              | Test database connection                     |
| `pnpm test:prisma`          | Test Prisma connection and print data counts |
| `pnpm prisma:generate`      | Generate Prisma client                       |
| `pnpm prisma:migrate`       | Create and apply a new migration             |
| `pnpm prisma:migrate:deploy`| Deploy migrations in production              |
| `pnpm prisma:studio`        | Open Prisma Studio to manage database        |
| `pnpm prisma:push`          | Push Prisma schema to database               |
| `pnpm db:sync`              | Sync database schema (dev only)              |
| `pnpm lint`                 | Run ESLint                                   |
| `pnpm format`               | Format code with Prettier                    |

---

## Project Structure

```
├── client/                # External client wrappers (LINE API, Prisma)
├── event-handler/         # Webhook event handling logic
│   ├── index.ts           # Main event dispatcher
│   └── user-event-handler/# User event handlers
│       └── message-event-handler/ # Message event handlers
├── lib/                   # Shared libraries and utilities
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # General utility functions
│   ├── messaging-api/     # Messaging API specific utilities
│   └── repository/        # Database access layer
├── prisma/                # Prisma ORM configuration and schema
│   └── schema.prisma      # Database schema definition
├── scripts/               # Utility scripts (setup, tests)
├── index.ts               # Application entry point
├── .env.example           # Example environment variables file
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker container definition
├── environment.d.ts       # Environment variable type declarations
└── tsconfig.json          # TypeScript configuration
```

---

## Security Best Practices

For production deployments:

- **Add** `.env` **to** `.gitignore` to prevent committing secrets.
- Consider using a key manager (e.g., AWS Secrets Manager, HashiCorp Vault).
- Use Docker secrets for containerized deployments.
- Set environment variables directly on the production host or container platform.

---

## Database Management

This project uses Prisma ORM for database operations:

- Schema defined in `prisma/schema.prisma`.
- Repository pattern implemented in `lib/repository/index.ts`.
- Connection managed in `client/prisma.ts`.

To view and manage your data visually:

```bash
pnpm prisma:studio
```

---

## Demo

Add the LINE bot as a friend: <https://lin.ee/Fpn511N>

---

## Support and Contact

If you have any questions, need help with deployment, or want to report issues:

- Contact Email: ym911216@gmail.com
- Open an issue in the GitHub repository

---

## License

MIT © Youming Yeh
