import { JSX, useState } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types';
import api from '@/utils/api';

interface StatusBadgeConfig {
  color: string;
  text: string;
  desc: string;
}

interface InvoiceCardProps {
  invoice: Invoice;
  onResponse: (id: number, action: 'aceptar' | 'rechazar', rejectionReason?: string) => Promise<void>;
  getStatusBadge: (status: string) => JSX.Element;
}

export function InvoiceCard({ invoice, onResponse, getStatusBadge }: InvoiceCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [responding, setResponding] = useState(false);

  const handleAccept = async () => {
    setResponding(true);
    await onResponse(invoice.id!, 'aceptar');
    setResponding(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Debe especificar un motivo para el rechazo');
      return;
    }
    
    setResponding(true);
    await onResponse(invoice.id!, 'rechazar', rejectionReason);
    setResponding(false);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const canRespond = invoice.status === 'enviada' || invoice.status === 'corregida';

  return (
    <div className="card-aca">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Invoice header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Factura #{invoice.invoice_number}
            </h3>
            {getStatusBadge(invoice.status)}
          </div>

          {/* Main information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha</label>
              <p className="font-semibold text-gray-900">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Proveedor</label>
              <p className="font-semibold text-gray-900">
                {invoice.supplier_name || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">CUIT Emisor</label>
              <p className="font-semibold text-gray-900">{invoice.issuer_cuit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total</label>
              <p className="font-semibold text-green-600 text-lg">
                ${parseFloat(invoice.total_amount.toString()).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Previous rejection reason if applicable */}
          {invoice.status === 'corregida' && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-1">📝 Factura corregida:</h4>
              <p className="text-sm text-purple-700">
                El proveedor ha corregido y reenviado esta factura tras su rechazo anterior.
              </p>
            </div>
          )}

          {/* Rejection form */}
          {showRejectForm && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Motivo del rechazo:</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describa el motivo del rechazo..."
                className="w-full p-2 border border-red-300 rounded-md text-sm"
                rows={3}
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleReject}
                  disabled={responding}
                  className="btn-aca text-sm bg-red-600 hover:bg-red-700"
                >
                  {responding ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="btn-aca text-sm bg-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {canRespond && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={responding}
                  className="btn-aca text-sm bg-green-600 hover:bg-green-700"
                >
                  {responding ? 'Procesando...' : '✅ Aceptar'}
                </button>
                
                <button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  className="btn-aca text-sm bg-red-600 hover:bg-red-700"
                >
                  ❌ Rechazar
                </button>
              </>
            )}

            <button
              onClick={async () => {
                try {
                  const { blob, filename } = await api.downloadInvoice(invoice.id!);
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', filename);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error: any) {
                  console.error('Error downloading invoice:', error);
                  const errorMessage = error.response?.data?.error || 'Error al descargar la factura';
                  alert(errorMessage);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              📥 Descargar PDF
            </button>

            <Link
              href={`/cooperativa/facturas/${invoice.id}/`}
              className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
            >
              👁️ Ver Detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
