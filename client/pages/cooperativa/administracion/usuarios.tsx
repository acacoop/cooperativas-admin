import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { CooperativeUser, CooperativeUserRole } from '@/types';
import styles from './usuarios.module.css';

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<CooperativeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'visualizador' as CooperativeUserRole
  });
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

    loadUsuarios();
  }, [isAuthenticated, user, router]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      // const data = await api.getCooperativeUsers();
      // setUsuarios(data);
      setUsuarios([]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar creación de usuario
      alert('Usuario invitado correctamente! (Funcionalidad en desarrollo)');
      setShowModal(false);
      setFormData({ email: '', full_name: '', role: 'visualizador' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al invitar usuario');
    }
  };

  const getRoleBadge = (role: CooperativeUserRole) => {
    const config = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-800', label: '👑 Administrador' },
      aprobador: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✅ Aprobador' },
      visualizador: { bg: 'bg-gray-100', text: 'text-gray-800', label: '👁️ Visualizador' }
    };
    const c = config[role];
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (!isAuthenticated || user?.role !== 'admin_coop') return null;

  return (
    <MainLayout
      title="Gestión de Usuarios - Cooperativa"
      description="Administra los usuarios de tu cooperativa"
    >
      <Header
        title="👥 Gestión de Usuarios"
        subtitle="Administra los usuarios y sus permisos"
        backUrl="/cooperativa/administracion"
        backLabel="Volver a Administración"
      />

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Botón de agregar */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Usuarios de la Cooperativa</h2>
              <p className="text-sm text-gray-600">Gestiona los accesos y permisos</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-aca bg-gradient-to-r from-blue-600 to-blue-700"
            >
              ➕ Invitar Usuario
            </button>
          </div>

          {/* Información sobre roles */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Roles disponibles:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Administrador:</strong> Acceso completo, puede gestionar usuarios y proveedores</li>
              <li>• <strong>Aprobador:</strong> Puede revisar y aprobar/rechazar facturas</li>
              <li>• <strong>Visualizador:</strong> Solo puede ver las facturas, sin permisos de edición</li>
            </ul>
          </div>

          {/* Lista de usuarios */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner-aca"></div>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay usuarios registrados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza invitando usuarios a tu cooperativa
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-aca"
              >
                ➕ Invitar Primer Usuario
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{usuario.full_name || usuario.username}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                      <td className="px-6 py-4">{getRoleBadge(usuario.role)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(usuario.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                        <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de invitación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Invitar Nuevo Usuario</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as CooperativeUserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="visualizador">👁️ Visualizador</option>
                    <option value="aprobador">✅ Aprobador de Facturas</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-aca"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
