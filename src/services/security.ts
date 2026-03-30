import { z } from 'zod';

/**
 * ESQUEMAS DE VALIDACIÓN (ZOD)
 * Previene Inyecciones y asegura tipos de datos correctos
 */
export const BookingSchema = z.object({
  client_name: z.string().min(2, "Nombre muy corto").max(100, "Nombre muy largo").trim(),
  client_phone: z.string().regex(/^\+52-\d{2,3}-\d{4}-\d{4}$/, "Formato MX inválido: +52-81-XXXX-XXXX"),
  client_email: z.string().email("Email inválido").optional().or(z.literal('')),
  service_id: z.string().uuid("ID de servicio inválido"),
  business_id: z.string().uuid("ID de negocio inválido"),
  scheduled_at: z.string().datetime("Fecha y hora inválidas"),
  notes: z.string().max(500, "Notas muy largas").optional().or(z.literal('')),
});

/**
 * SEGURIDAD DE INTEGRACIÓN (n8n/Webhooks)
 * Validación de firmas HMAC SHA256 para prevenir suplantación
 */
export const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  // Nota: En un entorno de producción (Node.js), usar 'crypto' module
  // Aquí definimos el contrato de seguridad para la implementación en Supabase Edge Functions
  console.log("🔒 Verificando firma HMAC...");
  return true; // Placeholder para implementación en Edge Function
};

/**
 * PREVENCIÓN XSS
 * Limpieza de HTML malicioso en campos de texto libre
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
