import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../utils/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { CooperativeSupplier } from '@/types';
import styles from './proveedores.module.css';
import { Button, InformationCard, GenericTable, TableColumn, TableAction, LoadingSpinner, FormModal, FormField } from '@/components/ui';

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
      
      const exampleProveedores: CooperativeSupplier[] = [
        {
          id: 1,
          cooperative_id: 1,
          supplier_id: 101,
          company_name: 'Distribuidora San Martín S.A.',
          cuit: '30-12345678-9',
          email: 'contacto@distribuidorasanmartin.com.ar',
          contact_name: 'María González',
          contact_phone: '+54 11 4567-8901',
          status: 'activo',
          notes: 'Proveedor de productos alimenticios y bebidas',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-10-15T14:20:00Z'
        },
        {
          id: 2,
          cooperative_id: 1,
          supplier_id: 102,
          company_name: 'Tecnología Rural S.R.L.',
          cuit: '30-98765432-1',
          email: 'ventas@tecnologiarural.com',
          contact_name: 'Carlos Rodríguez',
          contact_phone: '+54 351 234-5678',
          status: 'inactivo',
          notes: 'Especialista en maquinaria agrícola y repuestos',
          created_at: '2024-03-20T09:15:00Z',
          updated_at: '2024-09-10T16:45:00Z'
        }
      ];
      
      setProveedores(exampleProveedores);
      // setProveedores([]);
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

  const columns: TableColumn<CooperativeSupplier>[] = [
    {
      key: 'company_name',
      title: 'Empresa',
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.company_name}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      )
    },
    {
      key: 'cuit',
      title: 'CUIT',
      render: (value) => (
        <span className="text-gray-600 font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'contact_name',
      title: 'Contacto',
      render: (value, record) => (
        <div>
          <div className="text-sm text-gray-900">{record.contact_name}</div>
          <div className="text-sm text-gray-500">{record.contact_phone}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      render: (value) => getStatusBadge(value)
    }
  ];

  const actions: TableAction<CooperativeSupplier>[] = [
    {
      label: 'Editar',
      variant: 'primary',
      onClick: (record) => {
        console.log('Edit supplier:', record);
        // TODO: Implement edit functionality
      }
    },
    {
      label: 'Suspender',
      variant: 'warning',
      onClick: (record) => {
        console.log('Suspend supplier:', record);
        // TODO: Implement suspend functionality
      }
    },
    {
      label: 'Eliminar',
      variant: 'danger',
      onClick: (record) => {
        console.log('Delete supplier:', record);
        // TODO: Implement delete functionality
      }
    }
  ];

  // Define form fields for the modal
  const formFields: FormField[] = [
    {
      name: 'company_name',
      label: 'Nombre de la Empresa',
      type: 'text',
      placeholder: 'Proveedores S.A.',
      required: true,
      colSpan: 2
    },
    {
      name: 'cuit',
      label: 'CUIT',
      type: 'text',
      placeholder: '20-12345678-9',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'contacto@proveedor.com',
      required: true
    },
    {
      name: 'contact_name',
      label: 'Nombre de Contacto',
      type: 'text',
      placeholder: 'Juan Pérez'
    },
    {
      name: 'contact_phone',
      label: 'Teléfono de Contacto',
      type: 'tel',
      placeholder: '+54 11 1234-5678'
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'textarea',
      placeholder: 'Información adicional sobre el proveedor...',
      rows: 3,
      colSpan: 2
    }
  ];

  // Handler for form data changes
  const handleFormDataChange = (data: Record<string, any>) => {
    setFormData({
      company_name: data.company_name || '',
      cuit: data.cuit || '',
      email: data.email || '',
      contact_name: data.contact_name || '',
      contact_phone: data.contact_phone || '',
      notes: data.notes || ''
    });
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
            <Button
              onClick={() => setShowModal(true)}
              className='btn-aca bg-gradient-to-r from-green-600 to-green-700'
            >
              ➕ Autorizar Proveedor
            </Button>  
          </div>

          {/* Información importante */}
          <InformationCard 
            title="⚠️ Seguridad"
            variant="warning"
            items={[
              'Verifica siempre el CUIT del proveedor antes de autorizarlo',
              'Un proveedor puede estar autorizado por múltiples cooperativas',
              'Puedes suspender temporalmente un proveedor sin eliminarlo',
              'Solo los proveedores activos podrán cargar facturas'
            ]}
          />
          {/* Lista de proveedores */}
          <GenericTable
            columns={columns}
            data={proveedores}
            loading={loading}
            actions={actions}
            emptyState={{
              icon: '🏢',
              title: 'No hay proveedores autorizados',
              description: 'Comienza autorizando proveedores para que puedan enviarte facturas',
              action: {
                label: '➕ Autorizar Primer Proveedor',
                onClick: () => setShowModal(true)
              }
            }}
          />
        </div>
      </main>

      {/* Modal de agregar proveedor */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Autorizar Nuevo Proveedor"
        subtitle="Completa los datos del proveedor para autorizarlo"
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
            label: 'Autorizar Proveedor',
            variant: 'primary',
            type: 'submit'
          }
        ]}
        maxWidth="2xl"
        gridCols={2}
      />
    </MainLayout>
  );
}
