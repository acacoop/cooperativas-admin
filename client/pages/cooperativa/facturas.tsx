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
import { Alert, Button, CardViewToggle, FilterCard, FilterSelector, ScrollView } from '@/components/ui';
import { exportService } from '@/services/export.service';

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

  const handleExportCSV = async () => {
    try {
      const response = await exportService.exportInvoicesCSV(user?.cooperative_id!);
      const url = window.URL.createObjectURL(new Blob([response], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'facturas.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Error al exportar facturas');
      console.error('Error:', error);
    }
  };

  const handleExportJSON = async () => {
    try{
      const response = await exportService.exportInvoicesJSON(user?.cooperative_id!);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "facturas.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      setError('Error al exportar facturas');
      console.error('Error:', error);
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
                <CardViewToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1"
                />
                
                <Button
                  onClick={handleExportCSV}
                  className="bg-green-600 hover:bg-green-700 text-sm px-3 py-2"
                  rel="noopener noreferrer"
                >
                  📊 CSV
                </Button>
                <Button
                  onClick={handleExportJSON}
                  className="bg-green-600 hover:bg-green-700 text-sm px-3 py-2"
                  rel="noopener noreferrer"
                >
                  📊 JSON
                </Button>
              </div>
            </div>

            {/* Quick stats - Now filter buttons */}
            
            <FilterCard
              options={[
                {
                  id: 'todas',
                  label: 'Total Facturas',
                  value: invoices.length,
                  color: 'blue',
                  activeText: '← Filtro activo',
                  inactiveText: 'Clic para ver todas'
                },
                {
                  id: 'enviada',
                  label: 'Pendientes',
                  value: invoices.filter(inv => inv.status === 'enviada' || inv.status === 'corregida').length,
                  color: 'orange',
                  activeText: '← Filtro activo',
                  inactiveText: 'Clic para filtrar'
                },
                {
                  id: 'aceptada',
                  label: 'Aceptadas',
                  value: invoices.filter(inv => inv.status === 'aceptada').length,
                  color: 'green',
                  activeText: '← Filtro activo',
                  inactiveText: 'Clic para filtrar'
                },
                {
                  id: 'rechazada',
                  label: 'Rechazadas',
                  value: invoices.filter(inv => inv.status === 'rechazada').length,
                  color: 'red',
                  activeText: '← Filtro activo',
                  inactiveText: 'Clic para filtrar'
                }
              ]}
              activeFilter={filter}
              onFilterChange={(filterId: string) => setFilter(filterId as FilterStatus)}
            />
            
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
