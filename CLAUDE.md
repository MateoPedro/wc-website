# WC Website — Portugal World Cup 2026 Trip Tracker

A live travel companion for friends & family to follow the Portugal World Cup 2026 journey across North America. Beautiful, football-themed, shareable.

## Project Overview

Single-page application (SPA) where the main user (admin) keeps the app updated as the group follows Portugal around North America. Visitors get a read-only view: traveler pins on a map, Portugal match results, destination photo galleries, and a Spotify playlist.

- **Tournament:** FIFA World Cup 2026 — USA, Canada & Mexico
- **Traveler count:** ~10 friends with individual map pins
- **App type:** SPA (all public sections on one page, toggled via navbar)
- **Deployment:** Vercel

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Map | Mapbox GL JS |
| Backend / Auth / Storage | Supabase (Postgres DB, admin auth, photo bucket) |
| Scores API | football-data.org (free tier) |
| Serverless | Vercel Functions (scores proxy + admin writes) |
| Deploy | Vercel |

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server (Vite)
npm run build        # production build
npm run preview      # preview production build
```

## Architecture

### Public SPA (single page, no routing library)

Sections are toggled via a fixed navbar — no page reloads.

| Section | Default | Description |
|---|---|---|
| Map | Yes | Full-screen Mapbox map — traveler pins, route lines, destination popups + photo gallery |
| Scores | No | Portugal results, group table, goalscorers — toggled via navbar |
| Playlist | No | Spotify embed driven by site_config — toggled via navbar |

### Admin Panel (`/admin` — separate route)

Password-protected dashboard, not visible to public visitors.

- Traveler management (add/edit/delete, avatar upload, pin placement on mini-map)
- Photo management (upload per destination, captions, drag-to-reorder, delete)
- Site config (Spotify URL, hero message, route colour, show/hide scores toggle)

### Auth Model

- Single admin, no sign-up flow, no user table
- Login: POST `/api/admin/login` with password → sets HttpOnly signed cookie
- All `/admin/*` routes protected server-side; redirect to login if cookie absent/invalid
- `SUPABASE_SERVICE_ROLE_KEY` used server-side only for admin writes
- Public reads use `SUPABASE_ANON_KEY` with RLS set to read-only

## Database Schema (Supabase / Postgres)

### `travelers`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| name | text | display name |
| avatar_url | text | Supabase Storage path |
| lat | float | current latitude |
| lng | float | current longitude |
| current_city | text | e.g. "New York" |
| note | text | short personal message |
| is_owner | boolean | true for the main traveler |
| created_at | timestamptz | auto |

### `destinations`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| city | text | e.g. "Los Angeles" |
| lat / lng | float | coordinates |
| description | text | shown in popup |
| date_range | text | e.g. "June 12–16" |
| match_info | jsonb | optional match details tied to this city |
| order | integer | for ordered route line |

### `photos`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| destination_id | uuid FK → destinations | |
| storage_path | text | Supabase Storage key |
| caption | text | optional |
| sort_order | integer | gallery ordering |
| uploaded_at | timestamptz | auto |

### `site_config`
| Column | Type | Notes |
|---|---|---|
| id | integer PK | always 1 (single row) |
| spotify_playlist_url | text | full Spotify URL |
| hero_message | text | shown on landing page |
| route_color | text | hex colour for route lines |
| show_scores | boolean | toggle scores section on/off |

## Environment Variables

Create `.env.local` at the project root:

```
VITE_MAPBOX_TOKEN=          # mapbox.com
VITE_SUPABASE_URL=          # Supabase project settings
VITE_SUPABASE_ANON_KEY=     # Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=  # Supabase project settings (server-only, never expose client-side)
FOOTBALL_DATA_API_KEY=      # football-data.org free registration (server-only)
ADMIN_PASSWORD=             # set manually, stored in env only
ADMIN_COOKIE_SECRET=        # random 32-char string for signing session cookie
```

## Design System

- **Theme:** Portuguese colours — deep green `#006600`, red `#CC0000`, gold accents `#C8A200`
- **Map style:** Mapbox dark base with custom green/red overlay and subtle football-pattern texture
- **Traveler markers:** Circular cropped avatar with a coloured ring — gold for owner, white for friends — name label below
- **Route lines:** Animated dashed lines that draw themselves on map load via Mapbox line animation
- **Animations:** Framer Motion — section fade-in transitions, pin bounce on load, photo reveal on scroll, popup fade-in
- **Mobile-first:** Fully responsive; admin panel usable on phone

## Key TypeScript Types

```ts
interface Traveler {
  id: string
  name: string
  avatar_url: string
  lat: number
  lng: number
  current_city: string
  note: string
  is_owner: boolean
  created_at: string
}

interface Destination {
  id: string
  city: string
  lat: number
  lng: number
  description: string
  date_range: string
  match_info: Record<string, unknown> | null
  order: number
}

interface Photo {
  id: string
  destination_id: string
  storage_path: string
  caption: string | null
  sort_order: number
  uploaded_at: string
}

interface SiteConfig {
  id: 1
  spotify_playlist_url: string
  hero_message: string
  route_color: string
  show_scores: boolean
}
```

## Build Order (Engineering Phases)

| Phase | Goal |
|---|---|
| 0 | External accounts & credentials (Mapbox, Supabase, football-data.org, Vercel) |
| 1 | Project scaffold — Vite + React + TS, Tailwind PT tokens, shadcn/ui, Framer Motion, navbar shell, deploy to Vercel |
| 2 | Supabase setup — table migrations, RLS, storage bucket, dummy seed data |
| 3 | SPA shell & navigation — Framer Motion AnimatePresence section switching, mobile nav |
| 4 | Map section — Mapbox map, traveler pins, destination pins, animated route lines, popups |
| 5 | Destination photo gallery — masonry gallery in popup, lightbox, Supabase Storage |
| 6 | Scores section — Vercel Function proxy, Portugal results + group table, 5-min refresh |
| 7 | Playlist section — Spotify embed from site_config |
| 8 | Admin auth — /admin route, password login, HttpOnly cookie session |
| 9 | Admin: traveler management — CRUD, avatar upload, mini-map pin drag |
| 10 | Admin: photo management — multi-file upload, captions, drag-to-reorder |
| 11 | Admin: site config — Spotify URL, hero message, route colour picker, scores toggle |
| 12 | Polish & launch — animations QA, mobile QA, OG meta tags, favicon, final deploy |

## External Services (Free Tiers)

| Service | Free Tier | Used For |
|---|---|---|
| Mapbox | 50,000 map loads/month | Map tiles + GL JS |
| Supabase | 500MB DB, 1GB storage, 2GB bandwidth | DB, auth, photo storage |
| football-data.org | 10 req/min | Portugal scores + fixtures |
| Vercel | Unlimited personal projects | Hosting + CI/CD |
| Spotify | Public embed — no auth needed | Playlist embed |

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `FOOTBALL_DATA_API_KEY` to the client
- All admin writes go through Vercel Functions using the service role key
- Scores API calls go through a Vercel Function to keep the API key server-side
- Supabase RLS enforces read-only access for all public (anon key) queries
