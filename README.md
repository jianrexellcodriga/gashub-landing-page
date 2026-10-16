# GasHub Landing Page

A Next.js 15 landing page for the GasHub Android app, built with TypeScript and Tailwind CSS.

## Features

- Next.js App Router with React 19
- Tailwind CSS styling
- GasHub marketing sections and app information pages
- GasBot chat widget for app documentation questions
- Sitemap and robots routes for search engines

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

## Available Scripts

- `npm run dev` - Start the development server on port 4028.
- `npm run build` - Build the app for production.
- `npm run start` - Start the production server after a build.
- `npm run serve` - Alias for the production server.
- `npm run lint` - Run ESLint.
- `npm run lint:fix` - Run ESLint with automatic fixes.
- `npm run format` - Format source files with Prettier.
- `npm run type-check` - Run TypeScript without emitting files.

## Project Structure

```txt
public/
  assets/
src/
  app/
    api/
    about/
    privacy/
  components/
  styles/
```

## Environment

The chatbot API expects a Groq API key to be available in the runtime environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GROQ_API_KEY=your_key_here
```

GasBot reads station data from these Supabase tables only:

- `public.stations`
- `public.station_promos`
- `public.station_fuel_aliases`

The chatbot does not execute raw SQL. Station requests go through a guarded server-side
`FetchStationData` tool that validates arguments, caps returned rows, and uses the Supabase client
instead of accepting SQL from chat input.

Do not commit real environment values in new changes.
