import Image from 'next/image';
import styles from './LoginHeader.module.css';

export const LoginHeader = () => {
  return (
    <header className={styles['header-aca']}>
      <div className={styles['header-content']}>
        {/* Logos ocultos temporalmente */}
        {/* <div className={styles['aca-brand']}>
          <div className={`${styles['logo-container']} ${styles['aca-container']}`}>
            <Image 
              src="/logos/aca-logo.jpeg" 
              alt="ACA Logo" 
              width={80} 
              height={80}
              className="object-cover w-full h-full scale-110" 
              priority 
            />
          </div>
        </div> */}
        <h1 className={styles['header-title']}>Portal de Proveedores - Cooperativas</h1>
        {/* <div className={styles['aca-brand']}>
          <div className={styles['logo-container']}>
            <Image 
              src="/logos/gpi-logo.png" 
              alt="GPI Logo" 
              width={80} 
              height={80}
              className="object-contain w-full h-full" 
              priority 
            />
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default LoginHeader;
