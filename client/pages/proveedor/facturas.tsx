import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
import { Invoice, InvoiceStatus } from '@/types';
import { Header } from '@/components/layout/Header';
import MainLayout from '@/components/layout/MainLayout';
import FilterCard, { FilterOption } from '@/components/ui/FilterCard';
import ScrollView from '@/components/ui/ScrollView';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { Alert, LoadingSpinner } from '@/components/ui';

type FilterStatus = InvoiceStatus | 'todas';
type ViewMode = 'cards' | 'table';

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
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
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

  // Filter options configuration
  const filterOptions: FilterOption[] = [
    {
      id: 'todas',
      label: 'Total Facturas',
      value: invoices.length,
      color: 'blue',
      inactiveText: 'Clic para ver todas'
    },
    {
      id: 'pendiente_validacion',
      label: 'Pendientes',
      value: invoices.filter(inv => inv.status === 'pendiente_validacion').length,
      color: 'yellow'
    },
    {
      id: 'aceptada',
      label: 'Aceptadas',
      value: invoices.filter(inv => inv.status === 'aceptada').length,
      color: 'green'
    },
    {
      id: 'rechazada',
      label: 'Rechazadas',
      value: invoices.filter(inv => inv.status === 'rechazada').length,
      color: 'red'
    }
  ];

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

  // Status badge component for InvoiceCard
  const getStatusBadge = (status: string) => {
    const invoiceStatus = status as InvoiceStatus;
    const statusConfig: Record<InvoiceStatus, StatusConfig> = {
      'pendiente_validacion': { color: 'yellow', text: '⏳ Pendiente Validación', desc: 'Revisar y enviar' },
      'enviada': { color: 'blue', text: '📤 Enviada', desc: 'Esperando respuesta cooperativa' },
      'aceptada': { color: 'green', text: '✅ Aceptada', desc: 'Aprobada por cooperativa' },
      'rechazada': { color: 'red', text: '❌ Rechazada', desc: 'Necesita corrección' },
      'corregida': { color: 'purple', text: '🔄 Corregida', desc: 'Reenviada tras corrección' }
    };

    const config = statusConfig[invoiceStatus] || { color: 'gray', text: status, desc: '' };
    
    return (
      <div className="flex flex-col">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
          {config.text}
        </span>
        <span className="text-xs text-gray-500 mt-1">{config.desc}</span>
      </div>
    );
  };

  // Actions component for supplier invoices
  const getInvoiceActions = (invoice: Invoice) => (
    <div className="flex items-center space-x-3">
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
  );

  const handleDownload = async (id: number) => {
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
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout title='Gestión de Facturas - Proveedor' description='Página de gestión de facturas para proveedores'>
      
        <Header 
          title="Gestión de Facturas"
          subtitle={`Proveedor: ${user.company_name || user.username}`}
          backUrl="/"
          backLabel="Volver al Dashboard"
        />

        {/* Contenido principal */}
        <main className="p-6">
          {/* Barra de acciones superior */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              <Link href="/proveedor/nueva-factura" className="btn-aca">
                ➕ Subir Nueva Factura
              </Link>
              
              <Link 
                href="/proveedor/metricas" 
                className="btn-aca bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                📊 Ver Métricas
              </Link>
            </div>
            
            {/* Toggle de vista */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🗂️ Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Tabla
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas - Ahora son botones de filtro */}
          <FilterCard 
            options={filterOptions}
            activeFilter={filter}
            onFilterChange={(filterId) => setFilter(filterId as FilterStatus)}
            className="mb-6"
          />

          {/* Lista de facturas */}
          {loading ? (
            <LoadingSpinner message='Cargando facturas...' />
          ) : error ? (
            <Alert type='error' message={error} />
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
          ) : viewMode === 'table' ? (
            // Vista de Tabla
            <InvoiceTable 
              invoices={filteredInvoices}
              variant="supplier"
              onDownload={handleDownload}
            />
          ) : (
            // Vista de Tarjetas
            <ScrollView height="600px">
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    variant="supplier"
                    getStatusBadge={getStatusBadge}
                    actions={getInvoiceActions(invoice)}
                  />
                ))}
              </div>
            </ScrollView>
          )}
        </main>
      </MainLayout>
  );
}
