# n8n WORKFLOWS - VERTEX BOOKING

## Workflow 1: booking_created

**Trigger**: Webhook from Supabase
**Actions**:
1. Extract booking data
2. Send WhatsApp via Twilio
3. Send email via Sendgrid
4. Add to Google Calendar
5. Log to audit table

**Payload Example**:
```json
{
  "event": "booking_created",
  "booking_id": "uuid",
  "client_name": "Juan García",
  "client_phone": "+52-81-1234-5678",
  "client_email": "juan@example.com",
  "service": "Corte de cabello",
  "scheduled_at": "2025-04-15T14:30:00Z",
  "price_mxn": 150,
  "business_name": "Salón Premium"
}
```

## Workflow 2: reminder_24h

**Cron**: Daily at 2 AM
**Filter**: Bookings scheduled for tomorrow
**Actions**:
1. Send WhatsApp reminder: "Recordatorio: Tu cita es mañana a las 14:30"
2. Update reminder status in Supabase

## Workflow 3: reminder_2h

**Trigger**: Every 30min check
**Filter**: Bookings in next 2 hours
**Actions**:
1. Send final WhatsApp reminder: "Tu cita es en 2 horas ⏰"
2. Log final contact attempt

---

## Setup Instructions
1. Create n8n.cloud account
2. Create New Workflows
3. Configure Twilio credentials
4. Configure Sendgrid API key
5. Deploy & activate
