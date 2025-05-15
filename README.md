# ChatGPT Clone

A production-grade ChatGPT-like clone built with Next.js, Supabase, Together.ai, Tailwind CSS, and modern best practices. Real-time chat, file attachments, model selection, user settings, and more.

---

## Features

- **Authentication**: Email/password signup & login, protected routes, session management
- **Chat Interface**: Real-time streaming, markdown/code, reactions, editing, mobile-responsive
- **Conversation Management**: Create, rename, delete, search, filter, optimistic UI
- **File Attachments**: Drag & drop, preview, validation, secure storage
- **Model Selection**: Switch Together.ai models, per-conversation, token/cost tracking

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router, RSC), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Edge), Supabase (Postgres, Auth, Storage)
- **State**: Zustand, TanStack Query, React Hook Form, Zod
- **LLM**: Together.ai API
- **Testing**: Vitest

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/chatgpt-clone.git
cd chatgpt-clone
npm install # or yarn or pnpm
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
TOGETHER_API_KEY=...
```

- [Create a Supabase project](https://app.supabase.com/)
- [Get a Together.ai API key](https://platform.together.ai/)

### 3. Database Setup

- Run the SQL in `knowledge_base/context.md` to create tables: `users`, `conversations`, `messages`, `attachments`.
- Set up Supabase Storage bucket for file uploads.

### 4. Run Locally

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Lint code
- `npm test` — Run all tests (Jest/Vitest)

---

## Testing

- **Unit/Integration**: `npm test` (Jest/Vitest)
- **E2E**: See `integration/e2e-chat-auth-flow.test.tsx`
- Tests cover auth, chat, file upload, and more

---

## Production Environment

- Set `NODE_ENV=production` in your deployment platform (Vercel does this automatically)
- Use Node.js 18+ runtime
- Set all required environment variables (see `.env.example`)
- Enable HTTPS (Vercel/most hosts do this by default)
- Configure Supabase CORS for your domain
- Set up Supabase Storage bucket for file uploads
- Set JWT expiration and security settings in Supabase Auth
- Review rate limits and security headers in `middleware.ts` and API routes

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. [Import your repo to Vercel](https://vercel.com/import)
3. Set all environment variables in Vercel dashboard
4. Click Deploy

### Manual/Other Node Hosts

- Build: `npm run build`
- Start: `npm start`
- Set all env vars from `.env.example`

---

## Security & Best Practices

- Input validation (Zod, server-side checks)
- XSS/CSRF/CORS protection (Next.js, Supabase)
- Rate limiting on API routes
- Use HTTPS in production
- Store Together.ai API keys securely (never commit to repo)

---

## Contributing

- PRs welcome! Follow conventional commits and run lint/tests before submitting.
- See `knowledge_base/tasks.md` for roadmap and features.

---

## License

MIT. Not affiliated with OpenAI or ChatGPT. For educational/research use.
