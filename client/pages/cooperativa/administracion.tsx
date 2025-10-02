import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import styles from './administracion.module.css';

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
                <Link href="/cooperativa/administracion/usuarios" className={styles.menuCard}>
                  <div className={styles.menuIcon}>👥</div>
                  <h3 className={styles.menuTitle}>Gestión de Usuarios</h3>
                  <p className={styles.menuDescription}>
                    Administra los usuarios de tu cooperativa y sus roles
                  </p>
                  <div className={styles.menuAction}>
                    Ver usuarios →
                  </div>
                </Link>

                <Link href="/cooperativa/administracion/proveedores" className={styles.menuCard}>
                  <div className={styles.menuIcon}>🏢</div>
                  <h3 className={styles.menuTitle}>Gestión de Proveedores</h3>
                  <p className={styles.menuDescription}>
                    Autoriza y gestiona tus proveedores de confianza
                  </p>
                  <div className={styles.menuAction}>
                    Ver proveedores →
                  </div>
                </Link>

                <Link href="/cooperativa/administracion/configuracion" className={styles.menuCard}>
                  <div className={styles.menuIcon}>⚙️</div>
                  <h3 className={styles.menuTitle}>Configuración</h3>
                  <p className={styles.menuDescription}>
                    Ajusta los parámetros de tu cooperativa
                  </p>
                  <div className={styles.menuAction}>
                    Configurar →
                  </div>
                </Link>
              </div>

              {/* Estadísticas rápidas */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">USUARIOS ACTIVOS</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">0</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-semibold">PROVEEDORES AUTORIZADOS</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">0</p>
                    </div>
                    <div className="text-4xl">🏢</div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-semibold">INVITACIONES PENDIENTES</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">0</p>
                    </div>
                    <div className="text-4xl">📧</div>
                  </div>
                </div>
              </div>

              {/* Información importante */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  ℹ️ Información Importante
                </h3>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>• <strong>Usuarios:</strong> Puedes crear usuarios con 3 roles: Administrador, Aprobador de Facturas y Visualizador</li>
                  <li>• <strong>Proveedores:</strong> Solo los proveedores autorizados podrán enviarte facturas</li>
                  <li>• <strong>Seguridad:</strong> Verifica siempre los datos de tus proveedores antes de autorizarlos</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
