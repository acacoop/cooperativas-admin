import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../utils/AuthContext';
import LoginHeader from '../components/login/LoginHeader';
import LogoCarousel from '../components/login/LogoCarousel';

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
    <div className="min-h-screen w-full flex flex-col relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px]"
        style={{ backgroundImage: 'url("/background/trigo.jpg")' }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex flex-col flex-1 z-10">
      <Head>
        <title>Login - Sistema ACA Cooperativas</title>
      </Head>
      
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
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800 mb-2">
                👥 Usuarios de Prueba (MVP)
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Admin ACA:</strong> admin_aca / admin123</div>
                <div><strong>Operador ACA:</strong> operador_aca / operador123</div>
                <div><strong>Admin Cooperativa:</strong> admin_coop_1 / coop123</div>
                <div><strong>🚚 Proveedor:</strong> proveedor_test / proveedor123</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white text-center p-4 mt-auto">
        <p className="text-sm sm:text-base">&copy; 2025 Asociación de Cooperativas Argentinas - Sistema de Gestión</p>
      </footer>
      </div>
    </div>
  );
}
