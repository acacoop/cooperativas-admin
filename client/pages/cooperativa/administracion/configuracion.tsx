import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';

export default function Configuracion() {
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
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin_coop') return null;

  return (
    <MainLayout
      title="Configuración - Cooperativa"
      description="Configuración de la cooperativa"
    >
      <Header
        title="⚙️ Configuración"
        subtitle="Ajusta los parámetros de tu cooperativa"
        backUrl="/cooperativa/administracion"
        backLabel="Volver a Administración"
      />

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sección en Desarrollo
            </h2>
            <p className="text-gray-600 mb-6">
              La configuración avanzada estará disponible próximamente.
            </p>
            <p className="text-sm text-gray-500">
              Aquí podrás configurar parámetros como: límites de aprobación, notificaciones,
              preferencias de visualización y más.
            </p>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
