import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../utils/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-aca-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Sistema de Gestión de Cooperativas - ACA</title>
        <meta name="description" content="Sistema para gestionar las 134 cooperativas de ACA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-aca-blue">
                Sistema ACA Cooperativas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenido, {user.username}
              </span>
              <span className="px-2 py-1 bg-aca-blue text-white text-xs rounded">
                {user.role === 'admin_aca' ? 'Admin ACA' : 
                 user.role === 'operador_aca' ? 'Operador ACA' : 
                 'Admin Cooperativa'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dashboard Principal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card para ver cooperativas */}
            <Link href="/cooperativas" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-aca-blue rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Cooperativas
                  </h3>
                  <p className="text-sm text-gray-500">
                    Gestionar datos de cooperativas
                  </p>
                </div>
              </div>
            </Link>

            {/* Card para cambios pendientes (solo admin ACA) */}
            {user.role === 'admin_aca' && (
              <Link href="/cambios-pendientes" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Cambios Pendientes
                    </h3>
                    <p className="text-sm text-gray-500">
                      Aprobar modificaciones
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Card para mi cooperativa (solo admin cooperativa) */}
            {user.role === 'admin_coop' && (
              <Link href={`/cooperativas/${user.cooperative_id}`} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-aca-green rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Mi Cooperativa
                    </h3>
                    <p className="text-sm text-gray-500">
                      Actualizar información
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Card para reportes */}
            <div className="card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Reportes
                  </h3>
                  <p className="text-sm text-gray-500">
                    Próximamente disponible
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <div className="text-2xl font-bold text-aca-blue">134</div>
                <div className="text-sm text-gray-500">Cooperativas Totales</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-aca-green">7</div>
                <div className="text-sm text-gray-500">Regiones (CAR)</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">Active</div>
                <div className="text-sm text-gray-500">Estado Sistema</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-orange-500">MVP</div>
                <div className="text-sm text-gray-500">Versión Actual</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
