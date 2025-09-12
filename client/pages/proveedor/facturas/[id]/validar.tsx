import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../../utils/AuthContext';
import api from '../../../../utils/api';
import { Invoice, InvoiceItem } from '@/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Alert } from '@/components/ui/Alert';
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails';
import { InvoiceItemDetails } from '@/components/invoices/InvoiceItemDetails';
import { InvoiceTotals } from '@/components/invoices/InvoiceTotals';
import { Aviso } from '@/components/ui';

interface InvoiceData extends Invoice {
  id: number;
}

export default function ValidateInvoice() {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const { user, logout } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'proveedor') {
      router.push('/');
      return;
    }
    
    if (id && typeof id === 'string') {
      loadInvoiceData();
    }
  }, [user, router, id]);

  const loadInvoiceData = async () => {
    try {
      // En un sistema real, necesitaríamos una API para obtener una factura específica
      // Por ahora simulamos los datos
      setInvoice({
        id: parseInt(id as string),
        invoice_number: 'FC-0001-00000123',
        issue_date: '2025-09-07',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: '30-98765432-1',
        subtotal: 10000,
        iva_amount: 2100,
        total_amount: 12100,
        status: 'pendiente_validacion'
      } as InvoiceData);
      
      setItems([
        {
          id: 1,
          invoice_id: parseInt(id as string),
          description: 'Producto de ejemplo',
          quantity: 2,
          unit_price: 5000,
          total_price: 10000
        }
      ]);
    } catch (error) {
      setError('Error al cargar factura');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAndSend = async () => {
    if (!invoice) return;

    setSubmitting(true);
    setError('');

    try {
      await api.validateInvoice(invoice.id, {
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        issuer_cuit: invoice.issuer_cuit,
        receiver_cuit: invoice.receiver_cuit,
        subtotal: invoice.subtotal,
        iva_amount: invoice.iva_amount,
        total_amount: invoice.total_amount,
        status: invoice.status
      });

      setSuccess('Factura validada y enviada exitosamente a la cooperativa');
      setTimeout(() => {
        router.push('/proveedor/facturas');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al validar factura');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (

    <MainLayout title='Validar Factura - Sistema ACA' description='Valida y envía tu factura a la cooperativa'>
        <Header 
          backUrl='/proveedor/facturas' 
          backLabel='Volver a Mis Facturas' 
          title="Validar y Enviar Factura" 
          subtitle={`Proveedor: ${user.company_name || user.username}`} 
        />

        {/* Contenido principal */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Alertas */}
            {error && (
              <Alert type="error" message={error} className="mb-6" />
            )}
            
            {success && (
              <Alert type='success' message={success} className="mb-6" />
            )}

            {loading ? (
              <div className="card-aca text-center py-12">
                <div className="spinner-aca mb-4"></div>
                <p className="text-gray-600">Cargando datos de la factura...</p>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Información de la factura */}
                <InvoiceDetails invoice={invoice} />
                
                <InvoiceItemDetails items={items} />
                
                <InvoiceTotals invoice={invoice} />
                
                {/* Información importante */}
                <Aviso title='⚠️ Importante' type='warning' className='border-yellow-200 text-yellow-700'>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Revise cuidadosamente todos los datos antes de enviar</li>
                    <li>• Una vez enviada, la factura estará disponible para la cooperativa</li>
                    <li>• La cooperativa podrá aceptar o rechazar la factura</li>
                    <li>• Si es rechazada, podrá corregirla y reenviarla</li>
                  </ul>
                </Aviso>

                {/* Botones de acción */}
                <div className="flex justify-between">
                  <Link href="/proveedor/facturas" className="btn-aca bg-gray-600 hover:bg-gray-700">
                    ← Volver sin enviar
                  </Link>
                  
                  <button
                    onClick={handleValidateAndSend}
                    disabled={submitting}
                    className="btn-aca bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="spinner-aca mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      '✅ Validar y Enviar a Cooperativa'
                    )}
                  </button>
                </div>
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
                <Link href="/proveedor/facturas" className="btn-aca">
                  Volver a Mis Facturas
                </Link>
              </div>
            )}
          </div>
        </main>
      </MainLayout>
  );
}
