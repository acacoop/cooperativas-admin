import React from 'react';
import styles from './Aviso.module.css';

export type AvisoType = 'info' | 'warning' | 'error' | 'success';

interface AvisoProps {
  title?: string;
  type?: AvisoType;
  children: React.ReactNode;
  className?: string;
}

export const Aviso: React.FC<AvisoProps> = ({ 
  title, 
  type = 'info', 
  children, 
  className = '' 
}) => {
  return (
    <div className={`${styles.aviso} ${styles[`aviso--${type}`]} ${className}`}>
      {title && (
        <h4 className={styles.avisoTitle}>
          {title}
        </h4>
      )}
      <div className={styles.avisoContent}>
        {children}
      </div>
    </div>
  );
};

export default Aviso;