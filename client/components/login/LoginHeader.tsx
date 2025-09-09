import Image from 'next/image';
import styles from './LoginHeader.module.css';

export const LoginHeader = () => {
  return (
    <div className={styles['header-aca']}>
      <div className={styles['aca-brand']}>
        <div className={styles['aca-logo']}>
          <Image src="/logos/aca-logo.png" alt="ACA Logo" width={120} height={60} className="h-auto" priority />
        </div>
        <div className={styles['aca-tagline']}>Asociación de Cooperativas Argentinas</div>
      </div>
      <h1 className={styles['header-title']}>Portal de Cooperativas</h1>
    </div>
  );
};

export default LoginHeader;
