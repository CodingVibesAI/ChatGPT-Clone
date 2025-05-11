# ChatGPT Clone Implementation Tasks

## Phase 1: Project Setup and Authentication

- [x] Initialize Next.js project with TypeScript and App Router
- [x] Set up Tailwind CSS and shadcn/ui
- [x] Configure ESLint and Prettier
- [x] Set up Supabase project and database
- [x] Implement database schema (users, conversations, messages, attachments)
- [x] Create authentication components (SignIn, SignUp)
- [x] Set up protected routes and middleware

## Phase 2: Chat Interface Core (Pixel-Perfect, Professional, Atomic)

> **Reference:** Use `knowledge_base/ui_references/image.png` for every visual detail. Do not move to the next task until the current one is pixel-perfect.

### 2.1 Sidebar (Left Panel)
- [x] Sidebar Header: Add ChatGPT logo/text, dropdown, and correct spacing
- [x] New Chat Button: Small, flush with top, correct icon, dropdown arrow, correct hover/focus states
- [x] Search Bar: Grouped visually with New Chat, correct height, placeholder, and icon
- [x] Conversation List: Add icons, correct spacing, hover/active states, date groupings (Today, Previous 7 Days, Previous 30 Days)
- [x] User Avatar/Settings: Add avatar/settings button at the bottom, correct alignment and spacing

### 2.2 Main Chat Area (Center Panel)
- [x] Background: Use exact ChatGPT background color and gradients
- [x] Prompt: Centered, correct font size/weight, grouped with input when empty
- [x] Message List: Centered, correct spacing, bubble style, scrollable, floating scroll-to-bottom button
- [x] Gradients/Shadows: Add subtle gradients and shadows as in ChatGPT

### 2.3 Input Bar (Bottom Floating)
- [x] Bar Style: Thick, rounded, floating, correct background, border, and shadow
- [x] Plus Button: On the left, correct icon, spacing, and hover/focus states
- [x] Action Buttons: Add Search, Deep research, Create image, More, with tooltips and correct icons
- [x] Send Button: Correct green, shape, icon, hover/focus/active states
- [x] Action Icons Row: Below input, left-aligned, send button right-aligned
- [x] Input Field: Correct font, padding, placeholder, and focus style

### 2.4 Responsiveness & Polish
- [x] Fluid Layout: Sidebar and chat area scale smoothly, use min/max constraints
- [x] Mobile/Tablet: Sidebar collapses, input and prompt stack, all elements remain accessible
- [~] Accessibility: Add aria-labels, keyboard navigation, and focus rings (SKIPPED)
- [~] Visual QA: Compare to ChatGPT at multiple breakpoints, adjust spacing, font, and color for pixel-perfection.

### 2.5 Professional Atomic Structure

- [x] Use exact color palette, spacing, and icons from ChatGPT (inspect their CSS if needed)
- [x] Refactor: Break UI into atomic components (SidebarHeader, SidebarList, SidebarItem, ChatPrompt, ChatInput, ChatMessage, etc.) (CURRENT TASK)

## Phase 3: Conversation Management

### 3.1 Conversation List Supabase Integration
- [x] Define Supabase schema for conversations (id, user_id, title, created_at, updated_at, etc.)
- [x] Set up Supabase client and types in the frontend
- [x] Fetch conversations from Supabase and display in SidebarList
- [x] Subscribe to real-time updates for conversations
- [x] Handle loading and error states in the UI
- [x] Ensure every authenticated user has a row in public.users (trigger + manual)

### 3.2 Conversation CRUD Operations
- [x] Implement create conversation (New Chat button and chat input)
- [x] Implement delete conversation (context menu)
- [ ] Fix: Conversation rename (inline) should persist and update UI correctly (currently buggy)
- [x] Implement optimistic UI updates for CRUD actions
- [x] Add error handling and rollback for failed operations
- [x] Clear active conversation if deleted

### 3.3 Conversation Search & Filter
- [ ] Add search input to sidebar
- [ ] Implement client-side search/filtering of conversations
- [ ] (Optional) Implement server-side search for large lists
- [ ] Add filter options (e.g., by date, favorites, etc.)

### 3.4 State Management & Real-Time
- [x] Use Zustand store for active conversation (global, no prop drilling)
- [x] Invalidate/fetch React Query cache on real-time updates
- [x] Ensure chat area/input bar always fill available space

### 3.5 UI/UX & Edge Cases
- [x] Sidebar collapses/expands smoothly
- [x] Show friendly message if no conversations
- [x] Show sign-in prompt if not authenticated
- [x] Three-dot menu only on hover, always on top, highlight never disappears
- [x] Remove unwanted button highlights/focus rings
- [x] Fix chat input bar jumping; always anchored
- [x] Center prompt/input when no messages
- [x] Fix React key warnings and linter errors
- [x] Handle edge cases: rapid create/delete, rename to empty, etc.
- [x] Ensure accessibility: keyboard navigation, aria-labels for menus/inputs

## Phase 4: File Attachments

- [x] Set up Supabase Storage buckets
- [x] Create file upload component
- [x] Implement drag and drop functionality
- [x] Add file type validation
- [x] Create file preview component
- [x] Implement file deletion
- [x] Add file size limits and validation

## Phase 5: Model Selection and Settings

- [ ] Connect to Together.AI API
    - [x] Create API route to fetch available models from Together.AI (with TTL cache)
    - [ ] Create API route for chat completions (streaming, model param dynamic)
- [ ] Bind selected model to conversation
    - [ ] Update Supabase schema to store selected model per conversation
    - [ ] Ensure chat requests use the selected model for the active conversation
- [ ] Implement model switching logic
    - [ ] Allow switching models mid-conversation (with warning/restriction if needed)
- [ ] Implement token usage tracking
    - [ ] Track tokens used per conversation
    - [ ] Show estimated cost per conversation
- [ ] Create cost estimation component

## Phase 6: User Settings and Preferences

- [ ] Create settings page
- [ ] Allow user to store their together.ai api key and use it for requests
- [ ] Add message history preferences
- [ ] Create notification settings
- [ ] Implement settings persistence
- [ ] Add user profile management

## Phase 7: Performance and Polish

- [ ] Implement proper error handling
- [ ] Add loading states and skeletons
- [ ] Optimize bundle size
- [ ] Add proper SEO metadata
- [ ] Implement analytics
- [ ] Add error monitoring
- [ ] Performance testing and optimization

## Phase 8: Testing and Documentation

- [ ] Write unit tests for components
- [ ] Add integration tests
- [ ] Create end-to-end tests
- [ ] Write API documentation
- [ ] Create user documentation
- [ ] Add JSDoc comments
- [ ] Create README and contribution guidelines

## Phase 9: Deployment and CI/CD

- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Set up monitoring and logging
- [ ] Implement security measures
- [ ] Create deployment documentation
- [ ] Perform security audit
- [ ] Launch production environment
