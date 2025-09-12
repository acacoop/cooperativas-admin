import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
import { Cooperative } from '@/types';
import { Header } from '@/components/layout/Header';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/ui/SearchBar';
import { Alert, LoadingSpinner, ScrollView, StatsGrid } from '@/components/ui';
import { CoopCard } from '@/components/cooperatives';
import type { StatItem } from '@/components/ui';

export default function Cooperativas() {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadCooperatives();
  }, [user, router]);

  const loadCooperatives = async () => {
    try {
      const response = await api.getCooperatives();
      setCooperatives(response);
    } catch (error) {
      setError('Error al cargar cooperativas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCooperatives = cooperatives.filter(coop =>
    coop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coop.code.toString().includes(searchTerm) ||
    coop.cuit.includes(searchTerm)
  );

  // Calculate unique CAR regions
  const uniqueCarRegions = new Set(cooperatives.map(coop => coop.car)).size;

  // Statistics for StatsGrid
  const cooperativeStats: StatItem[] = [
    {
      id: "filtered",
      value: filteredCooperatives.length,
      label: "Cooperativas Mostradas",
      description: searchTerm ? "Resultado de búsqueda actual" : "Total de cooperativas visibles",
      color: "blue",
      icon: "🔍"
    },
    {
      id: "total",
      value: cooperatives.length,
      label: "Total Registradas",
      description: "Cooperativas en el sistema",
      color: "green",
      icon: "🏢"
    },
    {
      id: "regions",
      value: uniqueCarRegions,
      label: "Regiones CAR",
      description: "Regiones de cooperativas activas",
      color: "purple",
      icon: "📍"
    }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout title="Cooperativas - Sistema ACA" description="Gestión y listado de cooperativas">
        <Header 
          title="Gestión de Cooperativas"
          subtitle={`Listado Completo - ${filteredCooperatives.length} Cooperativas`}
          backUrl="/"
          backLabel="Volver al Dashboard"
        />

        {/* Contenido principal */}
        <main className="p-6">
          {/* Buscador */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, código o CUIT..."
            helpText="Puedes buscar por nombre, código de cooperativa o número de CUIT"
            icon="🔍"
          />

          {/* Estado de carga */}
          {loading ? (
            <div className="card-aca text-center py-12">
              <LoadingSpinner message='Cargando Cooperativas' />
            </div>
          ) : error ? (
            <Alert type="error" message={error} />
          ) : (
            <>
              {/* Estadísticas */}
              <StatsGrid stats={cooperativeStats} className="mb-6" centered={true}/>

              {/* Lista de cooperativas */}
              {filteredCooperatives.length === 0 ? (
                <div className="card-aca text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No se encontraron cooperativas
                  </h3>
                  <p className="text-gray-600">
                    Intenta con otros términos de búsqueda o verifica que hayas escrito correctamente.
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="btn-aca mt-4"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollView height='600px'>
                  {filteredCooperatives.map((cooperative) => (
                    <CoopCard key={cooperative.id} cooperative={cooperative} />
                  ))}
                  </ScrollView>
                </div>
              )}
            </>
          )}
        </main>
      </MainLayout>
  );
}
