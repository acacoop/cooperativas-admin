import { InvoiceStatus } from "@/types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  rejectionReason?: string;
}

const statusConfig = {
  'enviada': { 
    color: 'blue', 
    alertClass: 'alert-warning',
    text: '📤 Enviada', 
    desc: 'Esperando respuesta' 
  },
  'aceptada': { 
    color: 'green', 
    alertClass: 'alert-success',
    text: '✅ Aceptada', 
    desc: 'Aprobada' 
  },
  'rechazada': { 
    color: 'red', 
    alertClass: 'alert-error',
    text: '❌ Rechazada', 
    desc: 'Rechazada' 
  },
  'corregida': { 
    color: 'purple',
    alertClass: 'alert-warning', 
    text: '🔄 Corregida', 
    desc: 'Reenviada' 
  },
  'pendiente_validacion': { 
    color: 'yellow',
    alertClass: 'alert-warning', 
    text: '⏳ Pendiente', 
    desc: 'En revisión' 
  }
} as const;

export function InvoiceStatusBadge({ status, rejectionReason }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || { 
    color: 'gray', 
    alertClass: 'alert-warning',
    text: status, 
    desc: '' 
  };

  return (
    <div className={`alert-aca ${config.alertClass} mb-6`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
              {config.text}
            </span>
            <span className="font-semibold">{config.desc}</span>
          </div>
          {status === 'rechazada' && rejectionReason && (
            <p className="text-sm mt-1">
              Motivo: {rejectionReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}