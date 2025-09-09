import Link from 'next/link';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './Header.module.css';

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
        <div className={styles['aca-logo']}>
          <Image src="/logos/aca-logo.png" alt="ACA Logo" width={120} height={60} className="h-auto" priority />
        </div>
        <div className="aca-tagline">Asociación de Cooperativas Argentinas</div>
      </div>
      
      <h1>{title}</h1>
      {user && (
        <h2>Cooperativa: {user.company_name || user.username}</h2>
      )}
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
