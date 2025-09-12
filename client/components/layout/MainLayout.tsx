import React from 'react';
import Head from 'next/head';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  backgroundImage?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = "Portal de Cooperativas - ACA",
  description = "Portal de gestion para las 134 cooperativas de ACA",
  backgroundImage = "/background/soja.jpg"
}) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Background Image */}
      <div 
        className={styles.background}
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />
      <div className={styles.overlay} />
      
      {/* Content Container */}
      <div className={styles.content}>
        <div className={styles.cardContainer}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;