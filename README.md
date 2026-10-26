# Multimodal AI Assistant

A modern AI-powered chatbot built with **Next.js**, **TypeScript**, and **Tailwind CSS**. The assistant supports intelligent conversations, Markdown rendering, image and PDF understanding, voice input and playback, and a clean ChatGPT-inspired interface.

### ✨ Features

*  AI-powered chat with streaming responses
*  Image upload and analysis
*  PDF upload with question answering (RAG)
*  Voice input (speech-to-text) and read-aloud (text-to-speech)
*  Markdown responses
*  Google sign-in (NextAuth.js)
*  Modern responsive UI with light/dark mode
*  Saved chat history sidebar

### Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn/UI
* NextAuth.js
* Prisma + PostgreSQL (with pgvector)
* Google Gemini API

### Getting Started

#### 1. Prerequisites

* **Node.js 20.9 or newer**
* A **PostgreSQL database with the `pgvector` extension** (a free [Neon](https://neon.tech) project works)
* A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
* A **Google OAuth client** (Google Cloud Console → Google Auth Platform → Clients → Create client → Web application) with this authorized redirect URI:

  ```
  http://localhost:3000/api/auth/callback/google
  ```

  While the app is in testing mode, add your Google account under **Audience → Test users**.

#### 2. Install

```bash
git clone <your-repo-url>
cd my-ai-assistant
npm install
```

#### 3. Configure environment variables

Create **two** files in the project root (next to `package.json`) with the same contents. Next.js reads `.env.local`, but the Prisma CLI only reads `.env`.

```env
AI_API_KEY=your-gemini-api-key
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET=a-long-random-string
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

Generate `AUTH_SECRET` with:

```bash
npx auth secret
```

> These files are gitignored. Never commit them.

#### 4. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

#### 5. Run the app

```bash
npm run dev
```


Built by **Sushma Acharya**
