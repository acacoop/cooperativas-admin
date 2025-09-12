import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';
import LoginHeader from '../components/login/LoginHeader';
import LogoCarousel from '../components/login/LogoCarousel';
import LoginLayout from '../components/layout/LoginLayout';
import Aviso from '../components/ui/Aviso';

interface Credentials {
  username: string;
  password: string;
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Let AuthContext handle the redirection after login
      return;
    }
  }, [user, loading]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials.username, credentials.password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <LoginLayout title="Login - Sistema ACA Cooperativas">
      {/* Header ACA */}
      <LoginHeader />

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-between w-full p-4 sm:p-6">
        {/* Logo Carousel */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="backdrop-blur-md bg-white/30 p-8 rounded-full">
            <LogoCarousel />
          </div>
        </div>
        
        {/* Form Container */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Formulario de login */}
          <div className="card-aca backdrop-blur-md bg-white/90">
            <h3 className="text-center mb-6 text-gray-800">Iniciar Sesión</h3>
            
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
            <Aviso 
              type="info" 
              title="👥 Usuarios de Prueba (MVP)"
            >
              <div><strong>Admin ACA:</strong> admin_aca / admin123</div>
              <div><strong>Operador ACA:</strong> operador_aca / operador123</div>
              <div><strong>Admin Cooperativa:</strong> admin_coop_1 / coop123</div>
              <div><strong>🚚 Proveedor:</strong> proveedor_test / proveedor123</div>
            </Aviso>
          </div>
        </div>
      </main>
    </LoginLayout>
  );
}
