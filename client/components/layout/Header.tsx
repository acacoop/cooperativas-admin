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
    <div className={styles['header-aca']}>
      {/* Back button */}
      {backUrl && (
        <Link href={backUrl} className={styles['back-button']}>
          ← {backLabel || 'Volver'}
        </Link>
      )}
      
      {/* User info */}
      {user && (
        <div className={styles['user-info']}>
          <span className="text-sm hidden sm:inline">{user.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-orange-200 hover:text-white transition-colors"
          >
            Salir
          </button>
        </div>
      )}

      {/* Centered content */}
      <div className={styles['header-content']}>
        <div className={styles['aca-brand']}>
          <div className={styles['aca-logo']}>
            <Image 
              src="/logos/aca-logo.jpeg" 
              alt="ACA Logo" 
              width={80} 
              height={80} 
              className="object-cover w-full h-full" 
              priority 
            />
          </div>
        </div>
        
        <div className={styles['title-container']}>
          <h1 className={styles['header-title']}>{title}</h1>
          {user?.company_name && (
            <h2 className={styles['header-subtitle']}>
              Cooperativa: {user.company_name}
            </h2>
          )}
          {subtitle && (
            <h2 className={styles['header-subtitle']}>{subtitle}</h2>
          )}
        </div>
      </div>
    </div>
  );
}
