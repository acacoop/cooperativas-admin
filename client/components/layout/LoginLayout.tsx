import React from 'react';
import Head from 'next/head';
import styles from './LoginLayout.module.css';

interface LoginLayoutProps {
  children: React.ReactNode;
  title?: string;
  backgroundImage?: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ 
  children, 
  title = "Login - Sistema ACA Cooperativas",
  backgroundImage = "/background/trigo.jpg"
}) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
      </Head>
      
      {/* Background Image */}
      <div 
        className={styles.background}
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      <div className={styles.overlay} />
      
      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Asociación de Cooperativas Argentinas - Sistema de Gestión</p>
      </footer>
    </div>
  );
};

export default LoginLayout;