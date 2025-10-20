import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import styles from './administracion.module.css';
import MenuCard from '@/components/ui/MenuCard';
import { InformationCard, StatsCard } from '@/components/ui';
import { Stats } from 'fs';

type AdminTab = 'overview' | 'usuarios' | 'proveedores' | 'configuracion';

export default function Administracion() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
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
      title="Administración - Cooperativa"
      description="Panel de administración de la cooperativa"
    >
      <Header
        title="⚙️ Administración de Cooperativa"
        subtitle="Gestiona usuarios, proveedores y configuración"
        backUrl="/"
        backLabel="Volver al Dashboard"
      />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Overview con cards de acceso rápido */}
          {activeTab === 'overview' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Panel de Administración
                </h2>
                <p className="text-gray-600">
                  Gestiona todos los aspectos de tu cooperativa desde un solo lugar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MenuCard 
                  icon='👥'
                  title='Gestión de Usuarios'
                  subtitle='Administra los usuarios de tu cooperativa y sus roles'
                  footerText='Ver usuarios →'
                  href='/cooperativa/administracion/usuarios'
                  className={styles.menuCard}
                />

                <MenuCard 
                  icon='🏢'
                  title='Gestión de Proveedores'
                  subtitle='Autoriza y gestiona tus proveedores de confianza'
                  footerText='Ver proveedores →'
                  href='/cooperativa/administracion/proveedores'
                  className={styles.menuCard}
                />

                <MenuCard 
                  icon='⚙️'
                  title='Configuración'
                  subtitle='Ajusta los parámetros de tu cooperativa'
                  footerText='Configurar →'
                  href='/cooperativa/administracion/configuracion'
                  className={styles.menuCard}
                />
              </div>

              {/* Estadísticas rápidas */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                  stat={{
                    id: 'active_users',
                    value: 0,
                    label: 'USUARIOS ACTIVOS',
                    color: 'blue',
                    icon: '👥'
                  }}
                  layout="split"
                />
                <StatsCard 
                  stat={{
                    id: 'authorized_suppliers',
                    value: 0,
                    label: 'PROVEEDORES AUTORIZADOS',
                    color: 'green',
                    icon: '🏢'
                  }}
                  layout="split"
                />

                <StatsCard 
                  stat={{
                    id: 'pending_invitations',
                    value: 0,
                    label: 'INVITACIONES PENDIENTES',
                    color: 'purple',
                    icon: '📧'
                  }}
                  layout="split"
                />
              </div>

              {/* Información importante */}
              <InformationCard 
                items={[
                  <><strong>Usuarios:</strong> Puedes crear usuarios con 3 roles: Administrador, Aprobador de Facturas y Visualizador</>,
                  <><strong>Proveedores:</strong> Solo los proveedores autorizados podrán enviarte facturas</>, 
                  <><strong>Seguridad:</strong> Verifica siempre los datos de tus proveedores antes de autorizarlos</>
                ]}
                variant='warning'
                className="mt-8"
              />
            </>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
