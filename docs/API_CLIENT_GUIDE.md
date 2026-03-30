# API CLIENT GUIDE - VERTEX BOOKING

## Integration via Webhooks
You can integrate VERTEX Booking with other tools like n8n, Zapier, or Make using our webhook system.

### Booking Created Webhook
When a new booking is made, the following JSON is sent to your configured webhook URL:
```json
{
  "event": "booking_created",
  "client": "John Doe",
  "phone": "+52-81-1234-5678",
  "service": "Corte de cabello",
  "price_mxn": 150
}
```

### Authentication
All API requests must include a Bearer token in the `Authorization` header.
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vertex.app/v1/bookings
```

### Rate Limiting
Please limit your API requests to 100 per minute to avoid being throttled.
