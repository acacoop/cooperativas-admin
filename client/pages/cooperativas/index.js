import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import { cooperativesAPI } from '../../utils/api';

export default function Cooperativas() {
  const [cooperatives, setCooperatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
      const response = await cooperativesAPI.getAll();
      setCooperatives(response.data);
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Cooperativas - Sistema ACA</title>
      </Head>

      <div className="container-aca">
        {/* Header ACA */}
        <div className="header-aca">
          <Link href="/" className="btn-back">
            ← Volver al Dashboard
          </Link>
          
          <div className="aca-brand">
            <div className="aca-logo">ACA</div>
            <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
          </div>
          <h1>Gestión de Cooperativas</h1>
          <h2>Listado Completo - {filteredCooperatives.length} Cooperativas</h2>
          
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
          {/* Buscador */}
          <div className="card-aca mb-6">
            <h3 className="mb-4">🔍 Buscar Cooperativas</h3>
            <div className="form-group-aca">
              <input
                type="text"
                placeholder="Buscar por nombre, código o CUIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              💡 Puedes buscar por nombre, código de cooperativa o número de CUIT
            </div>
          </div>

          {/* Estado de carga */}
          {loading ? (
            <div className="card-aca text-center py-12">
              <div className="spinner-aca mb-4"></div>
              <p className="text-gray-600">Cargando cooperativas...</p>
            </div>
          ) : error ? (
            <div className="alert-aca alert-error">
              {error}
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card-aca text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{filteredCooperatives.length}</div>
                  <div className="text-sm font-medium text-gray-700">Cooperativas Mostradas</div>
                </div>
                <div className="card-aca text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{cooperatives.length}</div>
                  <div className="text-sm font-medium text-gray-700">Total Registradas</div>
                </div>
                <div className="card-aca text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">7</div>
                  <div className="text-sm font-medium text-gray-700">Regiones CAR</div>
                </div>
              </div>

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
                  {filteredCooperatives.map((cooperative) => (
                    <Link 
                      key={cooperative.id}
                      href={`/cooperativas/${cooperative.id}`}
                      className="card-aca hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Nombre y estado */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {cooperative.name}
                            </h3>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              ✓ Activa
                            </span>
                          </div>

                          {/* Información principal */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center">
                              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold mr-3">
                                #{cooperative.code}
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-700">Código</div>
                                <div className="text-sm text-gray-600">{cooperative.code}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm mr-3">
                                🏢
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-700">CUIT</div>
                                <div className="text-sm text-gray-600">{cooperative.cuit}</div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm mr-3">
                                📍
                              </span>
                              <div>
                                <div className="text-sm font-medium text-gray-700">CAR</div>
                                <div className="text-sm text-gray-600">
                                  {cooperative.car_name || `Región ${cooperative.car}`}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Información adicional */}
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                              <span className="font-medium">Presidente:</span>
                              <span className="ml-1 font-semibold text-blue-600">
                                {cooperative.president || 'No especificado'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                              <span className="font-medium">Estado:</span>
                              <span className="ml-1 font-semibold text-green-600">Activa</span>
                            </div>
                          </div>
                        </div>

                        {/* Icono de flecha */}
                        <div className="ml-4 flex-shrink-0">
                          <span className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
