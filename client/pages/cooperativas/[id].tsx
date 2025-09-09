import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
import { Cooperative } from '@/types';

type Tab = 'general' | 'contact' | 'management' | 'stats';

interface TabDefinition {
  id: Tab;
  name: string;
  icon: string;
}

export default function CooperativeDetail() {
  const [cooperative, setCooperative] = useState<Cooperative | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  const { user, logout } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (id) {
      loadCooperative();
    }
  }, [user, router, id]);

  const loadCooperative = async () => {
    try {
      if (typeof id !== 'string') return;
      const response = await api.getCooperative(parseInt(id));
      setCooperative(response);
    } catch (error) {
      setError('Error al cargar la cooperativa');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-aca text-center py-12">
          <div className="spinner-aca mb-4"></div>
          <p className="text-gray-600">Cargando información de la cooperativa...</p>
        </div>
      </div>
    );
  }

  if (error || !cooperative) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Error - Sistema ACA</title>
        </Head>
        <div className="container-aca">
          <div className="header-aca">
            <Link href="/cooperativas" className="btn-back">
              ← Volver a Cooperativas
            </Link>
            <div className="aca-brand">
              <div className="aca-logo">ACA</div>
              <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
            </div>
            <h1>Error al cargar cooperativa</h1>
          </div>
          <main className="p-6">
            <div className="alert-aca alert-error">
              {error || 'Cooperativa no encontrada'}
            </div>
            <Link href="/cooperativas" className="btn-aca mt-4">
              Volver al listado
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const tabs: TabDefinition[] = [
    { id: 'general', name: 'Información General', icon: '📋' },
    { id: 'contact', name: 'Contacto', icon: '📞' },
    { id: 'management', name: 'Dirigentes', icon: '👥' },
    { id: 'stats', name: 'Estadísticas', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{cooperative.name} - Sistema ACA</title>
      </Head>

      <div className="container-aca">
        {/* Header ACA */}
        <div className="header-aca">
          <Link href="/cooperativas" className="btn-back">
            ← Volver a Cooperativas
          </Link>
          
          <div className="aca-brand">
            <div className="aca-logo">ACA</div>
            <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
          </div>
          
          <h1>{cooperative.name}</h1>
          <h2>Código #{cooperative.code} • {cooperative.car_name || `Región CAR ${cooperative.car}`}</h2>
          
          {/* Información del usuario */}
          <div className="absolute top-4 right-4 flex items-center space-x-4 text-white">
            <span className="text-sm">{user.username}</span>
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
          {/* Estado y acciones rápidas */}
          <div className="card-aca mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  ✓ Cooperativa Activa
                </span>
                <div className="text-sm text-gray-600">
                  CUIT: <span className="font-semibold">{cooperative.cuit}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="btn-aca">
                  📝 Editar
                </button>
                <button className="btn-aca bg-blue-600 hover:bg-blue-700">
                  📄 Generar Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon} {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido de tabs */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="card-aca">
                <h3 className="mb-6">📋 Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Identificación</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Código</label>
                      <p className="text-lg font-semibold text-blue-600">#{cooperative.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">CUIT</label>
                      <p className="font-mono text-gray-900">{cooperative.cuit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Razón Social</label>
                      <p className="font-semibold text-gray-900">{cooperative.name}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Ubicación</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Región CAR</label>
                      <p className="text-lg font-semibold text-purple-600">
                        {cooperative.car_name || `Región ${cooperative.car}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Provincia</label>
                      <p className="text-gray-900">{cooperative.province || 'No especificada'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Localidad</label>
                      <p className="text-gray-900">{cooperative.city || 'No especificada'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Estado</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Situación</label>
                      <p className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        ✓ Activa
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Inscripción</label>
                      <p className="text-gray-900">{cooperative.registration_date || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Matrícula</label>
                      <p className="font-mono text-gray-900">{cooperative.license_number || 'No disponible'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presidente */}
              <div className="card-aca">
                <h3 className="mb-4">👤 Presidente Actual</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {cooperative.president ? cooperative.president.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-blue-900">
                        {cooperative.president || 'No especificado'}
                      </h4>
                      <p className="text-blue-700">Presidente de la Cooperativa</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Período actual • En ejercicio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="card-aca">
                <h3 className="mb-6">📞 Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Contacto Principal</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-gray-900 font-mono">{cooperative.phone || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-blue-600">{cooperative.email || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sitio Web</label>
                      <p className="text-blue-600">{cooperative.website || 'No disponible'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 border-b pb-2">Dirección</h4>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dirección</label>
                      <p className="text-gray-900">{cooperative.address || 'No disponible'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Código Postal</label>
                      <p className="text-gray-900">{cooperative.postal_code || 'No disponible'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'management' && (
            <div className="space-y-6">
              <div className="card-aca">
                <h3 className="mb-6">👥 Consejo de Administración</h3>
                
                {/* Presidente */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        P
                      </span>
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          {cooperative.president || 'No especificado'}
                        </h4>
                        <p className="text-sm text-blue-700">Presidente</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      En ejercicio
                    </span>
                  </div>
                </div>

                {/* Otros cargos */}
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          V
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-700">No especificado</h4>
                          <p className="text-sm text-gray-600">Vicepresidente</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        Pendiente
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          S
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-700">No especificado</h4>
                          <p className="text-sm text-gray-600">Secretario</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        Pendiente
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                          T
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-700">No especificado</h4>
                          <p className="text-sm text-gray-600">Tesorero</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        Pendiente
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800">Información incompleta</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Solo se tiene información del presidente. Los demás cargos del consejo de administración 
                        deben ser actualizados en el sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card-aca text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
                  <div className="text-sm font-medium text-gray-700">Socios Activos</div>
                  <div className="text-xs text-gray-500 mt-1">Dato no disponible</div>
                </div>
                
                <div className="card-aca text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">-</div>
                  <div className="text-sm font-medium text-gray-700">Capital Social</div>
                  <div className="text-xs text-gray-500 mt-1">Dato no disponible</div>
                </div>
                
                <div className="card-aca text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">-</div>
                  <div className="text-sm font-medium text-gray-700">Ejercicios</div>
                  <div className="text-xs text-gray-500 mt-1">Dato no disponible</div>
                </div>
                
                <div className="card-aca text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">✓</div>
                  <div className="text-sm font-medium text-gray-700">Estado</div>
                  <div className="text-xs text-green-600 mt-1 font-semibold">Activa</div>
                </div>
              </div>

              <div className="card-aca">
                <h3 className="mb-4">📊 Información Estadística</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h4 className="font-semibold text-gray-700 mb-2">Estadísticas en desarrollo</h4>
                  <p className="text-gray-600 text-sm">
                    Esta sección mostrará estadísticas detalladas de la cooperativa una vez que 
                    se integren los datos financieros y operativos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
