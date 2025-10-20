import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { CooperativeUser, CooperativeUserRole } from '@/types';
import styles from './usuarios.module.css';
import { Button, InformationCard, GenericTable, TableColumn, TableAction, FormModal, FormField } from '@/components/ui';

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
      
      const exampleUsuarios: CooperativeUser[] = [
        {
          id: 1,
          user_id: 101,
          cooperative_id: 1,
          role: 'admin',
          username: 'admin.coop',
          email: 'admin@cooperativa.com.ar',
          full_name: 'Ana García',
          created_at: '2024-01-10T08:00:00Z',
          updated_at: '2024-10-15T12:30:00Z'
        },
        {
          id: 2,
          user_id: 102,
          cooperative_id: 1,
          role: 'aprobador',
          username: 'carlos.lopez',
          email: 'carlos.lopez@cooperativa.com.ar',
          full_name: 'Carlos López',
          created_at: '2024-02-15T10:15:00Z',
          updated_at: '2024-09-20T16:45:00Z'
        },
        {
          id: 3,
          user_id: 103,
          cooperative_id: 1,
          role: 'visualizador',
          username: 'maria.fernandez',
          email: 'maria.fernandez@cooperativa.com.ar',
          full_name: 'María Fernández',
          created_at: '2024-05-20T14:30:00Z',
          updated_at: '2024-10-01T09:20:00Z'
        }
      ];
      
      setUsuarios(exampleUsuarios);
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

  const columns: TableColumn<CooperativeUser>[] = [
    {
      key: 'full_name',
      title: 'Usuario',
      render: (value, record) => (
        <div className="font-medium text-gray-900">
          {record.full_name || record.username}
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => (
        <span className="text-gray-600">{value}</span>
      )
    },
    {
      key: 'role',
      title: 'Rol',
      render: (value) => getRoleBadge(value)
    },
    {
      key: 'created_at',
      title: 'Fecha',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('es-AR')}
        </span>
      )
    }
  ];

  const actions: TableAction<CooperativeUser>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (record) => {
        console.log('Edit user:', record);
        // TODO: Implement edit functionality
      }
    },
    {
      label: 'Eliminar',
      variant: 'danger',
      onClick: (record) => {
        console.log('Delete user:', record);
        // TODO: Implement delete functionality
      }
    }
  ];

  // Define form fields for the modal
  const formFields: FormField[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'usuario@ejemplo.com',
      required: true
    },
    {
      name: 'full_name',
      label: 'Nombre Completo',
      type: 'text',
      placeholder: 'Juan Pérez',
      required: true
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { value: 'visualizador', label: '👁️ Visualizador' },
        { value: 'aprobador', label: '✅ Aprobador de Facturas' },
        { value: 'admin', label: '👑 Administrador' }
      ]
    }
  ];

  // Handler for form data changes
  const handleFormDataChange = (data: Record<string, any>) => {
    setFormData({
      email: data.email || '',
      full_name: data.full_name || '',
      role: (data.role as CooperativeUserRole) || 'visualizador'
    });
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
            <Button
              onClick={() => setShowModal(true)}
            >
              ➕ Invitar Usuario
            </Button>
          </div>

          {/* Información sobre roles */}

          <InformationCard 
            title="Roles disponibles"
            variant="info"
            items={[
              <><strong>Administrador:</strong> Acceso completo, puede gestionar usuarios y proveedores</>,
              <><strong>Aprobador:</strong> Puede revisar y aprobar/rechazar facturas</>,
              <><strong>Visualizador:</strong> Solo puede ver las facturas, sin permisos de edición</>
            ]}
          />

          {/* Lista de usuarios */}
          <GenericTable
            columns={columns}
            data={usuarios}
            loading={loading}
            actions={actions}
            emptyState={{
              icon: '👥',
              title: 'No hay usuarios registrados',
              description: 'Comienza invitando usuarios a tu cooperativa',
              action: {
                label: '➕ Invitar Primer Usuario',
                onClick: () => setShowModal(true)
              }
            }}
          />
        </div>
      </main>

      {/* Modal de invitación */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Invitar Nuevo Usuario"
        subtitle="Completa los datos para enviar una invitación"
        fields={formFields}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmit}
        actions={[
          {
            label: 'Cancelar',
            variant: 'secondary',
            type: 'button',
            onClick: () => setShowModal(false)
          },
          {
            label: 'Enviar Invitación',
            variant: 'primary',
            type: 'submit'
          }
        ]}
        maxWidth="md"
      />
    </MainLayout>
  );
}
