# Jerusalem Quest - Technology Stack

## Frontend

- **React 19** - Client-side SPA
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **TailwindCSS 4** - Styling (RTL support built-in via `dir="rtl"`)
- **Framer Motion** - Animations (badges, transitions, answer feedback)
- **TanStack Query (React Query)** - Server state, caching, leaderboard polling

## Backend

- **Node.js + Express** - REST API server
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe queries and migrations
- **Zod** - Input validation and schema enforcement

## Image Generation

- **Ideogram API v3** - AI image generation for game visuals
  - Endpoint: `POST https://api.ideogram.ai/v1/ideogram-v3/generate`
  - Auth: `Api-Key` header
  - Full docs: `docs/ideogram.md`

## Infrastructure

- **Docker** - PostgreSQL local development
- **dotenv** - Environment variable management

## Key Libraries

| Purpose | Library |
|---------|---------|
| HTTP client (frontend) | Axios |
| HTTP client (backend/Ideogram) | node-fetch |
| Date handling | date-fns |
| Unique IDs | nanoid |
| Profanity filter (Hebrew) | Custom filter |

## Browser Support

- Chrome 90+
- Safari 15+ (iOS)
- Firefox 90+
- Mobile-first responsive design

## Language & Locale

- UI language: Hebrew
- Direction: RTL
- Font: System Hebrew fonts + Google Fonts fallback (e.g., Heebo)
