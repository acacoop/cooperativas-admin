import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../utils/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/types';
import { Header } from '@/components/layout/Header';
import MenuCard from '@/components/ui/MenuCard';
import StatsGrid from '@/components/ui/StatsGrid';
import { StatItem } from '@/components/ui/StatsCard';
import MainLayout from '@/components/layout/MainLayout';
import { Aviso } from '@/components/ui';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-aca"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserRoleDisplay = (role: User['role']): string => {
    switch (role) {
      case 'admin_aca':
        return 'Admin ACA';
      case 'operador_aca':
        return 'Operador ACA';
      case 'admin_coop':
        return 'Admin Cooperativa';
      case 'proveedor':
        return 'Proveedor';
      default:
        return 'Usuario';
    }
  };

  // Stats data for the dashboard
  const systemStats: StatItem[] = [
    {
      id: 'cooperativas',
      value: 134,
      label: 'Cooperativas',
      description: 'Total registradas',
      color: 'blue'
    },
    {
      id: 'regiones',
      value: 7,
      label: 'Regiones CAR',
      description: 'Centros de distribución',
      color: 'green'
    },
    {
      id: 'facturas',
      value: '📄',
      label: 'Sistema de Facturas',
      description: 'Gestión activa y operativa',
      color: 'orange',
      icon: '📄'
    },
    {
      id: 'version',
      value: 'BETA',
      label: 'Versión Actual',
      description: 'En fase de pruebas',
      color: 'purple'
    }
  ];

  return (
    <MainLayout 
      title="Portal de Cooperativas - ACA"
      description="Portal de gestion para las 134 cooperativas de ACA"
    >
      <Header 
        title="Portal de Cooperativas"
        subtitle="Dashboard Principal"
      />

      {/* Contenido principal */}
      <main className="p-6 sm:p-8 lg:p-10">
        {/* Cards de acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* CARDS PARA PROVEEDORES */}
          {user.role === 'proveedor' && (
            <>
              {/* Card para subir facturas */}
              <MenuCard
                href="/proveedor/facturas"
                icon="📄"
                title="Mis Facturas"
                subtitle="Subir y gestionar facturas"
                footerText="Enviar a cooperativas"
                gradientFrom="rgb(34, 197, 94)"
                gradientTo="rgb(22, 163, 74)"
                hoverColor="rgb(22, 163, 74)"
              />

              {/* Card para nueva factura */}
              <MenuCard
                href="/proveedor/nueva-factura"
                icon="➕"
                title="Nueva Factura"
                subtitle="Subir nueva factura"
                footerText="Proceso rápido"
                gradientFrom="rgb(59, 130, 246)"
                gradientTo="rgb(37, 99, 235)"
                hoverColor="rgb(37, 99, 235)"
              />

              {/* Card para estadísticas */}
              <MenuCard
                icon="📊"
                title="Estadísticas"
                subtitle="Resumen de facturas"
                footerText="Métricas en tiempo real"
                gradientFrom="rgb(168, 85, 247)"
                gradientTo="rgb(147, 51, 234)"
                hoverColor="rgb(147, 51, 234)"
              />
            </>
          )}

          {/* CARDS PARA ADMIN COOPERATIVA */}
          {user.role === 'admin_coop' && (
            <>
              {/* Card para facturas recibidas */}
              <MenuCard
                href="/cooperativa/facturas"
                icon="📨"
                title="Facturas Recibidas"
                subtitle="Revisar y aprobar facturas"
                footerText="Gestión de proveedores"
                gradientFrom="rgb(249, 115, 22)"
                gradientTo="rgb(234, 88, 12)"
                hoverColor="rgb(234, 88, 12)"
              />
            </>
          )}

          {/* CARDS PARA TODOS LOS ROLES (ADMIN ACA, OPERADOR) - NO ADMIN COOP */}
          {(user.role === 'admin_aca' || user.role === 'operador_aca') && (
            <>
              {/* Card para ver cooperativas */}
              <MenuCard
                href="/cooperativas"
                icon="🏢"
                title="Cooperativas"
                subtitle="Gestionar datos de cooperativas"
                footerText="134 cooperativas registradas"
                gradientFrom="rgb(59, 130, 246)"
                gradientTo="rgb(37, 99, 235)"
                hoverColor="rgb(37, 99, 235)"
              />
            </>
          )}

          {/* Card para cambios pendientes (solo admin ACA) */}
          {user.role === 'admin_aca' && (
            <MenuCard
              href="/cambios-pendientes"
              icon="⏰"
              title="Cambios Pendientes"
              subtitle="Aprobar modificaciones"
              footerText="Revisión requerida"
              gradientFrom="rgb(234, 179, 8)"
              gradientTo="rgb(249, 115, 22)"
              hoverColor="rgb(249, 115, 22)"
            />
          )}
          {/* Card para mi cooperativa (solo admin cooperativa) */}
          {user.role === 'admin_coop' && user.cooperative_id && (
            <MenuCard
              href={`/cooperativas/${user.cooperative_id}`}
              icon="👤"
              title="Mi Cooperativa"
              subtitle="Actualizar información"
              footerText="Acceso directo"
              gradientFrom="rgb(34, 197, 94)"
              gradientTo="rgb(22, 163, 74)"
              hoverColor="rgb(22, 163, 74)"
            />
          )}

          {/* Card para configuración (solo admin ACA) */}
          {user.role === 'admin_aca' && (
            <MenuCard
              icon="⚙️"
              title="Configuración"
              subtitle="Gestión del sistema"
              footerText="Próximamente disponible"
              gradientFrom="rgb(156, 163, 175)"
              gradientTo="rgb(107, 114, 128)"
              hoverColor="rgb(107, 114, 128)"
            />
          )}
        </div>

        {/* System Statistics */}
        <StatsGrid 
          title="📈 Información General del Sistema"
          stats={systemStats}
        />

        {/* Información adicional para diferentes roles */}
        {user.role === 'admin_aca' && (
          <Aviso type="info" title="👑 Administrador ACA" className='mt-6'>
            <text>Tienes acceso completo al sistema. 
            Puedes gestionar todas las cooperativas, aprobar cambios y administrar usuarios.</text>
          </Aviso>  
        )}

        {user.role === 'operador_aca' && (
          <Aviso type="info" title="🔧 Operador ACA" className='mt-6'>
            <text>Puedes consultar información de cooperativas 
            y asistir en tareas operativas del sistema.</text>
          </Aviso>
        )}

        {user.role === 'admin_coop' && (
          <Aviso type="success" title="🏢 Administrador de Cooperativa" className='mt-6'>
            <text>Puedes actualizar la información de tu cooperativa. 
            Los cambios serán revisados por ACA antes de ser aplicados.</text>
          </Aviso>
        )}
      </main>
    </MainLayout>
  );
}
