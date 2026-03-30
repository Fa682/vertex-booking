# DATABASE SCHEMA - VERTEX BOOKING

## Tables

### businesses
- `id` (UUID, PK)
- `name` (TEXT)
- `type` (ENUM: salon, taller, clinica, spa)
- `owner_id` (UUID, FK auth.users)
- `email` (TEXT)
- `phone` (TEXT)
- `timezone` (TEXT)
- `settings` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### services
- `id` (UUID, PK)
- `business_id` (UUID, FK businesses)
- `name` (TEXT)
- `description` (TEXT)
- `duration_minutes` (INTEGER)
- `price_mxn` (DECIMAL)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)

### bookings
- `id` (UUID, PK)
- `business_id` (UUID, FK businesses)
- `service_id` (UUID, FK services)
- `client_name` (TEXT)
- `client_phone` (TEXT)
- `client_email` (TEXT)
- `scheduled_at` (TIMESTAMP)
- `duration_minutes` (INTEGER)
- `price_mxn` (DECIMAL)
- `status` (ENUM: pending, confirmed, completed, cancelled, noshow)
- `confirmed_at` (TIMESTAMP)
- `cancelled_at` (TIMESTAMP)
- `cancellation_reason` (TEXT)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### reminders
- `id` (UUID, PK)
- `booking_id` (UUID, FK bookings)
- `sent_at` (TIMESTAMP)
- `type` (ENUM: email, whatsapp, sms)
- `status` (ENUM: pending, sent, failed)
- `created_at` (TIMESTAMP)

### audit_log
- `id` (UUID, PK)
- `business_id` (UUID, FK businesses)
- `user_id` (UUID, FK auth.users)
- `action` (TEXT)
- `resource_type` (TEXT)
- `resource_id` (UUID)
- `changes` (JSONB)
- `ip_address` (TEXT)
- `created_at` (TIMESTAMP)

## Indexes
- `idx_bookings_business_scheduled` on `bookings(business_id, scheduled_at)`
- `idx_bookings_status` on `bookings(status)`
- `idx_services_business` on `services(business_id)`
