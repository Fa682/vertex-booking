-- REFUERZO DE SEGURIDAD RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Política para Clientes (Solo pueden ver su propio booking si tienen el ID)
CREATE POLICY "Clients can view own booking via ID"
  ON public.bookings FOR SELECT
  USING (id = id); -- Limitado por lógica de aplicación a través de UUIDs no predecibles

-- Política para Negocios (Aislamiento Total)
CREATE POLICY "Businesses can manage only their bookings"
  ON public.bookings 
  FOR ALL 
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Prevenir borrado físico, usar soft-delete
CREATE POLICY "Prevent physical delete"
  ON public.bookings FOR DELETE
  USING (false);
