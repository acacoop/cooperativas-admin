import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import api from '../../utils/api';
import { InvoiceFormData, InvoiceFormItem } from '@/types/forms';
import { Header } from '@/components/layout/Header';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Nueva Factura - Sistema ACA</title>
      </Head>

      <div className="container-aca">
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

            {/* Información importante */}
            <div className="card-aca mb-6 bg-blue-50 border-blue-200">
              <h3 className="text-blue-800 mb-3">ℹ️ Información importante</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Solo se permiten archivos PDF de hasta 10MB</li>
                <li>• La factura se asignará automáticamente a la cooperativa según el CUIT receptor</li>
                <li>• Después de subir, deberá validar los datos antes de enviarla</li>
                <li>• Una vez enviada, la cooperativa podrá aceptar o rechazar la factura</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos básicos */}
              <div className="card-aca">
                <h3 className="mb-4">📄 Datos de la Factura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group-aca">
                    <label htmlFor="invoice_number">Número de Factura *</label>
                    <input
                      id="invoice_number"
                      name="invoice_number"
                      type="text"
                      required
                      placeholder="ej: 0001-00000123"
                      value={formData.invoice_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group-aca">
                    <label htmlFor="issue_date">Fecha de Emisión *</label>
                    <input
                      id="issue_date"
                      name="issue_date"
                      type="date"
                      required
                      value={formData.issue_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group-aca">
                    <label htmlFor="issuer_cuit">CUIT Emisor (Su CUIT) *</label>
                    <input
                      id="issuer_cuit"
                      name="issuer_cuit"
                      type="text"
                      required
                      placeholder="20-12345678-9"
                      value={formData.issuer_cuit}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group-aca">
                    <label htmlFor="receiver_cuit">CUIT Receptor (Cooperativa) *</label>
                    <input
                      id="receiver_cuit"
                      name="receiver_cuit"
                      type="text"
                      required
                      placeholder="30-12345678-9"
                      value={formData.receiver_cuit}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="card-aca">
                <div className="flex items-center justify-between mb-4">
                  <h3>🛒 Items de la Factura</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-aca text-sm"
                  >
                    ➕ Agregar Item
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">Item #{index + 1}</h4>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-600">Descripción</label>
                          <input
                            type="text"
                            placeholder="Descripción del producto/servicio"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600">Cantidad</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600">Precio Unitario</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 text-right">
                        <span className="text-sm font-medium text-gray-600">Total: </span>
                        <span className="font-semibold text-green-600">
                          ${parseFloat(item.total_price || '0').toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="card-aca">
                <h3 className="mb-4">💰 Totales de la Factura</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group-aca">
                    <label htmlFor="subtotal">Subtotal</label>
                    <input
                      id="subtotal"
                      name="subtotal"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.subtotal}
                      onChange={handleInputChange}
                      className="font-semibold"
                    />
                  </div>
                  
                  <div className="form-group-aca">
                    <label htmlFor="iva_amount">IVA</label>
                    <input
                      id="iva_amount"
                      name="iva_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.iva_amount}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group-aca">
                    <label htmlFor="total_amount">Total Final</label>
                    <input
                      id="total_amount"
                      name="total_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total_amount}
                      onChange={handleInputChange}
                      className="font-bold text-green-600 text-lg"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Archivo */}
              <div className="card-aca">
                <h3 className="mb-4">📎 Archivo PDF de la Factura</h3>
                <div className="form-group-aca">
                  <label htmlFor="invoice_file">Subir Factura (PDF) *</label>
                  <input
                    id="invoice_file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {file && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Archivo seleccionado: {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-between">
                <Link href="/proveedor/facturas" className="btn-aca bg-gray-600 hover:bg-gray-700">
                  ← Cancelar
                </Link>
                
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
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
