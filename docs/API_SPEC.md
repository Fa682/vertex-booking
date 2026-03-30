# API SPECIFICATION

## Base URL
https://api.vertex.app/v1

## Authentication
```
Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### POST /bookings
Create new booking
```json
// REQUEST:
{
  "service_id": "uuid",
  "client_name": "Juan García",
  "client_phone": "+52-81-1234-5678",
  "client_email": "juan@example.com",
  "scheduled_at": "2025-04-15T14:30:00Z"
}

// RESPONSE:
{
  "id": "booking-uuid",
  "status": "pending",
  "created_at": "2025-03-30T10:00:00Z"
}
```

### GET /availability
```
QUERY: ?service_id={uuid}&date={YYYY-MM-DD}
RESPONSE: ["09:00", "09:30", "10:00", ...]
```

### PATCH /bookings/{id}
Confirm, cancel, or update booking
```json
{
  "status": "confirmed | cancelled | completed",
  "reason": "string (if cancelled)"
}
```

### GET /reports/metrics
```json
{
  "total_bookings": 42,
  "confirmed_rate": 85,
  "revenue_mxn": 6300,
  "noshow_rate": 8
}
```
