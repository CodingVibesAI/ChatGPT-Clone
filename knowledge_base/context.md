# ChatGPT Clone - Project Context

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React Server Components
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Next.js API Routes + Edge Runtime for streaming
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **File Storage**: Supabase Storage
- **LLM Integration**: Together.ai API
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library

## Database Schema

### Users Table

```sql
users (
  id uuid references auth.users primary key,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
)
```

### Conversations Table

```sql
conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  model text not null
)
```

### Messages Table

```sql
messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tokens_used integer default 0
)
```

### Attachments Table

```sql
attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  file_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
)
```

## Core Features

### Authentication

- Email/Password signup and login
- Protected routes and API endpoints
- Session management

### Chat Interface

- Real-time streaming responses
- Markdown rendering with syntax highlighting
- Code block copying
- Message reactions and editing
- Progressive loading of chat history
- Mobile-responsive design

### Conversation Management

- Create new conversations
- Rename conversations
- Delete conversations
- Search through conversation history
- Filter conversations by date/model

### File Attachments

- Drag and drop file upload
- File type validation
- Preview attachments
- File size limits
- Secure file storage and retrieval

### Model Selection

- Switch between different Together.ai models
- Model-specific settings
- Token usage tracking
- Cost estimation

### User Settings

- Theme preferences (light/dark)
- Message history preferences
- Model defaults
- Notification settings

## Architecture

### Frontend Architecture

- App Router based routing
- Server Components by default
- Client Components where necessary (interactivity)
- Streaming SSR for optimal performance
- Edge Runtime for API routes
- Progressive enhancement

### State Management

- Server state with TanStack Query
- UI state with Zustand
- Form state with React Hook Form
- Persistent settings in localStorage

### API Design

- RESTful endpoints for CRUD operations
- WebSocket/SSE for real-time features
- Rate limiting and throttling
- Error handling and validation
- API versioning

### Security Measures

- Input sanitization
- CORS configuration
- Content Security Policy
- Rate limiting
- XSS prevention
- CSRF protection

### Performance Optimizations

- Image optimization
- Code splitting
- Route prefetching
- Caching strategies
- Bundle size optimization
- Database indexing

## Development Practices

- TypeScript for type safety
- ESLint + Prettier for code quality
- Husky for pre-commit hooks
- Conventional commits
- Unit and integration testing
- Error monitoring and logging
- CI/CD pipeline
