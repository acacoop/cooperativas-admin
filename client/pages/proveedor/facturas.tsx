import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
import { Invoice, InvoiceStatus } from '@/types';

type FilterStatus = InvoiceStatus | 'todas';

interface StatusConfig {
  color: string;
  text: string;
  desc: string;
}

export default function SupplierInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<FilterStatus>('todas');
  
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'proveedor') {
      router.push('/');
      return;
    }
    
    loadInvoices();
  }, [user, router]);

  const loadInvoices = async () => {
    try {
      const response = await api.getSupplierInvoices();
      setInvoices(response);
    } catch (error) {
      setError('Error al cargar facturas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig: Record<InvoiceStatus, StatusConfig> = {
      'pendiente_validacion': { color: 'yellow', text: '⏳ Pendiente Validación', desc: 'Revisar y enviar' },
      'enviada': { color: 'blue', text: '📤 Enviada', desc: 'Esperando respuesta cooperativa' },
      'aceptada': { color: 'green', text: '✅ Aceptada', desc: 'Aprobada por cooperativa' },
      'rechazada': { color: 'red', text: '❌ Rechazada', desc: 'Necesita corrección' },
      'corregida': { color: 'purple', text: '🔄 Corregida', desc: 'Reenviada tras corrección' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status, desc: '' };
    
    return (
      <div className="flex flex-col">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
          {config.text}
        </span>
        <span className="text-xs text-gray-500 mt-1">{config.desc}</span>
      </div>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'todas') return true;
    return invoice.status === filter;
  });

  const getFilterName = (filterValue: FilterStatus): string => {
    const filterNames: Record<FilterStatus, string> = {
      'todas': 'todas',
      'pendiente_validacion': 'pendientes de validación',
      'enviada': 'enviadas',
      'aceptada': 'aceptadas',
      'rechazada': 'rechazadas',
      'corregida': 'corregidas'
    };
    return filterNames[filterValue];
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Mis Facturas - Sistema ACA</title>
      </Head>

      <div className="container-aca">
        {/* Header ACA */}
        <div className="header-aca">
          <Link href="/" className="btn-back">
            ← Volver al Dashboard
          </Link>
          
          <div className="aca-brand">
            <div className="aca-logo">ACA</div>
            <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
          </div>
          <h1>Gestión de Facturas</h1>
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
          {/* Botón para nueva factura */}
          <div className="mb-6">
            <Link href="/proveedor/nueva-factura" className="btn-aca">
              ➕ Subir Nueva Factura
            </Link>
          </div>

          {/* Estadísticas rápidas - Ahora son botones de filtro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setFilter('todas')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'todas' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {invoices.length}
              </div>
              <div className="text-sm font-medium text-gray-700">Total Facturas</div>
              <div className="text-xs text-blue-600 mt-1">
                {filter === 'todas' ? '← Filtro activo' : 'Clic para ver todas'}
              </div>
            </button>
            
            <button
              onClick={() => setFilter('pendiente_validacion')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'pendiente_validacion' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {invoices.filter(inv => inv.status === 'pendiente_validacion').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Pendientes</div>
              <div className="text-xs text-yellow-600 mt-1">
                {filter === 'pendiente_validacion' ? '← Filtro activo' : 'Clic para filtrar'}
              </div>
            </button>
            
            <button
              onClick={() => setFilter('aceptada')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'aceptada' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-green-600 mb-2">
                {invoices.filter(inv => inv.status === 'aceptada').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Aceptadas</div>
              <div className="text-xs text-green-600 mt-1">
                {filter === 'aceptada' ? '← Filtro activo' : 'Clic para filtrar'}
              </div>
            </button>
            
            <button
              onClick={() => setFilter('rechazada')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'rechazada' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-red-600 mb-2">
                {invoices.filter(inv => inv.status === 'rechazada').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Rechazadas</div>
              <div className="text-xs text-red-600 mt-1">
                {filter === 'rechazada' ? '← Filtro activo' : 'Clic para filtrar'}
              </div>
            </button>
          </div>

          {/* Lista de facturas */}
          {loading ? (
            <div className="card-aca text-center py-12">
              <div className="spinner-aca mb-4"></div>
              <p className="text-gray-600">Cargando facturas...</p>
            </div>
          ) : error ? (
            <div className="alert-aca alert-error">
              {error}
            </div>
          ) : invoices.length === 0 ? (
            <div className="card-aca text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay facturas aún
              </h3>
              <p className="text-gray-600 mb-4">
                Sube tu primera factura para comenzar a trabajar con las cooperativas.
              </p>
              <Link href="/proveedor/nueva-factura" className="btn-aca">
                Subir Primera Factura
              </Link>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="card-aca text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay facturas {filter === 'todas' ? '' : getFilterName(filter)}
              </h3>
              <p className="text-gray-600 mb-4">
                Cambie el filtro para ver facturas con otros estados.
              </p>
              <button
                onClick={() => setFilter('todas')}
                className="btn-aca"
              >
                Ver Todas las Facturas
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="card-aca">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Encabezado de factura */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Factura #{invoice.invoice_number}
                        </h3>
                        {getStatusBadge(invoice.status)}
                      </div>

                      {/* Información principal */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Fecha</label>
                          <p className="font-semibold text-gray-900">
                            {new Date(invoice.issue_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Cooperativa</label>
                          <p className="font-semibold text-gray-900">
                            {invoice.cooperative_name || 'No identificada'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Total</label>
                          <p className="font-semibold text-green-600 text-lg">
                            ${invoice.total_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Motivo de rechazo si aplica */}
                      {invoice.status === 'rechazada' && invoice.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-1">Motivo del rechazo:</h4>
                          <p className="text-sm text-red-700">{invoice.rejection_reason}</p>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex items-center space-x-3 mt-4">
                        {invoice.status === 'pendiente_validacion' && invoice.id && (
                          <Link 
                            href={`/proveedor/facturas/${invoice.id}/validar`}
                            className="btn-aca text-sm"
                          >
                            ✏️ Validar y Enviar
                          </Link>
                        )}
                        
                        {invoice.status === 'rechazada' && invoice.id && (
                          <Link 
                            href={`/proveedor/facturas/${invoice.id}/corregir`}
                            className="btn-aca text-sm bg-orange-600 hover:bg-orange-700"
                          >
                            🔄 Corregir y Reenviar
                          </Link>
                        )}

                        {invoice.id && (
                          <button 
                            onClick={() => window.open(`/api/invoices/${invoice.id}/download`, '_blank')}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            📥 Descargar PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
