import React, { useState } from 'react';

/**
 * SERVICIO DE COBROS CON CONEKTA
 * Maneja la creación de órdenes de pago para PYMEs
 */
export const ConektaService = {
  /**
   * Generar Link de Pago (Checkout)
   * 1. Envía datos de booking al backend (Supabase Function)
   * 2. Recibe el checkout_url de Conekta
   */
  async createPaymentLink(bookingId: string, amount: number) {
    console.log(`💳 Iniciando cobro de $${amount} MXN para booking: ${bookingId}`);
    
    // Mock de llamada a Supabase Edge Function que llama a Conekta
    const mockCheckoutUrl = `https://checkout.conekta.com/payment/${bookingId}`;
    
    return { checkout_url: mockCheckoutUrl };
  }
};

/**
 * BOTÓN DE PAGO DINÁMICO
 * Se muestra solo si el status es 'pending'
 */
const PaymentButton: React.FC<{ bookingId: string, price: number }> = ({ bookingId, price }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { checkout_url } = await ConektaService.createPaymentLink(bookingId, price);
      // Redirigir al cliente al Checkout de Conekta
      window.location.href = checkout_url;
    } catch (err) {
      console.error("Error al generar pago:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-accent text-background px-6 py-2 rounded font-bold hover:scale-105 transition-all"
    >
      {loading ? 'Generando Pago...' : `Pagar $${price} MXN`}
    </button>
  );
};

export default PaymentButton;
