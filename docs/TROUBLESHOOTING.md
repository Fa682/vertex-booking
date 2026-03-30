# TROUBLESHOOTING - VERTEX BOOKING

## Common Issues

### 📱 WhatsApp reminders not sending
- **Cause**: Twilio credentials expired or n8n workflow inactive.
- **Solution**: Check n8n execution logs and Twilio balance.

### 🚀 Dashboard performance is slow
- **Cause**: Missing indexes on large booking tables.
- **Solution**: Run `001_initial_schema.sql` to ensure indexes are created.

### 🔑 Authentication errors
- **Cause**: Incorrect `VITE_SUPABASE_URL` or key.
- **Solution**: Verify `.env.local` against Supabase dashboard.

### 📅 Bookings not appearing in Google Calendar
- **Cause**: OAuth token expired for Google API.
- **Solution**: Re-authenticate in n8n Google Calendar node.
