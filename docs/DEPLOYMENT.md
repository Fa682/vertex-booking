# DEPLOYMENT GUIDE

## Frontend (Vercel)

1. Connect GitHub repo
2. Configure environment variables
3. Deploy on push to `main`

## Backend (Supabase)

1. Create project at supabase.com
2. Run migrations (`supabase db push`)
3. Configure RLS policies
4. Enable realtime

## Environment Setup
```
Production: .env.production
Staging: .env.staging
Development: .env.local
```

## Monitoring
- Sentry for errors
- Vercel Analytics for performance
- Supabase logs for database
