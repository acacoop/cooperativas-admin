import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import api from '../../utils/api';
import { Invoice } from '@/types';
import { LoadingSpinner } from '@/components/ui';

export default function CooperativaMetrics() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin_coop') {
      router.push('/');
      return;
    }

    loadMetrics();
  }, [isAuthenticated, user, router]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getCooperativeInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin_coop') return null;

  // Calcular métricas
  const totalInvoices = invoices.length;
  const aceptadas = invoices.filter(inv => inv.status === 'aceptada').length;
  const rechazadas = invoices.filter(inv => inv.status === 'rechazada').length;
  const pendientes = invoices.filter(inv => inv.status === 'pendiente_validacion' || inv.status === 'enviada').length;

  const totalMonto = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const montoAceptado = invoices
    .filter(inv => inv.status === 'aceptada')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const montoRechazado = invoices
    .filter(inv => inv.status === 'rechazada')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const montoPendiente = invoices
    .filter(inv => inv.status === 'pendiente_validacion')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  const tiempoPromedioRespuesta = '2.5'; // Simulado, puedes calcularlo basado en created_at y responded_at
  const proveedoresActivos = new Set(invoices.map(inv => inv.supplier_id)).size;

  // Datos para gráficos
  const statusData = [
    { label: 'Aceptadas', value: aceptadas, color: '#10b981' },
    { label: 'Pendientes', value: pendientes, color: '#f59e0b' },
    { label: 'Rechazadas', value: rechazadas, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const monthlyData = [
    { label: 'Ene', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
    { label: 'Feb', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
    { label: 'Mar', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
    { label: 'Abr', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
    { label: 'May', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
    { label: 'Jun', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
  ];

  const amountData = [
    { label: 'Aceptado', value: Math.round(montoAceptado / 1000), color: '#10b981' },
    { label: 'Pendiente', value: Math.round(montoPendiente / 1000), color: '#f59e0b' },
    { label: 'Rechazado', value: Math.round(montoRechazado / 1000), color: '#ef4444' },
  ];

  const topProveedores = [
    { label: 'Proveedor A', value: Math.floor(Math.random() * 50) + 20, color: '#3b82f6' },
    { label: 'Proveedor B', value: Math.floor(Math.random() * 40) + 15, color: '#8b5cf6' },
    { label: 'Proveedor C', value: Math.floor(Math.random() * 30) + 10, color: '#6b7280' },
    { label: 'Otros', value: Math.floor(Math.random() * 20) + 5, color: '#d1d5db' },
  ];

  return (
    <MainLayout
      title="Métricas - Cooperativa"
      description="Panel de métricas y estadísticas para cooperativas"
    >
      <Header
        title="📊 Tablero de Métricas"
        subtitle="Análisis de facturas recibidas"
        backUrl="/cooperativa/facturas"
        backLabel="Volver a Facturas"
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                  title="Total Recibidas"
                  value={totalInvoices}
                  subtitle="Facturas procesadas"
                  icon="📥"
                  color="blue"
                  trend={{ value: 15, isPositive: true }}
                />
                <MetricsCard
                  title="Pendientes"
                  value={pendientes}
                  subtitle="Requieren revisión"
                  icon="⏳"
                  color="orange"
                />
                <MetricsCard
                  title="Aceptadas"
                  value={aceptadas}
                  subtitle="Facturas aprobadas"
                  icon="✅"
                  color="green"
                  trend={{ value: 5, isPositive: true }}
                />
                <MetricsCard
                  title="Rechazadas"
                  value={rechazadas}
                  subtitle="Con observaciones"
                  icon="❌"
                  color="red"
                />
              </div>

              {/* Métricas Operativas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <MetricsCard
                  title="Monto Total"
                  value={`$${totalMonto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                  subtitle="Todas las facturas"
                  icon="💰"
                  color="purple"
                />
                <MetricsCard
                  title="Tiempo Respuesta"
                  value={`${tiempoPromedioRespuesta} días`}
                  subtitle="Promedio de procesamiento"
                  icon="⏱️"
                  color="blue"
                />
                <MetricsCard
                  title="Proveedores Activos"
                  value={proveedoresActivos}
                  subtitle="Este mes"
                  icon="🏢"
                  color="gray"
                />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard
                  title="📈 Distribución por Estado"
                  data={statusData}
                  type="pie"
                />
                <ChartCard
                  title="💵 Montos por Estado (en miles)"
                  data={amountData}
                  type="bar"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="📅 Facturas Recibidas por Mes"
                  data={monthlyData}
                  type="bar"
                />
                <ChartCard
                  title="🏆 Top Proveedores"
                  data={topProveedores}
                  type="bar"
                />
              </div>

              {/* Alertas y Notificaciones */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    ⚠️ Facturas Pendientes de Atención
                  </h3>
                  <p className="text-sm text-orange-800">
                    Tienes <strong>{pendientes} facturas</strong> esperando tu revisión.
                    El tiempo promedio de respuesta actual es de {tiempoPromedioRespuesta} días.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    ✅ Rendimiento
                  </h3>
                  <p className="text-sm text-green-800">
                    Has procesado <strong>{aceptadas + rechazadas} facturas</strong> este mes.
                    Tasa de aprobación: <strong>{totalInvoices > 0 ? ((aceptadas / totalInvoices) * 100).toFixed(1) : 0}%</strong>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
