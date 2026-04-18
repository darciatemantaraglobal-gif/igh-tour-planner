# IGH Tour Admin Platform

## Project Overview
- TanStack Start / React / Vite TypeScript application for IGH Tour admin operations.
- Uses Supabase for authentication, database tables, row-level security, and document storage.
- Styling uses Tailwind CSS with Radix UI components.

## Replit Setup
- Development server is configured through `vite.config.ts` to bind to `0.0.0.0:5000` and allow Replit preview proxy hosts.
- Main workflow should run `npm run dev` and wait on port 5000.

## Environment
- Supabase client expects `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and Vite-prefixed equivalents.
- A Supabase migration exists in `supabase/migrations/`.