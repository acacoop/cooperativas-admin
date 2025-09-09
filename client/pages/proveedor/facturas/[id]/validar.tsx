import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../../utils/AuthContext';
import api from '../../../../utils/api';
import { Invoice, InvoiceItem } from '@/types';

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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Validar Factura - Sistema ACA</title>
      </Head>

      <div className="container-aca">
        {/* Header ACA */}
        <div className="header-aca">
          <Link href="/proveedor/facturas" className="btn-back">
            ← Volver a Mis Facturas
          </Link>
          
          <div className="aca-brand">
            <div className="aca-logo">ACA</div>
            <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
          </div>
          <h1>Validar y Enviar Factura</h1>
          <h2>Proveedor: {user.company_name || user.username}</h2>
          
          {/* Información del usuario */}
          <div className="absolute top-4 right-4 flex items-center space-x-4 text-white">
            <span className="text-sm">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-orange-200 hover:text-white transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Alertas */}
            {error && (
              <div className="alert-aca alert-error mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert-aca alert-success mb-6">
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
                {/* Información de la factura */}
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

                {/* Totales */}
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

                {/* Información importante */}
                <div className="card-aca bg-yellow-50 border-yellow-200">
                  <h3 className="text-yellow-800 mb-3">⚠️ Importante</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Revise cuidadosamente todos los datos antes de enviar</li>
                    <li>• Una vez enviada, la factura estará disponible para la cooperativa</li>
                    <li>• La cooperativa podrá aceptar o rechazar la factura</li>
                    <li>• Si es rechazada, podrá corregirla y reenviarla</li>
                  </ul>
                </div>

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
      </div>
    </div>
  );
}
