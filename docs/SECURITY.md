# SECURITY GUIDE - VERTEX BOOKING

## Authentication
- Supabase Auth (JWT)
- Email/Password and OAuth support
- Session management (refresh tokens)

## Authorization (RLS)
Row Level Security (RLS) is used to ensure data isolation between businesses.
```sql
CREATE POLICY "Users can view their own business bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid()::uuid IN (SELECT owner_id FROM public.businesses WHERE id = business_id));
```

## Rate Limiting
- Applied at API Gateway level (Vercel/Supabase)
- 100 requests per minute per IP

## Encryption
- Data at rest: AES-256 (via AWS/GCP underlying Supabase)
- Data in transit: TLS 1.3

## CORS
- Restricted to `*.vertex.app` and `localhost` for development
