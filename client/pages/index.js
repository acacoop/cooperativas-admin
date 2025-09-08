import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../utils/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-aca"></div>
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

      <div className="container-aca">
        {/* Header ACA */}
        <div className="header-aca">
          <div className="aca-brand">
            <div className="aca-logo">ACA</div>
            <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
          </div>
          <h1>Sistema de Gestión de Cooperativas</h1>
          <h2>Dashboard Principal</h2>
          
          {/* Información del usuario */}
          <div className="absolute top-4 right-4 flex items-center space-x-4 text-white">
            <span className="text-sm">
              Bienvenido, <strong>{user.username}</strong>
            </span>
            <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
              {user.role === 'admin_aca' ? 'Admin ACA' : 
               user.role === 'operador_aca' ? 'Operador ACA' : 
               user.role === 'admin_coop' ? 'Admin Cooperativa' :
               user.role === 'proveedor' ? 'Proveedor' : 'Usuario'}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-orange-200 hover:text-white transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <main className="p-6">
          {/* Cards de acciones principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* CARDS PARA PROVEEDORES */}
            {user.role === 'proveedor' && (
              <>
                {/* Card para subir facturas */}
                <Link href="/proveedor/facturas" className="card-aca group cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      📄
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        Mis Facturas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Subir y gestionar facturas
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Enviar a cooperativas
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Card para nueva factura */}
                <Link href="/proveedor/nueva-factura" className="card-aca group cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      ➕
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Nueva Factura
                      </h3>
                      <p className="text-sm text-gray-600">
                        Subir nueva factura
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Proceso rápido
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Card para estadísticas */}
                <div className="card-aca">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      📊
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Estadísticas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Resumen de facturas
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Métricas en tiempo real
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CARDS PARA ADMIN COOPERATIVA */}
            {user.role === 'admin_coop' && (
              <>
                {/* Card para facturas recibidas */}
                <Link href="/cooperativa/facturas" className="card-aca group cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      📨
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        Facturas Recibidas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Revisar y aprobar facturas
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Gestión de proveedores
                      </p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {/* CARDS PARA TODOS LOS ROLES (ADMIN ACA, OPERADOR) - NO ADMIN COOP */}
            {(user.role === 'admin_aca' || user.role === 'operador_aca') && (
              <>
                {/* Card para ver cooperativas */}
                <Link href="/cooperativas" className="card-aca group cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                      🏢
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Cooperativas
                      </h3>
                      <p className="text-sm text-gray-600">
                        Gestionar datos de cooperativas
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        134 cooperativas registradas
                      </p>
                    </div>
                  </div>
                </Link>
              </>
            )}

            {/* Card para cambios pendientes (solo admin ACA) */}
            {user.role === 'admin_aca' && (
              <Link href="/cambios-pendientes" className="card-aca group cursor-pointer">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl">
                    ⏰
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Cambios Pendientes
                    </h3>
                    <p className="text-sm text-gray-600">
                      Aprobar modificaciones
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Revisión requerida
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Card para mi cooperativa (solo admin cooperativa) */}
            {user.role === 'admin_coop' && (
              <Link href={`/cooperativas/${user.cooperative_id}`} className="card-aca group cursor-pointer">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    👤
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      Mi Cooperativa
                    </h3>
                    <p className="text-sm text-gray-600">
                      Actualizar información
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Acceso directo
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Card para configuración (solo admin ACA) */}
            {user.role === 'admin_aca' && (
              <div className="card-aca opacity-75">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    ⚙️
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Configuración
                    </h3>
                    <p className="text-sm text-gray-600">
                      Gestión del sistema
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Próximamente disponible
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas rápidas */}
          <div className="card-aca">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              📈 Información General del Sistema
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">134</div>
                <div className="text-sm font-medium text-blue-800">Cooperativas</div>
                <div className="text-xs text-blue-600">Total registradas</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">7</div>
                <div className="text-sm font-medium text-green-800">Regiones CAR</div>
                <div className="text-xs text-green-600">Centros de distribución</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-2">📄</div>
                <div className="text-sm font-medium text-orange-800">Sistema de Facturas</div>
                <div className="text-xs text-orange-600">Gestión activa y operativa</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">BETA</div>
                <div className="text-sm font-medium text-purple-800">Versión Actual</div>
                <div className="text-xs text-purple-600">En fase de pruebas</div>
              </div>
            </div>
          </div>

          {/* Información adicional para diferentes roles */}
          {user.role === 'admin_aca' && (
            <div className="alert-aca alert-info mt-6">
              <strong>👑 Administrador ACA:</strong> Tienes acceso completo al sistema. 
              Puedes gestionar todas las cooperativas, aprobar cambios y administrar usuarios.
            </div>
          )}

          {user.role === 'operador_aca' && (
            <div className="alert-aca alert-info mt-6">
              <strong>🔧 Operador ACA:</strong> Puedes consultar información de cooperativas 
              y asistir en tareas operativas del sistema.
            </div>
          )}

          {user.role === 'admin_coop' && (
            <div className="alert-aca alert-success mt-6">
              <strong>🏢 Administrador de Cooperativa:</strong> Puedes actualizar la información 
              de tu cooperativa. Los cambios serán revisados por ACA antes de ser aplicados.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
