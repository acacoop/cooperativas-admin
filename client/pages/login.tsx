import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/AuthContext';
import LoginHeader from '../components/login/LoginHeader';
import LogoCarousel from '../components/login/LogoCarousel';
import LoginLayout from '../components/layout/LoginLayout';
import LoginForm from '../components/login/LoginForm';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Let AuthContext handle the redirection after login
      return;
    }
  }, [user, loading]);

  return (
    <LoginLayout title="Login - Proveedores">
      {/* Header */}
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
        <LoginForm />
      </main>
    </LoginLayout>
  );
}
