import React, { useState, useEffect } from 'react';
import { BookingSchema, sanitizeInput } from '../services/security';

interface Cita {
  id: number;
  nombre: string;
  telefono: string;
  servicio: string;
  hora: string;
  fecha: string;
  confirmada: boolean;
  noshow: boolean;
}

interface Servicio {
  id: number;
  nombre: string;
  duracion: number;
  precio: number;
}

interface Webhook {
  event: string;
  timestamp: string;
  client?: string;
  phone?: string;
  service?: string;
  duration_minutes?: number;
  price_mxn?: number;
  status?: string;
  business_type?: string;
  booking_id?: number;
}

const BookingDemo: React.FC = () => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vertex-theme') || 'dark';
    }
    return 'dark';
  });

  const [businessType, setBusinessType] = useState<'salon' | 'taller'>('salon');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    servicio: '',
    fecha: '',
    hora: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [citas, setCitas] = useState<Cita[]>([
    { id: 1, nombre: 'María López', telefono: '+52-81-1111-1111', servicio: 'Corte de cabello', hora: '09:00', fecha: '2025-03-30', confirmada: true, noshow: false },
    { id: 2, nombre: 'Carlos Ruiz', telefono: '+52-81-2222-2222', servicio: 'Coloración', hora: '10:30', fecha: '2025-03-30', confirmada: true, noshow: false },
    { id: 3, nombre: 'Ana García', telefono: '+52-81-3333-3333', servicio: 'Manicura', hora: '11:00', fecha: '2025-03-30', confirmada: false, noshow: false },
    { id: 4, nombre: 'Pedro Sánchez', telefono: '+52-81-4444-4444', servicio: 'Tratamiento capilar', hora: '14:00', fecha: '2025-03-30', confirmada: true, noshow: false },
    { id: 5, nombre: 'Laura Mendez', telefono: '+52-81-5555-5555', servicio: 'Pedicura', hora: '15:30', fecha: '2025-03-31', confirmada: false, noshow: false },
  ]);
  const [lastWebhook, setLastWebhook] = useState<Webhook | null>(null);
  const [showWebhook, setShowWebhook] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedMetrics, setAnimatedMetrics] = useState({ citas: 0, confirmacion: 0, ahorroNoshow: 0, ingresos: 0 });

  const serviciosSalon: Servicio[] = [
    { id: 1, nombre: 'Corte de cabello', duracion: 30, precio: 150 },
    { id: 2, nombre: 'Coloración', duracion: 120, precio: 450 },
    { id: 3, nombre: 'Tratamiento capilar', duracion: 60, precio: 250 },
    { id: 4, nombre: 'Manicura', duracion: 45, precio: 120 },
    { id: 5, nombre: 'Pedicura', duracion: 45, precio: 130 }
  ];

  const serviciosTaller: Servicio[] = [
    { id: 1, nombre: 'Reparación eléctrica', duracion: 60, precio: 400 },
    { id: 2, nombre: 'Plomería', duracion: 90, precio: 500 },
    { id: 3, nombre: 'Mantenimiento preventivo', duracion: 120, precio: 600 },
    { id: 4, nombre: 'Diagnóstico', duracion: 30, precio: 200 },
    { id: 5, nombre: 'Instalación', duracion: 180, precio: 1200 }
  ];

  const servicios = businessType === 'salon' ? serviciosSalon : serviciosTaller;

  const themeConfig: Record<string, any> = {
    dark: {
      bg: '#0a0a0a',
      bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      surface: '#1a1a1a',
      surfaceLight: '#2d2d2d',
      border: '#1a1a1a',
      borderActive: '#00a878',
      text: '#cccccc',
      textPrimary: '#f5f1e8',
      textMuted: '#888888',
      accent: '#00a878',
      cream: '#f5f1e8',
      error: '#ff4444',
      success: '#22cc44',
      warning: '#ffaa00'
    },
    light: {
      bg: '#f5f1e8',
      bgGradient: 'linear-gradient(135deg, #f5f1e8 0%, #ffffff 100%)',
      surface: '#ffffff',
      surfaceLight: '#f0ebe0',
      border: '#e0dbd0',
      borderActive: '#00a878',
      text: '#3a3a3a',
      textPrimary: '#0a0a0a',
      textMuted: '#666666',
      accent: '#00a878',
      cream: '#f5f1e8',
      error: '#ff4444',
      success: '#22cc44',
      warning: '#ffaa00'
    }
  };

  const colors = themeConfig[theme];

  useEffect(() => {
    localStorage.setItem('vertex-theme', theme);
  }, [theme]);

  useEffect(() => {
    const totalCitas = citas.length;
    const confirmadas = citas.filter(c => c.confirmada).length;
    const noshows = citas.filter(c => c.noshow).length;
    const ingresosTotales = citas.reduce((acc, c) => {
      const servicio = servicios.find(s => s.nombre === c.servicio);
      return acc + (servicio ? servicio.precio : 0);
    }, 0);

    setAnimatedMetrics({
      citas: totalCitas,
      confirmacion: totalCitas > 0 ? Math.round((confirmadas / totalCitas) * 100) : 0,
      ahorroNoshow: noshows * 2,
      ingresos: ingresosTotales
    });
  }, [citas, businessType, servicios]);

  const validatePhone = (phone: string) => {
    const mxPhoneRegex = /^\+52-\d{2,3}-\d{4}-\d{4}$/;
    return mxPhoneRegex.test(phone) || phone === '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAgendar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDACIÓN DE SEGURIDAD (ZOD + SANITIZACIÓN)
    const rawData = {
      ...formData,
      client_name: sanitizeInput(formData.nombre), // Sanitización XSS
      client_phone: formData.telefono,
      client_email: "", // Opcional en el esquema
      service_id: "00000000-0000-0000-0000-000000000000", // UUID placeholder para demo
      business_id: "00000000-0000-0000-0000-000000000000",
      scheduled_at: new Date(`${formData.fecha}T${formData.hora}:00Z`).toISOString(),
      notes: sanitizeInput("")
    };

    const validation = BookingSchema.safeParse(rawData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      // Mapeo manual para campos del form de la demo
      setErrors({
        nombre: fieldErrors.client_name,
        telefono: fieldErrors.client_phone,
        servicio: fieldErrors.service_id ? "Selecciona un servicio" : "",
        fecha: fieldErrors.scheduled_at ? "Fecha/Hora inválida" : "",
        hora: fieldErrors.scheduled_at ? "Fecha/Hora inválida" : ""
      });
      return;
    }

    const servicio = servicios.find(s => s.nombre === formData.servicio);
    const newCita: Cita = {
      id: citas.length + 1,
      nombre: rawData.client_name,
      telefono: rawData.client_phone,
      servicio: formData.servicio,
      hora: formData.hora,
      fecha: formData.fecha,
      confirmada: false,
      noshow: false
    };

    const webhook: Webhook = {
      event: 'booking_created',
      timestamp: new Date().toISOString(),
      client: formData.nombre,
      phone: formData.telefono,
      service: formData.servicio,
      duration_minutes: servicio?.duracion,
      price_mxn: servicio?.precio,
      status: 'pending_confirmation',
      business_type: businessType
    };

    setLastWebhook(webhook);
    setShowWebhook(true);
    setCitas(prev => [...prev, newCita]);
    setFormData({ nombre: '', telefono: '', servicio: '', fecha: '', hora: '' });
  };

  const toggleConfirm = (id: number) => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, confirmada: !c.confirmada } : c));
    const cita = citas.find(c => c.id === id);
    if (cita) {
      setLastWebhook({
        event: 'booking_confirmed',
        timestamp: new Date().toISOString(),
        booking_id: id,
        client: cita.nombre,
        status: 'confirmed'
      });
      setShowWebhook(true);
    }
  };

  const toggleNoshow = (id: number) => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, noshow: !c.noshow } : c));
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(JSON.stringify(lastWebhook, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const citasHoy = citas.filter(c => c.fecha === '2025-03-30');
  const confirmadas = citasHoy.filter(c => c.confirmada).length;

  return (
    <div style={{
      backgroundColor: colors.bg,
      backgroundImage: colors.bgGradient,
      color: colors.text,
      minHeight: '100vh',
      fontFamily: '"IBM Plex Sans", sans-serif',
      padding: '20px',
      transition: 'all 400ms ease-out'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, button { font-family: inherit; }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=Space+Mono:wght@400;700&display=swap');
        
        .metric-value { font-family: 'Space Mono', monospace; font-weight: 700; }
        
        button {
          transition: all 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        
        button:hover {
          transform: scale(1.02);
          opacity: 0.9;
        }
        
        input, select {
          transition: all 250ms ease-out;
        }
        
        input:focus, select:focus {
          outline: none;
        }
        
        @keyframes slideInFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .panel {
          animation: slideInFade 400ms ease-out;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 16px;
          background: ${colors.surface};
          transition: all 300ms ease-out;
        }
        
        .cita-card {
          border-left: 3px solid ${colors.accent};
          padding: 14px 16px;
          margin-bottom: 12px;
          background: ${colors.surfaceLight};
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 250ms ease-out;
        }
        
        .cita-card:hover {
          background: ${theme === 'dark' ? '#252525' : '#f0ebe0'};
        }
        
        .cita-card.noshow {
          opacity: 0.6;
          border-left-color: ${colors.error};
        }
        
        .cita-card.pending {
          border-left-color: ${colors.warning};
        }
        
        .metric-card {
          background: ${colors.surface};
          border: 1px solid ${colors.borderActive};
          border-radius: 6px;
          padding: 20px;
          text-align: center;
          flex: 1;
          min-width: 120px;
          transition: all 300ms ease-out;
        }
        
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 168, 120, 0.2);
        }
        
        .metric-card h4 {
          color: ${colors.textMuted};
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 12px;
          font-weight: 400;
        }
        
        .metric-card .value {
          font-size: 32px;
          color: ${colors.accent};
          margin: 0;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
        }

        .error-text {
          color: ${colors.error};
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '16px',
          transition: 'all 300ms ease-out'
        }}>
          <h1 style={{
            margin: '0',
            fontSize: '28px',
            color: colors.textPrimary,
            fontWeight: '600'
          }}>
            VERTEX Booking
          </h1>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.surfaceLight,
                color: colors.text,
                border: `1px solid ${colors.borderActive}`,
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>

            <button
              onClick={() => setBusinessType('salon')}
              style={{
                backgroundColor: businessType === 'salon' ? colors.accent : colors.surfaceLight,
                color: businessType === 'salon' ? colors.bg : colors.text,
                border: `1px solid ${colors.borderActive}`,
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              Salón
            </button>
            <button
              onClick={() => setBusinessType('taller')}
              style={{
                backgroundColor: businessType === 'taller' ? colors.accent : colors.surfaceLight,
                color: businessType === 'taller' ? colors.bg : colors.text,
                border: `1px solid ${colors.borderActive}`,
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              Taller
            </button>
          </div>
        </div>

        <div className="panel">
          <h2 style={{
            margin: '0 0 20px',
            fontSize: '18px',
            color: colors.textPrimary,
            fontWeight: '600'
          }}>
            Nueva Cita
          </h2>
          <form onSubmit={handleAgendar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Juan García"
                  style={{ width: '100%', padding: '10px', backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: '4px', border: `1px solid ${errors.nombre ? colors.error : colors.border}` }}
                />
                {errors.nombre && <div className="error-text">{errors.nombre}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+52-81-XXXX-XXXX"
                  style={{ width: '100%', padding: '10px', backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: '4px', border: `1px solid ${errors.telefono ? colors.error : colors.border}` }}
                />
                {errors.telefono && <div className="error-text">{errors.telefono}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Servicio
                </label>
                <select
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: '4px', border: `1px solid ${errors.servicio ? colors.error : colors.border}` }}
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
                {errors.servicio && <div className="error-text">{errors.servicio}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: '4px', border: `1px solid ${errors.fecha ? colors.error : colors.border}` }}
                />
                {errors.fecha && <div className="error-text">{errors.fecha}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hora
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: '4px', border: `1px solid ${errors.hora ? colors.error : colors.border}` }}
                />
                {errors.hora && <div className="error-text">{errors.hora}</div>}
              </div>
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: colors.accent, color: colors.bg, border: 'none', borderRadius: '4px', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
            >
              Agendar Cita
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: colors.textPrimary, fontWeight: '600' }}>
            Citas de Hoy
          </h2>
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: colors.surfaceLight, borderRadius: '4px', borderLeft: `3px solid ${colors.accent}` }}>
            <p style={{ margin: '0', fontSize: '13px', color: colors.textMuted }}>
              Total: <span style={{ color: colors.accent, fontWeight: '600' }}>{citasHoy.length}</span> | Confirmadas: <span style={{ color: colors.accent, fontWeight: '600' }}>{confirmadas}</span>
            </p>
          </div>
          <div>
            {citasHoy.map(cita => (
              <div
                key={cita.id}
                className={`cita-card ${cita.noshow ? 'noshow' : cita.confirmada ? '' : 'pending'}`}
              >
                <div>
                  <p style={{ margin: '0 0 4px', color: colors.textPrimary, fontWeight: '600' }}>{cita.nombre}</p>
                  <p style={{ margin: '0 0 2px', fontSize: '12px', color: colors.textMuted }}>{cita.servicio}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: colors.textMuted }}>{cita.hora}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleConfirm(cita.id)}
                    style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: cita.confirmada ? colors.accent : colors.surfaceLight, color: cita.confirmada ? colors.bg : colors.text, border: `1px solid ${colors.borderActive}`, borderRadius: '3px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {cita.confirmada ? '✓' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => toggleNoshow(cita.id)}
                    style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: cita.noshow ? colors.error : colors.surfaceLight, color: cita.noshow ? '#fff' : colors.text, border: `1px solid ${colors.error}`, borderRadius: '3px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {cita.noshow ? '✗' : 'No-show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showWebhook && lastWebhook && (
          <div className="panel" style={{ borderLeft: `4px solid ${colors.accent}`, backgroundColor: theme === 'dark' ? 'rgba(0, 168, 120, 0.05)' : 'rgba(0, 168, 120, 0.02)' }}>
            <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ margin: '0', fontSize: '16px', color: colors.accent, fontWeight: '600' }}>
                Webhook Payload (n8n Ready)
              </h2>
              <button
                onClick={copyWebhook}
                style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: copied ? colors.success : colors.surfaceLight, color: copied ? '#fff' : colors.text, border: `1px solid ${colors.borderActive}`, borderRadius: '3px', fontWeight: '600', cursor: 'pointer' }}
              >
                {copied ? 'Copiado ✓' : 'Copiar JSON'}
              </button>
            </div>
            <pre style={{ backgroundColor: colors.surfaceLight, padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '11px', color: colors.accent, margin: '0', border: `1px solid ${colors.borderActive}`, fontFamily: '"Space Mono", monospace' }}>
              {JSON.stringify(lastWebhook, null, 2)}
            </pre>
          </div>
        )}

        <div className="panel">
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: colors.textPrimary, fontWeight: '600' }}>
            Métricas (Esta Semana)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="metric-card">
              <h4>Citas Totales</h4>
              <p className="metric-value" style={{ color: colors.accent }}>{animatedMetrics.citas}</p>
            </div>
            <div className="metric-card">
              <h4>Confirmadas</h4>
              <p className="metric-value" style={{ color: colors.accent }}>{animatedMetrics.confirmacion}%</p>
            </div>
            <div className="metric-card">
              <h4>No-Shows Evitados</h4>
              <p className="metric-value" style={{ color: colors.success }}>{animatedMetrics.ahorroNoshow}</p>
            </div>
            <div className="metric-card">
              <h4>Ingresos</h4>
              <p className="metric-value" style={{ color: colors.accent }}>$ {animatedMetrics.ingresos.toLocaleString()}</p>
            </div>
          </div>

          <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: colors.textPrimary, fontWeight: '600' }}>
            Sin Sistema vs Con Sistema
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: colors.textMuted }}>Sin Sistema</p>
              <div style={{ height: '40px', backgroundColor: colors.surfaceLight, borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: '35%', backgroundColor: colors.error, opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: '600' }}>
                  35% No-shows
                </div>
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: colors.textMuted }}>Con VERTEX Booking</p>
              <div style={{ height: '40px', backgroundColor: colors.surfaceLight, borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: '8%', backgroundColor: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: colors.bg, fontWeight: '600' }}>
                  8% No-shows
                </div>
              </div>
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '12px', color: colors.accent, fontWeight: '600' }}>
            Ahorro: 27% en no-shows = Más ingresos recurrentes
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingDemo;
