import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../../utils/AuthContext';
import api from '../../../../utils/api';
import { Invoice, InvoiceItem } from '@/types';
import { Header } from '@/components/layout/Header';
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails';
import { InvoiceItemDetails } from '@/components/invoices/InvoiceItemDetails';
import { InvoiceTotals } from '@/components/invoices/InvoiceTotals';
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge';

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
        <Header 
          title="Detalle de Factura"
          backUrl="/cooperativa/facturas"
          backLabel="Volver a Facturas"
        />

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
                <InvoiceStatusBadge 
                  status={invoice.status} 
                  rejectionReason={invoice.rejection_reason} 
                />

                {/* Invoice Details */}
                <InvoiceDetails invoice={invoice} />

                {/* Items */}
                <InvoiceItemDetails items={items} />

                {/* Totals */}
                <InvoiceTotals invoice={invoice} />

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
