import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../../utils/AuthContext';
import api from '../../../../utils/api';
import { Invoice, InvoiceItem } from '@/types';

interface InvoiceDetailProps {
  invoice: Invoice & { id: number };
  items: InvoiceItem[];
}

export default function InvoiceDetail() {
  const [invoice, setInvoice] = useState<Invoice & { id: number } | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Check authentication and role immediately
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin_coop') {
      router.push('/');
      return;
    }

    // Only load data if we have an ID from the URL
    if (id && typeof id === 'string') {
      loadInvoiceData(parseInt(id));
    }
  }, [id, isAuthenticated, user, router]);

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const loadInvoiceData = async (invoiceId: number) => {
    setLoading(true);
    setError('');
    
    try {
      const invoiceData = await api.getInvoice(invoiceId);
      if (!invoiceData) {
        setError('Factura no encontrada');
        return;
      }
      setInvoice(invoiceData as Invoice & { id: number });
      setItems(invoiceData.items || []);
    } catch (error: any) {
      console.error('Error loading invoice:', error);
      setError(error.response?.data?.error || 'Error al cargar la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invoice) return;
    
    try {
      setSubmitting(true);
      await api.respondToInvoice(invoice.id, 'aceptar');
      setSuccess('Factura aceptada exitosamente');
      
      // Reload invoice data to update status
      await loadInvoiceData(invoice.id);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al aceptar la factura');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!invoice || !rejectionReason.trim()) return;
    
    try {
      setSubmitting(true);
      await api.respondToInvoice(invoice.id, 'rechazar', rejectionReason);
      setSuccess('Factura rechazada');
      setShowRejectionDialog(false);
      
      // Reload invoice data to update status
      await loadInvoiceData(invoice.id);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al rechazar la factura');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin_coop') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Detalle de Factura - Sistema ACA</title>
      </Head>

      <div className="container-aca">
        {/* Header */}
        <div className="header-aca">
          <Link href="/cooperativa/facturas" className="btn-back">
            ← Volver a Facturas
          </Link>
          
          <div className="aca-brand">
            <div className="aca-logo">ACA</div>
            <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
          </div>
          <h1>Detalle de Factura</h1>
          <h2>Cooperativa: {user.company_name || user.username}</h2>
        </div>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Alerts */}
            {error && (
              <div className="alert-aca alert-error mb-6" role="alert">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert-aca alert-success mb-6" role="alert">
                {success}
              </div>
            )}

            {loading ? (
              <div className="card-aca text-center py-12">
                <div className="spinner-aca mb-4"></div>
                <p className="text-gray-600">Cargando datos de la factura...</p>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Status Banner */}
                <div className={`alert-aca ${
                  invoice.status === 'aceptada' ? 'alert-success' :
                  invoice.status === 'rechazada' ? 'alert-error' :
                  'alert-warning'
                } mb-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        Estado: {
                          invoice.status === 'aceptada' ? '✅ Aceptada' :
                          invoice.status === 'rechazada' ? '❌ Rechazada' :
                          '⏳ Pendiente de Revisión'
                        }
                      </p>
                      {invoice.status === 'rechazada' && invoice.rejection_reason && (
                        <p className="text-sm mt-1">
                          Motivo: {invoice.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="card-aca">
                  <h3 className="mb-4">📄 Datos de la Factura</h3>
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
                </div>

                {/* Items */}
                <div className="card-aca">
                  <h3 className="mb-4">🛒 Items de la Factura</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-3 text-sm font-medium text-gray-600">Descripción</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-600">Cantidad</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-600">Precio Unit.</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="p-3 text-gray-900">{item.description}</td>
                            <td className="p-3 text-right text-gray-900">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-900">
                              ${item.unit_price.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-semibold text-gray-900">
                              ${item.total_price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="card-aca">
                  <h3 className="mb-4">💰 Resumen de Totales</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">${invoice.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IVA:</span>
                        <span className="font-semibold">${invoice.iva_amount.toLocaleString()}</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-green-600">
                          ${invoice.total_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {invoice.status === 'pendiente_validacion' && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowRejectionDialog(true)}
                      disabled={submitting}
                      className="btn-aca bg-red-600 hover:bg-red-700"
                    >
                      ❌ Rechazar Factura
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={submitting}
                      className="btn-aca bg-green-600 hover:bg-green-700"
                    >
                      ✅ Aceptar Factura
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-aca text-center py-12">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Factura no encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  La factura que busca no existe o no tiene permisos para verla.
                </p>
                <Link href="/cooperativa/facturas" className="btn-aca">
                  Volver a Facturas
                </Link>
              </div>
            )}
          </div>
        </main>

        {/* Rejection Dialog */}
        {showRejectionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Rechazar Factura</h3>
              <p className="text-gray-600 mb-4">
                Por favor, indique el motivo del rechazo:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                rows={4}
                placeholder="Escriba el motivo del rechazo..."
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason('');
                  }}
                  className="btn-aca bg-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || submitting}
                  className="btn-aca bg-red-600 hover:bg-red-700"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
