import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../utils/AuthContext';

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Login - Sistema ACA Cooperativas</title>
      </Head>
      
      {/* Header ACA */}
      <div className="header-aca">
        <div className="aca-brand">
          <div className="aca-logo">ACA</div>
          <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
        </div>
        <h1>Sistema de Gestión de Cooperativas</h1>
        <h2>Acceso Administradores</h2>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Formulario de login */}
          <div className="card-aca">
            <h3 className="text-center mb-6">Iniciar Sesión</h3>
            
            {error && (
              <div className="alert-aca alert-error mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group-aca">
                <label htmlFor="username">Usuario</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Ingresa tu usuario"
                  value={credentials.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group-aca">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-aca w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-aca mr-2"></div>
                    Ingresando...
                  </div>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Información de usuarios de prueba */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800 mb-2">
                👥 Usuarios de Prueba (MVP)
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Admin ACA:</strong> admin_aca / admin123</div>
                <div><strong>Operador ACA:</strong> operador_aca / operador123</div>
                <div><strong>Admin Cooperativa:</strong> admin_coop_1 / coop123</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; 2025 Asociación de Cooperativas Argentinas - Sistema de Gestión</p>
      </footer>
    </div>
  );
}
