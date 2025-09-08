import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/AuthContext';
import { invoicesAPI } from '../../utils/api';

export default function CooperativeInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todas'); // todas, enviada, aceptada, rechazada
  
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin_coop') {
      router.push('/');
      return;
    }
    
    loadInvoices();
  }, [user, router]);

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getCooperativeInvoices();
      setInvoices(response.data);
    } catch (error) {
      setError('Error al cargar facturas');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceResponse = async (invoiceId, action, rejectionReason = '') => {
    try {
      await invoicesAPI.respondInvoice(invoiceId, action, rejectionReason);
      loadInvoices(); // Recargar lista
    } catch (error) {
      setError(error.response?.data?.error || 'Error al responder factura');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'enviada': { color: 'blue', text: '📤 Enviada', desc: 'Esperando su respuesta' },
      'aceptada': { color: 'green', text: '✅ Aceptada', desc: 'Aprobada por usted' },
      'rechazada': { color: 'red', text: '❌ Rechazada', desc: 'Rechazada por usted' },
      'corregida': { color: 'purple', text: '🔄 Corregida', desc: 'Proveedor corrigió y reenvió' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status, desc: '' };
    
    return (
      <div className="flex flex-col">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-800`}>
          {config.text}
        </span>
        <span className="text-xs text-gray-500 mt-1">{config.desc}</span>
      </div>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'todas') return true;
    if (filter === 'enviada') return invoice.status === 'enviada' || invoice.status === 'corregida';
    return invoice.status === filter;
  });

  const getFilterName = (filterValue) => {
    const filterNames = {
      'enviada': 'pendientes de respuesta',
      'aceptada': 'aceptadas',
      'rechazada': 'rechazadas',
      'corregida': 'corregidas'
    };
    return filterNames[filterValue] || filterValue;
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Facturas Recibidas - Sistema ACA</title>
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
          <h1>Facturas Recibidas</h1>
          <h2>Cooperativa: {user.username}</h2>
          
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
          {/* Filtros y acciones */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todas">Todas las facturas</option>
                <option value="enviada">Pendientes de respuesta</option>
                <option value="aceptada">Aceptadas</option>
                <option value="rechazada">Rechazadas</option>
                <option value="corregida">Corregidas</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <a
                href={invoicesAPI.exportCSV()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-aca text-sm bg-green-600 hover:bg-green-700"
              >
                📊 Exportar CSV (Aceptadas)
              </a>
            </div>
          </div>

          {/* Estadísticas rápidas - Ahora son botones de filtro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setFilter('todas')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'todas' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {invoices.length}
              </div>
              <div className="text-sm font-medium text-gray-700">Total Facturas</div>
              <div className="text-xs text-blue-600 mt-1">
                {filter === 'todas' ? '← Filtro activo' : 'Clic para ver todas'}
              </div>
            </button>
            
            <button
              onClick={() => setFilter('enviada')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'enviada' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {invoices.filter(inv => inv.status === 'enviada' || inv.status === 'corregida').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Pendientes</div>
              <div className="text-xs text-orange-600 mt-1">
                {filter === 'enviada' ? '← Filtro activo' : 'Clic para filtrar'}
              </div>
            </button>
            
            <button
              onClick={() => setFilter('aceptada')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'aceptada' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-green-600 mb-2">
                {invoices.filter(inv => inv.status === 'aceptada').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Aceptadas</div>
              <div className="text-xs text-green-600 mt-1">
                {filter === 'aceptada' ? '← Filtro activo' : 'Clic para filtrar'}
              </div>
            </button>
            
            <button
              onClick={() => setFilter('rechazada')}
              className={`card-aca text-center transition-all cursor-pointer ${
                filter === 'rechazada' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl font-bold text-red-600 mb-2">
                {invoices.filter(inv => inv.status === 'rechazada').length}
              </div>
              <div className="text-sm font-medium text-gray-700">Rechazadas</div>
              <div className="text-xs text-red-600 mt-1">
                {filter === 'rechazada' ? '← Filtro activo' : 'Clic para filtrar'}
              </div>
            </button>
          </div>

          {/* Alertas */}
          {error && (
            <div className="alert-aca alert-error mb-6">
              {error}
            </div>
          )}

          {/* Lista de facturas */}
          {loading ? (
            <div className="card-aca text-center py-12">
              <div className="spinner-aca mb-4"></div>
              <p className="text-gray-600">Cargando facturas...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="card-aca text-center py-12">
              <div className="text-6xl mb-4">�</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {filter === 'todas' ? 'No hay facturas recibidas' : `No hay facturas ${getFilterName(filter)}`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'todas' 
                  ? 'Cuando los proveedores envíen facturas, aparecerán aquí.'
                  : 'Cambie el filtro para ver facturas con otros estados.'
                }
              </p>
              {filter !== 'todas' && (
                <button
                  onClick={() => setFilter('todas')}
                  className="btn-aca"
                >
                  Ver Todas las Facturas
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onResponse={handleInvoiceResponse}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Componente para cada factura
function InvoiceCard({ invoice, onResponse, getStatusBadge }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [responding, setResponding] = useState(false);

  const handleAccept = async () => {
    setResponding(true);
    await onResponse(invoice.id, 'aceptar');
    setResponding(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Debe especificar un motivo para el rechazo');
      return;
    }
    
    setResponding(true);
    await onResponse(invoice.id, 'rechazar', rejectionReason);
    setResponding(false);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const canRespond = invoice.status === 'enviada' || invoice.status === 'corregida';

  return (
    <div className="card-aca">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Encabezado de factura */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Factura #{invoice.invoice_number}
            </h3>
            {getStatusBadge(invoice.status)}
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha</label>
              <p className="font-semibold text-gray-900">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Proveedor</label>
              <p className="font-semibold text-gray-900">
                {invoice.supplier_name || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">CUIT Emisor</label>
              <p className="font-semibold text-gray-900">{invoice.issuer_cuit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total</label>
              <p className="font-semibold text-green-600 text-lg">
                ${parseFloat(invoice.total_amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Motivo de rechazo previo si aplica */}
          {invoice.status === 'corregida' && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-1">📝 Factura corregida:</h4>
              <p className="text-sm text-purple-700">
                El proveedor ha corregido y reenviado esta factura tras su rechazo anterior.
              </p>
            </div>
          )}

          {/* Formulario de rechazo */}
          {showRejectForm && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Motivo del rechazo:</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describa el motivo del rechazo..."
                className="w-full p-2 border border-red-300 rounded-md text-sm"
                rows="3"
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleReject}
                  disabled={responding}
                  className="btn-aca text-sm bg-red-600 hover:bg-red-700"
                >
                  {responding ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="btn-aca text-sm bg-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center space-x-3">
            {canRespond && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={responding}
                  className="btn-aca text-sm bg-green-600 hover:bg-green-700"
                >
                  {responding ? 'Procesando...' : '✅ Aceptar'}
                </button>
                
                <button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  className="btn-aca text-sm bg-red-600 hover:bg-red-700"
                >
                  ❌ Rechazar
                </button>
              </>
            )}

            <a
              href={invoicesAPI.downloadInvoice(invoice.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              📥 Descargar PDF
            </a>

            <Link
              href={`/cooperativa/facturas/${invoice.id}`}
              className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
            >
              👁️ Ver Detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
