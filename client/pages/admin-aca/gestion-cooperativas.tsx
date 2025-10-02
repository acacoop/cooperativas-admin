import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import api from '../../utils/api';
import { Cooperative } from '@/types';
import styles from './gestion-cooperativas.module.css';

export default function GestionCooperativas() {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filteredCoops, setFilteredCoops] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'todas' | 'activas' | 'inactivas'>('todas');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<Cooperative | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const { user, isAuthenticated } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
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
    setAdminData({
      username: `admin_${coop.code}`,
      email: coop.email || '',
      full_name: `Admin ${coop.name}`,
      password: '',
      confirmPassword: ''
    });
    setShowActivateModal(true);
    
    // Hacer scroll al modal después de que se renderice
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const handleSubmitActivation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminData.password !== adminData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (adminData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!selectedCoop) return;

    try {
      const response = await api.activateCooperative(selectedCoop.id, {
        username: adminData.username,
        email: adminData.email,
        full_name: adminData.full_name,
        password: adminData.password
      });

      if (response.success && response.data) {
        alert(`✅ Cooperativa "${selectedCoop?.name}" activada correctamente!\n\n👤 Usuario administrador creado:\n• Username: ${response.data.username}\n• Email: ${response.data.email}\n\nYa puede comenzar a usar el sistema de facturas.`);
        setShowActivateModal(false);
        setSelectedCoop(null);
        setAdminData({
          username: '',
          email: '',
          full_name: '',
          password: '',
          confirmPassword: ''
        });
        await loadCooperatives();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error activating cooperative:', error);
      const errorMessage = error.response?.data?.message || 'Error al activar cooperativa';
      alert('❌ ' + errorMessage);
    }
  };

  const getStatusBadge = (coop: Cooperative) => {
    if (coop.invoice_system_active === 1) {
      return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">✅ Activa</span>;
    }
    return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">⏸️ Inactiva</span>;
  };

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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">TOTAL COOPERATIVAS</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
                </div>
                <div className="text-4xl">🏢</div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-semibold">ACTIVAS EN SISTEMA</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">{stats.active}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">PENDIENTES DE ACTIVAR</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inactive}</p>
                </div>
                <div className="text-4xl">⏸️</div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por nombre, CUIT o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="todas">Todas las cooperativas</option>
              <option value="activas">Solo activas</option>
              <option value="inactivas">Solo inactivas</option>
            </select>
          </div>

          {/* Lista de cooperativas */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner-aca"></div>
            </div>
          ) : filteredCoops.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron cooperativas
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cooperativa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CUIT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CAR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoops.map((coop) => (
                    <tr key={coop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">{coop.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{coop.name}</div>
                        <div className="text-sm text-gray-500">{coop.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{coop.cuit}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{coop.car_name}</td>
                      <td className="px-6 py-4">{getStatusBadge(coop)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {coop.invoice_system_active === 1 ? (
                          <>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Ver detalles
                            </button>
                            <button className="text-orange-600 hover:text-orange-800 text-sm">
                              Desactivar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleActivate(coop)}
                            className="text-green-600 hover:text-green-800 text-sm font-semibold"
                          >
                            ✅ Activar Sistema
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de activación */}
      {showActivateModal && selectedCoop && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowActivateModal(false);
              setSelectedCoop(null);
            }
          }}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto my-8"
            style={{
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            <h3 className="text-2xl font-bold mb-2">Activar Cooperativa</h3>
            <p className="text-gray-600 mb-6">
              Activarás: <strong>{selectedCoop.name}</strong>
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Se creará un usuario administrador para esta cooperativa</li>
                <li>• Este usuario podrá gestionar usuarios y proveedores de su cooperativa</li>
                <li>• Enviarás las credenciales al correo de la cooperativa</li>
              </ul>
            </div>

            <form onSubmit={handleSubmitActivation}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminData.username}
                      onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="admin_cooperativa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="admin@cooperativa.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminData.full_name}
                    onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Administrador de la Cooperativa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminData.confirmPassword}
                      onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivateModal(false);
                    setSelectedCoop(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-aca bg-gradient-to-r from-green-600 to-green-700"
                >
                  ✅ Activar Cooperativa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
