import Head from 'next/head';
import { Header } from './Header';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  headerProps?: {
    subtitle?: string;
    backUrl?: string;
    backLabel?: string;
  };
}

export function Layout({ children, title, description, headerProps }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title} - Sistema ACA</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <div className="container-aca">
        <Header title={title} {...headerProps} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
