import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
import { InvoiceFormData, InvoiceFormItem } from '@/types/forms';
import { Header } from '@/components/layout/Header';
import MainLayout from '@/components/layout/MainLayout';
import { Button, FilterSelector, InformationCard } from '@/components/ui';
import { DataEntryCard } from '@/components/ui/DataEntryCard';
import { DataEntryField } from '@/components/ui/DataEntryField';

const initialFormData: InvoiceFormData = {
  invoice_number: '',
  issue_date: '',
  issuer_cuit: '',
  receiver_cuit: '',
  subtotal: '',
  iva_amount: '',
  total_amount: '',
  items: [{ description: '', quantity: '', unit_price: '', total_price: '' }]
};

export default function NewInvoice() {
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState<number>(0); // For forcing file input reset
  const [additionalFileKey, setAdditionalFileKey] = useState<number>(0); // For forcing additional files reset
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPowerAutomate, setLoadingPowerAutomate] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [powerAutomateResponse, setPowerAutomateResponse] = useState<any>(null);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'proveedor') {
      router.push('/');
      return;
    }

    // Pre-llenar CUIT emisor si está disponible
    if (user.cuit) {
      setFormData(prev => ({
        ...prev,
        issuer_cuit: user.cuit || ''
      }));
    }
  }, [user, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calcular total si se modifican subtotal o IVA
    if (name === 'subtotal' || name === 'iva_amount') {
      const subtotal = parseFloat(name === 'subtotal' ? value : formData.subtotal) || 0;
      const iva = parseFloat(name === 'iva_amount' ? value : formData.iva_amount) || 0;
      const total = subtotal + iva;
      
      setFormData(prev => ({
        ...prev,
        total_amount: total.toFixed(2)
      }));
    }
  };

  // Handler for DataEntryField components
  const handleFieldChange = (fieldName: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceFormItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-calcular precio total del item
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(field === 'quantity' ? value : newItems[index].quantity) || 0;
      const unitPrice = parseFloat(field === 'unit_price' ? value : newItems[index].unit_price) || 0;
      newItems[index].total_price = (quantity * unitPrice).toFixed(2);
    }

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));

    // Recalcular subtotal
    const newSubtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
    const iva = parseFloat(formData.iva_amount) || 0;
    
    setFormData(prev => ({
      ...prev,
      subtotal: newSubtotal.toFixed(2),
      total_amount: (newSubtotal + iva).toFixed(2)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', unit_price: '', total_price: '' }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo no puede ser mayor a 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
    if (!e.target.files) {
      setFile(null);
    }
  };

  const handleAdditionalFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      setFile(null);
      return;
    }

    for (const file of e.target.files) {
      if (file.type !== 'application/pdf' && file.type !== 'image/png' && file.type !== 'image/jpeg') {
        setError('Solo se permiten archivos PDF, PNG y JPEG');
        return;
      }
      if (file.size > 25 * 1024 * 1024) { // 25MB
        setError('El archivo no puede ser mayor a 25MB');
        return;
      }
      setAdditionalFiles(prev => [...prev, file]);
      setError('');
    }
  };

  const deleteInvoiceFile = () => {
    setFile(null);
    setFileKey(prev => prev + 1); // Force file input reset
  };

  const deleteAllAdditionalFiles = () => {
    setAdditionalFiles([]);
    setAdditionalFileKey(prev => prev + 1); // Force additional files input reset
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!file) {
      setError('Debe seleccionar un archivo PDF');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Agregar datos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'items') {
          submitData.append('items', JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      });
      
      // Agregar archivo
      submitData.append('invoice', file);

      await api.uploadInvoice(submitData);
      
      setSuccess('Factura subida exitosamente. Ahora debe validarla antes de enviarla.');
      setTimeout(() => {
        router.push('/proveedor/facturas');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al subir factura');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPowerAutomate = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingPowerAutomate(true);
    setError('');
    setSuccess('');
    setPowerAutomateResponse(null);

    if (!file) {
      setError('Debe seleccionar un archivo PDF');
      setLoadingPowerAutomate(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('invoice', file);

      const response = await api.sendToPowerAutomate(submitData);
      
      setSuccess('Factura enviada exitosamente a Power Automate');
      setPowerAutomateResponse(response);
      console.log('Respuesta de Power Automate:', response);
      
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al enviar a Power Automate');
      console.error('Error:', error);
    } finally {
      setLoadingPowerAutomate(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout title='Nueva Factura - Proveedores' description='Sube una nueva factura al sistema'>
        <Header 
          title="Subir Nueva Factura"
          subtitle={`Proveedor: ${user.company_name || user.username}`}
          backUrl="/proveedor/facturas"
          backLabel="Volver a Mis Facturas"
        />

        {/* Contenido principal */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Alertas */}
            {error && (
              <div className="alert-aca alert-error mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert-aca alert-success mb-6">
                {success}
              </div>
            )}

            {/* Respuesta de Power Automate */}
            {powerAutomateResponse && (
              <div className="card-aca mb-6 bg-green-50 border-green-200">
                <h3 className="text-green-800 mb-3">🤖 Respuesta de Power Automate</h3>
                <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-auto">
                  {JSON.stringify(powerAutomateResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Información importante */}
            <InformationCard
              title="ℹ️ Información importante"
              items={[
                'Solo se permiten archivos PDF de hasta 10MB',
                <><strong>Power Automate:</strong> Botón morado para envío directo - solo requiere archivo PDF</>,
                <><strong>Subir Factura:</strong> Proceso tradicional - requiere todos los datos del formulario</>,
                'La factura se asignará automáticamente a la cooperativa según el CUIT receptor',
                'Una vez enviada, la cooperativa podrá aceptar o rechazar la factura'
              ]}
              variant="info"
              className="mb-6"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos básicos */}

              <DataEntryCard
                title="📝 Datos de la Factura"
                className="card-aca"
                gridCols='2'
              >
                <DataEntryField
                  label="Concepto de Factura *"
                  fieldType='input'
                  id="invoice_number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleFieldChange('invoice_number')}
                  placeholder="Concepto de la factura"
                  required
                  className='form-group-aca'
                />
                <DataEntryField
                  label="Centro o Sucursal *"
                  fieldType='input'
                  id="issue_date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleFieldChange('issue_date')}
                  placeholder="Centro o Sucursal"
                  required
                  className='form-group-aca'
                />
                <DataEntryField
                  label="Campo Opcional"
                  fieldType='input'
                  id="issuer_cuit"
                  name="issuer_cuit"
                  value={formData.issuer_cuit}
                  onChange={handleFieldChange('issuer_cuit')}
                  placeholder=""
                  className='form-group-aca'
                />
                <DataEntryField
                  label="Campo Opcional"
                  fieldType='input'
                  id="receiver_cuit"
                  name="receiver_cuit"
                  value={formData.receiver_cuit}
                  onChange={handleFieldChange('receiver_cuit')}
                  placeholder=""
                  className='form-group-aca'
                />
              </DataEntryCard>

              {/* Archivo */}
              <DataEntryCard
                title="📄 Archivo PDF de la Factura"
                className="card-aca"
              >
                {
                  file && (
                    <Button onClick={deleteInvoiceFile} className="mb-4 bg-red-600 hover:bg-red-700">
                      🗑️ Eliminar Archivo de Factura
                    </Button>
                  )
                }

                <DataEntryField
                  key={`invoice-file-${fileKey}`}
                  label="Subir Factura (PDF) *"
                  fieldType='file'
                  id="invoice_file"
                  name="invoice_file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className='form-group-aca'
                />
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✅ Archivo seleccionado: {file.name}
                  </p>
                )}
              </DataEntryCard>
              
              <DataEntryCard
                title="📎 Documentos adicionales de la Factura"
                className="card-aca"
              >
                {
                  additionalFiles.length > 0 && (
                    <Button onClick={deleteAllAdditionalFiles} className="mb-4 bg-red-600 hover:bg-red-700">
                      🗑️ Eliminar Todos los Archivos
                    </Button>
                  )
                }
                
                <DataEntryField
                  key={`additional-files-${additionalFileKey}`}
                  label="Subir Documentos Adicionales"
                  fieldType='file'
                  id="additional_documents"
                  name="additional_documents"
                  multiple
                  accept=".pdf, .png, .jpg"
                  onChange={handleAdditionalFilesChange}
                  className='form-group-aca'
                />
                {additionalFiles.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Archivos seleccionados: {additionalFiles.map(f => f.name).join(', ')}
                    </p>
                  )}
              </DataEntryCard>
              

              {/* Botones */}
              <div className="flex justify-between items-center">
                <Link href="/proveedor/facturas" className="btn-aca bg-gray-600 hover:bg-gray-700">
                  ← Cancelar
                </Link>
                
                <div className="flex gap-4">
                  {/* Botón Power Automate (solo requiere archivo) */}
                  <button
                    type="button"
                    onClick={handleSendToPowerAutomate}
                    disabled={loadingPowerAutomate || !file}
                    className="btn-aca bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    title="Enviar directamente a Power Automate (solo requiere archivo PDF)"
                  >
                    {loadingPowerAutomate ? (
                      <div className="flex items-center">
                        <div className="spinner-aca mr-2"></div>
                        Enviando a PA...
                      </div>
                    ) : (
                      '🤖 Enviar a Power Automate'
                    )}
                  </button>

                  {/* Botón subir tradicional */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-aca"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="spinner-aca mr-2"></div>
                        Subiendo...
                      </div>
                    ) : (
                      '📤 Subir Factura'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </MainLayout>
  );
}
