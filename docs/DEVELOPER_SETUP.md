# DEVELOPER SETUP

## Prerequisites
- Node.js 18+
- npm/yarn
- Git
- Supabase account
- n8n.cloud account

## Installation
```bash
git clone https://github.com/vertexit/booking.git
cd booking
npm install
cp .env.example .env.local
```

## Environment Variables
```
VITE_API_URL=https://api.vertex.app
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Local Dev
```bash
npm run dev          # Start dev server on :5173
npm run build        # Production build
npm run test         # Run tests
npm run lint         # ESLint
```

## Database Setup
```bash
supabase start
supabase migration up
supabase seed db
```

## Debugging
- Chrome DevTools (F12)
- Supabase Studio (https://supabase.com/dashboard)
- n8n local instance (npm run n8n)
