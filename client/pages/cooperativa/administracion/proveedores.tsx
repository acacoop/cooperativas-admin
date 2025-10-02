import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { CooperativeSupplier } from '@/types';
import styles from './proveedores.module.css';

export default function GestionProveedores() {
  const [proveedores, setProveedores] = useState<CooperativeSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    cuit: '',
    email: '',
    contact_name: '',
    contact_phone: '',
    notes: ''
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

    loadProveedores();
  }, [isAuthenticated, user, router]);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API
      // const data = await api.getCooperativeSuppliers();
      // setProveedores(data);
      setProveedores([]);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar creación de proveedor
      alert('Proveedor agregado correctamente! (Funcionalidad en desarrollo)');
      setShowModal(false);
      setFormData({
        company_name: '',
        cuit: '',
        email: '',
        contact_name: '',
        contact_phone: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Error al agregar proveedor');
    }
  };

  const getStatusBadge = (status: 'activo' | 'inactivo' | 'suspendido') => {
    const config = {
      activo: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Activo' },
      inactivo: { bg: 'bg-gray-100', text: 'text-gray-800', label: '⏸️ Inactivo' },
      suspendido: { bg: 'bg-red-100', text: 'text-red-800', label: '🚫 Suspendido' }
    };
    const c = config[status];
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (!isAuthenticated || user?.role !== 'admin_coop') return null;

  return (
    <MainLayout
      title="Gestión de Proveedores - Cooperativa"
      description="Administra los proveedores autorizados"
    >
      <Header
        title="🏢 Gestión de Proveedores"
        subtitle="Autoriza y gestiona tus proveedores de confianza"
        backUrl="/cooperativa/administracion"
        backLabel="Volver a Administración"
      />

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Botón de agregar */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Proveedores Autorizados</h2>
              <p className="text-sm text-gray-600">Solo estos proveedores podrán enviarte facturas</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-aca bg-gradient-to-r from-green-600 to-green-700"
            >
              ➕ Autorizar Proveedor
            </button>
          </div>

          {/* Información importante */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Seguridad:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Verifica siempre el CUIT del proveedor antes de autorizarlo</li>
              <li>• Un proveedor puede estar autorizado por múltiples cooperativas</li>
              <li>• Puedes suspender temporalmente un proveedor sin eliminarlo</li>
              <li>• Solo los proveedores activos podrán cargar facturas</li>
            </ul>
          </div>

          {/* Lista de proveedores */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner-aca"></div>
            </div>
          ) : proveedores.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay proveedores autorizados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza autorizando proveedores para que puedan enviarte facturas
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-aca"
              >
                ➕ Autorizar Primer Proveedor
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CUIT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proveedores.map((proveedor) => (
                    <tr key={proveedor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{proveedor.company_name}</div>
                        <div className="text-sm text-gray-500">{proveedor.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">{proveedor.cuit}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{proveedor.contact_name}</div>
                        <div className="text-sm text-gray-500">{proveedor.contact_phone}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(proveedor.status)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                        <button className="text-orange-600 hover:text-orange-800 text-sm">Suspender</button>
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

      {/* Modal de agregar proveedor */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Autorizar Nuevo Proveedor</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Proveedores S.A."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="20-12345678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="contacto@proveedor.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Información adicional sobre el proveedor..."
                  />
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
                  Autorizar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
