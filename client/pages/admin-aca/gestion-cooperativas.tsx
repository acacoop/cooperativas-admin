import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import api from '../../utils/api';
import { Cooperative } from '@/types';
import styles from './gestion-cooperativas.module.css';
import { ScrollView, SearchBar, FilterSelector, ActivationModal, DataTable, StatusBadge } from '@/components/ui';
import { StatsCard } from '@/components/ui/StatsCard';
import { CooperativeNameCell, CooperativeActions } from '@/components/cooperatives';
import type { AdminData, Column } from '@/components/ui';

export default function GestionCooperativas() {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filteredCoops, setFilteredCoops] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'todas' | 'activas' | 'inactivas'>('todas');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<Cooperative | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [activationLoading, setActivationLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin_aca') {
      router.push('/');
      return;
    }

    loadCooperatives();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    filterCooperatives();
  }, [searchTerm, filter, cooperatives]);

  const loadCooperatives = async () => {
    try {
      setLoading(true);
      const [coopsData, statsData] = await Promise.all([
        api.getCooperatives(),
        api.getCooperativeStats()
      ]);
      setCooperatives(coopsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading cooperatives:', error);
      alert('Error al cargar cooperativas');
    } finally {
      setLoading(false);
    }
  };

  const filterCooperatives = () => {
    let filtered = cooperatives;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(coop =>
        coop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coop.cuit.includes(searchTerm) ||
        coop.code.toString().includes(searchTerm)
      );
    }

    // Filtrar por estado
    if (filter === 'activas') {
      filtered = filtered.filter(coop => coop.invoice_system_active === 1);
    } else if (filter === 'inactivas') {
      filtered = filtered.filter(coop => !coop.invoice_system_active || coop.invoice_system_active === 0);
    }

    setFilteredCoops(filtered);
  };

  const handleActivate = (coop: Cooperative) => {
    setSelectedCoop(coop);
    setShowActivateModal(true);
  };

  const handleSubmitActivation = async (adminData: AdminData) => {
    if (!selectedCoop) return;

    setActivationLoading(true);
    try {
      const response = await api.activateCooperative(selectedCoop.id, {
        username: adminData.username,
        email: adminData.email,
        full_name: adminData.full_name,
        password: adminData.password
      });

      if (response.success && response.data) {
        alert(`✅ Cooperativa "${selectedCoop?.name}" activada correctamente!\n\n👤 Usuario administrador creado:\n• Username: ${response.data.username}\n• Email: ${response.data.email}\n\nYa puede comenzar a usar el sistema de facturas.`);
        handleCloseModal();
        await loadCooperatives();
      } else {
        throw new Error(response.message || 'Error al activar cooperativa');
      }
    } catch (error: any) {
      console.error('Error activating cooperative:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al activar cooperativa';
      alert('❌ ' + errorMessage);
      throw error; // Re-throw to let ActivationModal handle UI state
    } finally {
      setActivationLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowActivateModal(false);
    setSelectedCoop(null);
  };

  const getStatusBadge = (coop: Cooperative) => {
    if (coop.invoice_system_active === 1) {
      return <StatusBadge variant="active">✅ Activa</StatusBadge>;
    }
    return <StatusBadge variant="inactive">⏸️ Inactiva</StatusBadge>;
  };

  // Define table columns
  const columns: Column<Cooperative>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (coop) => (
        <span className="font-mono text-sm text-gray-900">{coop.code}</span>
      )
    },
    {
      key: 'name',
      header: 'Cooperativa',
      render: (coop) => <CooperativeNameCell cooperative={coop} />
    },
    {
      key: 'cuit',
      header: 'CUIT',
      render: (coop) => (
        <span className="font-mono text-sm text-gray-600">{coop.cuit}</span>
      )
    },
    {
      key: 'car_name',
      header: 'CAR',
      render: (coop) => (
        <span className="text-sm text-gray-600">{coop.car_name}</span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (coop) => getStatusBadge(coop)
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (coop) => (
        <CooperativeActions
          cooperative={coop}
          onActivate={handleActivate}
        />
      )
    }
  ];

  if (!isAuthenticated || user?.role !== 'admin_aca') return null;

  return (
    <MainLayout
      title="Gestión de Cooperativas - Admin ACA"
      description="Activa y gestiona cooperativas en el sistema de facturas"
    >
      <Header
        title="🏢 Gestión de Cooperativas"
        subtitle="Activa cooperativas para el sistema de facturas"
        backUrl="/"
        backLabel="Volver al Dashboard"
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatsCard 
              stat={{
                id: 'total',
                value: stats.total,
                label: 'TOTAL COOPERATIVAS',
                color: 'blue',
                icon: '🏢'
              }}
              layout="split"
            />

            <StatsCard 
              stat={{
                id: 'active',
                value: stats.active,
                label: 'ACTIVAS EN SISTEMA',
                color: 'green',
                icon: '✅'
              }}
              layout="split"
            />

            <StatsCard 
              stat={{
                id: 'inactive',
                value: stats.inactive,
                label: 'PENDIENTES DE ACTIVAR',
                color: 'gray',
                icon: '⏸️'
              }}
              layout="split"
            />
          </div>

          {/* Filtros y búsqueda */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder='Buscar por nombre, CUIT o código...'
              compact={true}
              className="flex-1"
            />
            <FilterSelector
              value={filter}
              onChange={(value) => setFilter(value as 'todas' | 'activas' | 'inactivas')}
              options={[
                { value: 'todas', label: 'Todas las cooperativas' },
                { value: 'activas', label: 'Solo activas' },
                { value: 'inactivas', label: 'Solo inactivas' }
              ]}
            />
          </div>

          {/* Lista de cooperativas */}
          <DataTable
            data={filteredCoops}
            columns={columns}
            loading={loading}
            keyExtractor={(coop) => coop.id}
            emptyState={
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No se encontraron cooperativas
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </>
            }
          />
        </div>
      </main>

      {/* Modal de activación */}
      <ActivationModal
        isOpen={showActivateModal}
        onClose={handleCloseModal}
        cooperative={selectedCoop}
        onSubmit={handleSubmitActivation}
        loading={activationLoading}
      />
    </MainLayout>
  );
}
