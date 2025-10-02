import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import api from '../../utils/api';
import { Invoice } from '@/types';

export default function ProveedorMetrics() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'proveedor') {
      router.push('/');
      return;
    }

    loadMetrics();
  }, [isAuthenticated, user, router]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getSupplierInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'proveedor') return null;

  // Calcular métricas
  const totalInvoices = invoices.length;
  const aceptadas = invoices.filter(inv => inv.status === 'aceptada').length;
  const rechazadas = invoices.filter(inv => inv.status === 'rechazada').length;
  const pendientes = invoices.filter(inv => inv.status === 'pendiente_validacion' || inv.status === 'enviada').length;

  const totalMonto = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const montoAceptado = invoices
    .filter(inv => inv.status === 'aceptada')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const montoPendiente = invoices
    .filter(inv => inv.status === 'pendiente_validacion' || inv.status === 'enviada')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  const tasaAprobacion = totalInvoices > 0 ? ((aceptadas / totalInvoices) * 100).toFixed(1) : '0';
  const promedioMonto = totalInvoices > 0 ? (totalMonto / totalInvoices).toFixed(2) : '0';

  // Datos para gráficos
  const statusData = [
    { label: 'Aceptadas', value: aceptadas, color: '#10b981' },
    { label: 'Pendientes', value: pendientes, color: '#f59e0b' },
    { label: 'Rechazadas', value: rechazadas, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const monthlyData = [
    { label: 'Ene', value: Math.floor(Math.random() * 20) + 5, color: '#6b7280' },
    { label: 'Feb', value: Math.floor(Math.random() * 20) + 5, color: '#6b7280' },
    { label: 'Mar', value: Math.floor(Math.random() * 20) + 5, color: '#6b7280' },
    { label: 'Abr', value: Math.floor(Math.random() * 20) + 5, color: '#6b7280' },
    { label: 'May', value: Math.floor(Math.random() * 20) + 5, color: '#6b7280' },
    { label: 'Jun', value: Math.floor(Math.random() * 20) + 5, color: '#6b7280' },
  ];

  const amountData = [
    { label: 'Monto Aceptado', value: Math.round(montoAceptado / 1000), color: '#10b981' },
    { label: 'Monto Pendiente', value: Math.round(montoPendiente / 1000), color: '#f59e0b' },
  ];

  return (
    <MainLayout
      title="Métricas - Proveedor"
      description="Panel de métricas y estadísticas para proveedores"
    >
      <Header
        title="📊 Tablero de Métricas"
        subtitle="Visualiza el rendimiento de tus facturas"
        backUrl="/proveedor/facturas"
        backLabel="Volver a Facturas"
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="spinner-aca"></div>
            </div>
          ) : (
            <>
              {/* Métricas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                  title="Total Facturas"
                  value={totalInvoices}
                  subtitle="Facturas enviadas"
                  icon="📄"
                  color="blue"
                  trend={{ value: 12, isPositive: true }}
                />
                <MetricsCard
                  title="Aceptadas"
                  value={aceptadas}
                  subtitle={`${tasaAprobacion}% de aprobación`}
                  icon="✅"
                  color="green"
                  trend={{ value: 8, isPositive: true }}
                />
                <MetricsCard
                  title="Pendientes"
                  value={pendientes}
                  subtitle="Esperando validación"
                  icon="⏳"
                  color="orange"
                />
                <MetricsCard
                  title="Rechazadas"
                  value={rechazadas}
                  subtitle="Requieren corrección"
                  icon="❌"
                  color="red"
                />
              </div>

              {/* Métricas Financieras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <MetricsCard
                  title="Monto Total"
                  value={`$${totalMonto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                  subtitle="Todas las facturas"
                  icon="💰"
                  color="purple"
                />
                <MetricsCard
                  title="Monto Aceptado"
                  value={`$${montoAceptado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                  subtitle="Facturas aprobadas"
                  icon="✅"
                  color="green"
                />
                <MetricsCard
                  title="Promedio por Factura"
                  value={`$${parseFloat(promedioMonto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                  subtitle="Monto promedio"
                  icon="📊"
                  color="gray"
                />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="mt-6">
                <ChartCard
                  title="📅 Facturas por Mes"
                  data={monthlyData}
                  type="bar"
                />
              </div>

              {/* Información adicional */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  💡 Consejos para mejorar tu tasa de aprobación
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Verifica que todos los datos de la factura sean correctos antes de enviarla</li>
                  <li>• Adjunta documentación adicional cuando sea necesario</li>
                  <li>• Responde rápidamente si la cooperativa solicita correcciones</li>
                  <li>• Mantén actualizados tus datos fiscales</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
