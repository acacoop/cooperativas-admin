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
import { Alert, Button, LoadingSpinner, Modal, CardViewToggle } from '@/components/ui';
import type { ViewMode } from '@/components/ui';

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
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
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
      {invoice.status === 'rechazada' && invoice.id && (
        <Link 
          href={`/proveedor/facturas/${invoice.id}/corregir`}
          className="btn-aca text-sm bg-orange-600 hover:bg-orange-700"
        >
          🔄 Corregir y Reenviar
        </Link>
      )}

      {invoice.id && (
        <Button
          onClick={handleDownload.bind(null, invoice.id)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          📥 Descargar PDF
        </Button>
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
      setErrorMessage('No se pudo descargar la factura. Por favor, inténtelo de nuevo más tarde.');
      setShowErrorModal(true);
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
              <Button
                onClick={() => router.push('/proveedor/nueva-factura')}
              >
                ➕ Subir Nueva Factura
              </Button>
              <Button
                onClick={() => router.push('/proveedor/metricas')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                📊 Ver Métricas
              </Button>
            </div>
            
            {/* Toggle de vista */}
            <CardViewToggle 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
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

        {/* Error Modal */}
        <Modal
          isOpen={showErrorModal}
          title="Error de Descarga"
          subtitle={errorMessage}
          onClose={() => setShowErrorModal(false)}
          maxWidth="md"
        >
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowErrorModal(false)}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Cerrar
            </Button>
          </div>
        </Modal>
      </MainLayout>
  );
}
