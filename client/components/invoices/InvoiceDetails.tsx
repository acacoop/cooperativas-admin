import { Invoice, InvoiceStatus } from '@/types';
import { Card } from '../ui';

interface InvoiceDetailsProps {
  invoice: Invoice;
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <Card title="📄 Datos de la Factura">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Número de Factura</label>
          <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Fecha de Emisión</label>
          <p className="font-semibold text-gray-900">
            {new Date(invoice.issue_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">CUIT Emisor</label>
          <p className="font-semibold text-gray-900">{invoice.issuer_cuit}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">CUIT Receptor</label>
          <p className="font-semibold text-gray-900">{invoice.receiver_cuit}</p>
        </div>
      </div>
    </Card>
  );
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const statusConfig = {
  'enviada': { color: 'blue', text: '📤 Enviada', desc: 'Esperando respuesta' },
  'aceptada': { color: 'green', text: '✅ Aceptada', desc: 'Aprobada' },
  'rechazada': { color: 'red', text: '❌ Rechazada', desc: 'Rechazada' },
  'corregida': { color: 'purple', text: '🔄 Corregida', desc: 'Reenviada' },
  'pendiente_validacion': { color: 'yellow', text: '⏳ Pendiente', desc: 'En revisión' }
} as const;

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status] || { color: 'gray', text: status, desc: '' };

  return (
    <div className="flex flex-col">
      <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
      <span className="text-xs text-gray-500 mt-1">{config.desc}</span>
    </div>
  );
}
