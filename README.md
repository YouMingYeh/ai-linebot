# ai-line-bot

**ai-line-bot** is a Node.js & TypeScript application that implements a LINE chatbot with AI integrations. It uses Express, PostgreSQL, the LINE Messaging API SDK (`@line/bot-sdk`), the AI SDK (`@ai-sdk/google`, `@ai-sdk/openai`), and Prisma ORM for database interactions to process and respond to user messages. Development relies on `tsx` for execution and hot-reloading.

---

## Table of Contents

- [ai-line-bot](#ai-line-bot)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Clone the repository](#clone-the-repository)
    - [Install dependencies](#install-dependencies)
    - [Environment setup](#environment-setup)
    - [Database initialization](#database-initialization)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Configuration \& Environment Variables](#configuration--environment-variables)
  - [Running the App](#running-the-app)
  - [Testing Database Connection](#testing-database-connection)
  - [Linting \& Formatting](#linting--formatting)
  - [Deployment](#deployment)
  - [Security Best Practices for Production](#security-best-practices-for-production)
  - [Database Management with Prisma](#database-management-with-prisma)
    - [Database Setup](#database-setup)
    - [Database Commands](#database-commands)
    - [Working with the Database](#working-with-the-database)
  - [Demo](#demo)
  - [Contributing](#contributing)
  - [License](#license)

---

## Features

- Receive and handle LINE messaging events via webhook using Express.
- Persist users and message history in a PostgreSQL database using **Prisma ORM**.
- Support handling various LINE message event types: text, image, audio, video, file, and sticker.
- Integrate with Google Generative AI (Gemini) and OpenAI (GPT) for generating message responses using the AI SDK (`@ai-sdk/*`).
- Choose the default AI provider (Google or OpenAI) via environment variables.
- Interactive setup script (`pnpm run setup`) using `@inquirer/prompts` and `chalk` for easy environment variable configuration.
- Uses `uuid` for generating unique identifiers.
- Uses `date-fns` and `date-fns-tz` for date/time handling.
- Environment-based configuration using `.env` file (loaded via `dotenv`).
- Development and script execution using `tsx`.

---

## Prerequisites

- Node.js v18 or later (as specified in `package.json`)
- pnpm v9.15.4 or later (recommended, specified in `package.json`) or npm
- PostgreSQL database server
- LINE developer account and a Messaging API channel
- Google Generative AI API key (if using Google AI)
- OpenAI API key (if using OpenAI)

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/your-org/ai-line-bot.git # Replace with your repo URL if applicable
cd ai-line-bot
```

### Install dependencies

Using pnpm (recommended):
```bash
pnpm install
```
Using npm:
```bash
npm install
```

### Environment setup

1.  **Copy the example file:**
    ```bash
    cp .env.example .env
    ```
2.  **Run the interactive setup script:** This script will prompt you for necessary API keys and configuration values. If using Docker, the script can help configure `DATABASE_URL` interactively.
    ```bash
    pnpm run setup
    # or npm run setup
    ```
3.  **Manually configure `DATABASE_URL` if not using Docker:** Open the `.env` file and set the `DATABASE_URL` variable for your PostgreSQL instance.
    ```dotenv
    # .env
    # ... other variables set by the script ...

    # Database Connection (Set this manually if not using Docker!)
    DATABASE_URL=postgresql://user:password@host:port/database_name
    ```
4.  **Verify `.env`:** Ensure your `.env` file contains all necessary values after running the script and manually setting the database URL.
    ```dotenv
    # LINE Bot Credentials
    CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
    CHANNEL_SECRET=your_line_channel_secret

    # Server Port
    PORT=1234

    # AI Provider Configuration
    DEFAULT_AI_PROVIDER=google # or openai
    GOOGLE_AI_MODEL=gemini-2.0-flash-001 # or other supported model
    GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key # Required if DEFAULT_AI_PROVIDER=google
    OPENAI_MODEL=gpt-4o # or other supported model
    OPENAI_API_KEY=your_openai_api_key # Required if DEFAULT_AI_PROVIDER=openai

    # Application Settings
    MAX_MESSAGE_LENGTH=30 # Max messages to keep in history per user (-1 for unlimited)

    # Database Connection
    DATABASE_URL=postgresql://user:password@host:port/database_name
    ```
    **Important:** Add `.env` to your `.gitignore` file to prevent committing secrets.

### Database initialization

1.  Ensure your PostgreSQL server is running and accessible via the `DATABASE_URL` you set in `.env`.
2.  Create the database specified in your `DATABASE_URL` (if it doesn't exist):
    ```sql
    -- Connect to your PostgreSQL instance first (e.g., using psql)
    CREATE DATABASE your_database_name; -- Use the name from DATABASE_URL
    ```
3.  Initialize the schema using one of the following:
    - With Prisma (recommended):
      ```bash
      pnpm prisma:push
      # or
      pnpm db:sync
      ```
    - Or with raw SQL:
      ```bash
      psql $DATABASE_URL -f init-db/01-init-schema.sql
      ```

---

## Available Scripts

- `pnpm run dev`: Start the application in development mode with hot-reloading using `tsx`.
- `pnpm run build`: Compile TypeScript code to JavaScript (`tsc`) and resolve path aliases (`tsc-alias`). Output is in the `dist/` folder.
- `pnpm run start`: Run the compiled JavaScript application from the `dist/` folder using `node`.
- `pnpm run setup`: Run the interactive script (`scripts/setup.ts` via `tsx`) to configure the `.env` file (including `DATABASE_URL` for Docker).
- `pnpm run test:db`: Run a script (`scripts/test-db-connection.ts` via `tsx`) to validate the database connection using the `DATABASE_URL` from `.env`.
- `pnpm run test:prisma`: Test the Prisma connection and print user/message counts.
- `pnpm run db:sync`: Sync the database schema with Prisma schema (development only).
- `pnpm run prisma:push`: Push Prisma schema to the database.
- `pnpm run prisma:generate`: Generate Prisma client.
- `pnpm run prisma:migrate`: Run migrations in development.
- `pnpm run prisma:migrate:deploy`: Run migrations in production.
- `pnpm run prisma:studio`: Open Prisma Studio.
- `pnpm run lint`: Run ESLint to analyze the code for potential issues.
- `pnpm run format`: Run Prettier to format the codebase automatically.
- `pnpm run clean`: Remove the `dist/` build directory using `rimraf`.

---

## Project Structure

```text
├── index.ts                  # Express app entrypoint and webhook setup
├── client/                   # Wrappers for external clients
│   ├── messaging-api.ts      # LINE Messaging API client setup (@line/bot-sdk)
│   └── prisma.ts             # Prisma client initialization
├── event-handler/            # Core webhook event dispatcher logic
│   ├── index.ts              # Main event handler function (routes user events)
│   └── user-event-handler/   # Handlers specific to user-generated events
│       ├── index.ts          # Dispatches user events (message, follow, etc.)
│       └── message-event-handler/ # Handlers for different message types
│           ├── audio-event-handler.ts
│           ├── file-event-handler.ts
│           ├── image-event-handler.ts
│           ├── index.ts      # Dispatches message events based on type
│           ├── sticker-event-handler.ts
│           ├── text-event-handler.ts
│           ├── utils.ts      # Utility functions for message handlers (AI interaction)
│           └── video-event-handler.ts
├── lib/                      # Shared libraries, types, utilities, and data access
│   ├── types.ts              # TypeScript type definitions (database models, etc.)
│   ├── utils.ts              # General utility functions
│   └── repository/           # Data access layer for interacting with the database
│       └── index.ts          # Repository class with methods for CRUD operations (using Prisma)
├── init-db/                  # Database initialization scripts
│   └── 01-init-schema.sql    # SQL script to create database tables
├── scripts/                  # Utility scripts for development (run via tsx)
│   ├── setup.ts              # Interactive .env configuration script
│   ├── sync-db-schema.ts     # Script to sync Prisma schema to the database
│   └── test-prisma-connection.ts # Script to test the Prisma connection
├── .env.example              # Example environment variables file
├── .gitignore                # Specifies intentionally untracked files
├── docker-compose.yml        # Docker Compose configuration for local development/testing
├── Dockerfile                # Dockerfile for containerizing the application
├── environment.d.ts          # Type declarations for environment variables
├── prisma.d.ts               # Type declarations for Prisma client
├── eslint.config.js          # ESLint configuration
├── package.json              # Project metadata, dependencies, and scripts
├── pnpm-lock.yaml            # pnpm lockfile
├── README.md                 # This file
└── tsconfig.json             # TypeScript compiler configuration
```

---

## Configuration & Environment Variables

| Key                           | Description                                                    | Example                          | Default (from setup/example) | Required By Setup Script |
| :---------------------------- | :------------------------------------------------------------- | :------------------------------- | :--------------------------- | :----------------------- |
| `CHANNEL_ACCESS_TOKEN`        | LINE Channel Access Token                                      | `abc...XYZ`                      |                              | Yes                      |
| `CHANNEL_SECRET`              | LINE Channel Secret                                            | `123...789`                      |                              | Yes                      |
| `PORT`                        | HTTP server port                                               | `1234`                           | `1234`                       | Yes                      |
| `DEFAULT_AI_PROVIDER`         | Default AI provider to use (`google` or `openai`)              | `google`                         | `google`                     | Yes                      |
| `GOOGLE_AI_MODEL`             | Google AI model name (e.g., Gemini)                            | `gemini-2.0-flash-001`           | `gemini-2.0-flash-001`       | Yes                      |
| `GOOGLE_GENERATIVE_AI_API_KEY`| Google Generative AI API Key                                   | `AIza...`                        |                              | Yes (if provider=google) |
| `OPENAI_MODEL`                | OpenAI model name (e.g., GPT-4o)                               | `gpt-4o`                         | `gpt-4o`                     | Yes                      |
| `OPENAI_API_KEY`              | OpenAI API Key                                                 | `sk-...`                         |                              | Yes (if provider=openai) |
| `MAX_MESSAGE_LENGTH`          | Max past messages to keep/retrieve per user (-1 for unlimited) | `30`                             | `30`                         | Yes                      |
| `DATABASE_URL`                | PostgreSQL connection string                                   | `postgresql://user:pass@host:port/db` |                              | **No (Set Manually)**    |

---

## Running the App

1.  **Start in development mode:** (Uses `tsx` for hot-reloading)
    ```bash
    pnpm run dev
    ```
    The application will listen on the port specified by the `PORT` environment variable (default: 1234).
2.  **Or build and start for production:**
    ```bash
    # Build the project
    pnpm run build

    # Start the compiled app
    pnpm run start
    ```
3.  **Verify the endpoints:**
    - `GET /` → Returns a simple health check message.
    - `GET /health` → Returns a simple health check message.
    - `POST /callback` → The endpoint for LINE Messaging API webhooks. You need to configure this URL in your LINE Developer Console.

---

## Testing Database Connection

Ensure your `DATABASE_URL` is correctly set in `.env`.
```bash
pnpm run test:db
```
This script will attempt to connect to the database and report success or failure.

You can also run:
```bash
pnpm run test:prisma
```
This will test the Prisma connection and print user/message counts.

---

## Linting & Formatting

```bash
# Run ESLint
pnpm run lint

# Run Prettier to format code
pnpm run format
```

---

## Deployment

You can deploy this application using various methods. The simplest way is to use Docker Compose, which will set up both the application and database.

**Using Docker Compose:** (Recommended for quick start)

1.  Ensure Docker and Docker Compose are installed.
2.  Make sure your `.env` file exists and has the correct `DATABASE_URL` pointing to the service name (`postgres`) and other required variables. Example `DATABASE_URL` for compose: `postgresql://linebot:password@postgres:5432/linebot`
3.  Run the following command in the project root:
    ```bash
    docker compose up -d --build
    ```
    This single command will build the application image, start the application container and the PostgreSQL container, and set up the network.

**Using Docker manually:**

The provided `Dockerfile` can also be used for manual Docker deployment.

1.  **Build the Docker image:**
    ```bash
    docker build -t ai-line-bot .
    ```
2.  **Run the container:** (Example using `docker run`. Adjust environment variables as needed.)
    ```bash
    # Ensure your .env file is present or provide variables directly
    docker run -d \
      --env-file .env \ # Load variables from .env file
      -p 1234:1234 \    # Map host port 1234 to container port 1234
      -e PORT=1234 \    # Ensure the app inside the container listens on 1234
      # Add other -e flags if not using --env-file or to override .env values
      --name ai-line-bot-container \
      ai-line-bot
    ```
    *Note: The `Dockerfile` exposes port 1234. The `docker-compose.yml` also maps and sets the internal `PORT` to 1234. This example aligns with that.*
    *The `docker-compose.yml` references `ghcr.io/youmingyeh/lio-line:latest` which might be used if `docker compose up` is run without `--build`.*

---

## Security Best Practices for Production

For production environments, avoid storing sensitive information like API keys and database credentials directly in the `.env` file or committing them to version control. Instead, consider the following:

- **Use a Secrets Manager**: Tools like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault can securely store and manage sensitive information.
- **Use Docker Secrets**: If deploying with Docker, use Docker secrets to securely pass sensitive information to containers.
- **Environment Variables**: Set sensitive information as environment variables directly on the production server or container orchestration platform (e.g., Kubernetes).

**Important:** Always add `.env` to your `.gitignore` file to prevent accidental commits of sensitive information.

---

## Database Management with Prisma

This project uses Prisma ORM to handle database interactions. Prisma provides type-safe database access with auto-generated query methods.

### Database Setup

1. Make sure your database connection details are configured in your `.env` file.
2. Run the database setup using:
   ```
   pnpm prisma:push
   ```

### Database Commands

- Generate Prisma client: `pnpm prisma:generate`
- View and manage your database: `pnpm prisma:studio`
- Create a migration (development): `pnpm prisma:migrate`
- Sync database schema without migrations: `pnpm db:sync`
- Test database connection: `pnpm test:prisma`

### Working with the Database

The application uses Prisma Client for all database operations. Key files:

- `prisma/schema.prisma`: Database schema definition
- `client/prisma.ts`: Prisma client initialization
- `lib/repository/index.ts`: Repository pattern implementation with Prisma
- `prisma.d.ts`: Type declarations for Prisma client
- `environment.d.ts`: Type declarations for environment variables

---

## Demo

You can add https://lin.ee/Fpn511N this OA as a friend in your LINE app to give a first 

---

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## License

MIT © Your Name # Update with appropriate license holder
