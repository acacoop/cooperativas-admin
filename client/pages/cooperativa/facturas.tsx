import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/utils/AuthContext';
import api from '@/utils/api';
import { Invoice, InvoiceStatus } from '@/types';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { Header } from '@/components/layout/Header';
import MainLayout from '@/components/layout/MainLayout';
import { Alert, Button, FilterSelector, ScrollView } from '@/components/ui';

type FilterStatus = InvoiceStatus | 'todas' | 'corregida';
type ViewMode = 'cards' | 'table';

interface StatusConfig {
  color: string;
  text: string;
  desc: string;
}

export default function CooperativeInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('todas');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin_coop') {
      router.push('/');
      return;
    }
    
    loadInvoices();
  }, [user, router]);

  const loadInvoices = async () => {
    try {
      const data = await api.getCooperativeInvoices();
      setInvoices(data);
    } catch (error) {
      setError('Error al cargar facturas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceResponse = async (
    invoiceId: number,
    action: 'aceptar' | 'rechazar',
    rejectionReason?: string
  ) => {
    try {
      await api.respondToInvoice(invoiceId, action, rejectionReason);
      loadInvoices();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al responder factura');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, StatusConfig> = {
      'enviada': { color: 'blue', text: '📤 Enviada', desc: 'Esperando su respuesta' },
      'aceptada': { color: 'green', text: '✅ Aceptada', desc: 'Aprobada por usted' },
      'rechazada': { color: 'red', text: '❌ Rechazada', desc: 'Rechazada por usted' },
      'corregida': { color: 'purple', text: '🔄 Corregida', desc: 'Proveedor corrigió y reenvió' }
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
    if (filter === 'enviada') return invoice.status === 'enviada' || invoice.status === 'corregida';
    return invoice.status === filter;
  });

  const getFilterName = (filterValue: FilterStatus): string => {
    const filterNames: Record<FilterStatus, string> = {
      'todas': 'todas',
      'enviada': 'pendientes de respuesta',
      'aceptada': 'aceptadas',
      'rechazada': 'rechazadas',
      'corregida': 'corregidas',
      'pendiente_validacion': 'pendientes de validación'
    };
    return filterNames[filterValue];
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout>
        <Head>
          <title>Facturas Recibidas - Sistema ACA</title>
        </Head>

        
          <Header 
            title="Facturas Recibidas"
            backUrl="/"
            backLabel="Volver al Dashboard"
          />

          {/* Main content */}
          <main className="p-6">
            {/* Filters and actions */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
                <FilterSelector 
                  value={filter}
                  onChange={(e) => setFilter(e as FilterStatus)}
                  options={[
                    { value: 'todas', label: 'Todas las facturas' },
                    { value: 'enviada', label: 'Pendientes de respuesta' },
                    { value: 'aceptada', label: 'Aceptadas' },
                    { value: 'rechazada', label: 'Rechazadas' },
                    { value: 'corregida', label: 'Corregidas' }
                  ]}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Botón de métricas */}
                <Button
                  onClick={() => router.push('/cooperativa/metricas')}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm"
                >
                  📊 Ver Métricas
                </Button>
                
                {/* Toggle de vista */}
                <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                      viewMode === 'cards'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🗂️ Tarjetas
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                      viewMode === 'table'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    📊 Tabla
                  </button>
                </div>
                
                <Button
                  onClick={() => window.open('/api/invoices/export/csv', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                  rel="noopener noreferrer"
                >
                  📊 Exportar CSV
                </Button>
              </div>
            </div>

            {/* Quick stats - Now filter buttons */}
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
                onClick={() => setFilter('enviada')}
                className={`card-aca text-center transition-all cursor-pointer ${
                  filter === 'enviada' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {invoices.filter(inv => inv.status === 'enviada' || inv.status === 'corregida').length}
                </div>
                <div className="text-sm font-medium text-gray-700">Pendientes</div>
                <div className="text-xs text-orange-600 mt-1">
                  {filter === 'enviada' ? '← Filtro activo' : 'Clic para filtrar'}
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

            {/* Alerts */}
            {error && (
              <Alert 
                type='error'
                message={error}
                className='mb-6'
              />
            )}

            {/* Invoice list */}
            {loading ? (
              <div className="card-aca text-center py-12">
                <div className="spinner-aca mb-4"></div>
                <p className="text-gray-600">Cargando facturas...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="card-aca text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {filter === 'todas' ? 'No hay facturas recibidas' : `No hay facturas ${getFilterName(filter)}`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'todas' 
                    ? 'Cuando los proveedores envíen facturas, aparecerán aquí.'
                    : 'Cambie el filtro para ver facturas con otros estados.'
                  }
                </p>
                {filter !== 'todas' && (
                  <button
                    onClick={() => setFilter('todas')}
                    className="btn-aca"
                  >
                    Ver Todas las Facturas
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              // Vista de Tabla
              <InvoiceTable 
                invoices={filteredInvoices}
                variant="cooperative"
                onDownload={async (id: number) => {
                  try {
                    const { blob, filename } = await api.downloadInvoice(id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error downloading invoice:', error);
                    alert('Error al descargar la factura');
                  }
                }}
              />
            ) : (
              // Vista de Tarjetas
              <div className="space-y-4">
                <ScrollView>
                  {filteredInvoices.map((invoice) => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      onResponse={handleInvoiceResponse}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </ScrollView>
              </div>
            )}
          </main>
        
    </MainLayout>
  );
}
