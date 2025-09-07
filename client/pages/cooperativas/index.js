import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../utils/AuthContext';
import { cooperativesAPI } from '../utils/api';

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Cooperativas - Sistema ACA</title>
      </Head>

      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-aca-blue hover:text-blue-700">
                ← Sistema ACA Cooperativas
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.username}</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Cooperativas
            </h1>
            <div className="text-sm text-gray-500">
              Total: {filteredCooperatives.length} cooperativas
            </div>
          </div>

          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, código o CUIT..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aca-blue"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredCooperatives.map((cooperative) => (
                  <li key={cooperative.id}>
                    <Link 
                      href={`/cooperativas/${cooperative.id}`}
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-aca-blue truncate">
                              {cooperative.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Activa
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="text-sm text-gray-500">
                                Código: {cooperative.code}
                              </p>
                              <p className="mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                CUIT: {cooperative.cuit}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                CAR: {cooperative.car_name || `Región ${cooperative.car}`}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <span className="mr-4">Votos: {cooperative.votes}</span>
                            <span>Suplentes: {cooperative.substitutes}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              
              {filteredCooperatives.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron cooperativas que coincidan con la búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
