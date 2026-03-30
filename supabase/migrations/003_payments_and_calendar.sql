-- ACTUALIZACIÓN PARA PAGOS Y CALENDARIO
ALTER TABLE public.bookings 
ADD COLUMN conekta_order_id TEXT,
ADD COLUMN calendar_event_id TEXT,
ADD COLUMN payment_status ENUM ('pending', 'paid', 'refunded') DEFAULT 'pending',
ADD COLUMN cal_com_link TEXT;

-- Índice para búsquedas rápidas de órdenes
CREATE INDEX idx_bookings_conekta ON public.bookings(conekta_order_id);
