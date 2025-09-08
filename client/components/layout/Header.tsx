import Link from 'next/link';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
}

export function Header({ title, subtitle, backUrl, backLabel }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="header-aca">
      {backUrl && (
        <Link href={backUrl} className="btn-back">
          ← {backLabel || 'Volver'}
        </Link>
      )}
      
      <div className="aca-brand">
        <div className="aca-logo">ACA</div>
        <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
      </div>
      
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
      
      {/* User info */}
      {user && (
        <div className="absolute top-4 right-4 flex items-center space-x-4 text-white">
          <span className="text-sm">{user.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-orange-200 hover:text-white transition-colors"
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
