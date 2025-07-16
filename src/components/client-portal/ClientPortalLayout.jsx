"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const ClientPortalLayout = ({ children, clientData }) => {
  const { data: session } = useSession();
  const [sidebarActive, setSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Configurações do portal do cliente
  const portalSettings = clientData?.portalSettings || {};
  const primaryColor = portalSettings.primaryColor || '#3B82F6';
  const secondaryColor = portalSettings.secondaryColor || '#8B5CF6';
  const logoUrl = portalSettings.logoUrl || '/assets/images/logo.png';
  const allowedSections = portalSettings.allowedSections || ['dashboard', 'campanhas', 'analytics', 'graficos', 'relatorios'];

  // Menu items baseado nas seções permitidas
  const menuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: 'solar:home-smile-bold',
      href: `/portal/${clientData?.slug}`,
    },
    {
      key: 'campanhas',
      title: 'Campanhas',
      icon: 'solar:target-bold',
      href: `/portal/${clientData?.slug}/campanhas`,
    },
    {
      key: 'analytics',
      title: 'Analytics',
      icon: 'solar:chart-2-bold',
      href: `/portal/${clientData?.slug}/analytics`,
    },
    {
      key: 'graficos',
      title: 'Gráficos',
      icon: 'solar:pie-chart-bold',
      href: `/portal/${clientData?.slug}/charts`,
    },
    {
      key: 'relatorios',
      title: 'Relatórios',
      icon: 'solar:document-text-bold',
      href: `/portal/${clientData?.slug}/relatorios`,
    },
    {
      key: 'configuracoes',
      title: 'Configurações',
      icon: 'solar:settings-bold',
      href: `/portal/${clientData?.slug}/configuracoes`,
    },
  ].filter(item => allowedSections.includes(item.key));

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="main-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={() => setSidebarActive(false)}
        >
          <Icon icon="radix-icons:cross-2" />
        </button>
        
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href={`/portal/${clientData?.slug}`} className="sidebar-logo-link">
            <Image
              src={logoUrl}
              alt={clientData?.name}
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Menu de Navegação */}
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.key} className="sidebar-menu-item">
                <Link href={item.href} className="sidebar-menu-link">
                  <Icon icon={item.icon} className="menu-icon" />
                  <span className="menu-text">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Informações do Cliente */}
          <div className="sidebar-client-info mt-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center">
              <div className="client-avatar">
                <Image
                  src={clientData?.avatar || '/assets/images/avatar/avatar1.png'}
                  alt={clientData?.name}
                  width={40}
                  height={40}
                  className="rounded-circle"
                />
              </div>
              <div className="ms-2">
                <h6 className="mb-0 text-sm font-weight-semibold">{clientData?.name}</h6>
                <p className="mb-0 text-xs text-muted">
                  Orçamento: R$ {clientData?.monthlyBudget?.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Status das Conexões */}
          <div className="sidebar-connections mt-3 p-3">
            <h6 className="text-sm font-weight-semibold mb-2">Status das Conexões</h6>
            <div className="connection-status">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-xs">Google Ads</span>
                <span className={`badge ${clientData?.googleAds?.connected ? 'bg-success' : 'bg-secondary'}`}>
                  {clientData?.googleAds?.connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-xs">Facebook Ads</span>
                <span className={`badge ${clientData?.facebookAds?.connected ? 'bg-success' : 'bg-secondary'}`}>
                  {clientData?.facebookAds?.connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-xs">Google Analytics</span>
                <span className={`badge ${clientData?.googleAnalytics?.connected ? 'bg-success' : 'bg-secondary'}`}>
                  {clientData?.googleAnalytics?.connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarActive ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="dashboard-main-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarActive(!sidebarActive)}
            >
              <Icon icon="heroicons:bars-3" className="text-2xl" />
            </button>
            
            <div className="breadcrumb-area">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href={`/portal/${clientData?.slug}`}>Portal</Link>
                  </li>
                  <li className="breadcrumb-item active">{clientData?.name}</li>
                </ol>
              </nav>
            </div>
          </div>

          {/* Header Actions */}
          <div className="header-right d-flex align-items-center gap-3">
            {/* Sincronização */}
            <button className="btn btn-outline-primary btn-sm">
              <Icon icon="solar:refresh-bold" className="me-2" />
              Sincronizar Dados
            </button>

            {/* User Menu */}
            <div className="dropdown">
              <button
                className="dropdown-toggle border-0 bg-transparent d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                <Image
                  src={session?.user?.avatar || '/assets/images/avatar/avatar1.png'}
                  alt={session?.user?.name}
                  width={32}
                  height={32}
                  className="rounded-circle"
                />
                <span className="text-sm font-weight-semibold">{session?.user?.name}</span>
                <Icon icon="solar:alt-arrow-down-bold" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" href={`/portal/${clientData?.slug}/configuracoes`}>
                    <Icon icon="solar:user-bold" className="me-2" />
                    Meu Perfil
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href={`/portal/${clientData?.slug}/configuracoes`}>
                    <Icon icon="solar:settings-bold" className="me-2" />
                    Configurações
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <Icon icon="solar:logout-2-bold" className="me-2" />
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="dashboard-main-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
            <h6 className="fw-semibold mb-0">Portal do Cliente - {clientData?.name}</h6>
            <ul className="d-flex align-items-center gap-2">
              <li className="fw-medium">
                <Link href={`/portal/${clientData?.slug}`} className="d-flex align-items-center gap-1 hover-text-primary">
                  <Icon icon="solar:home-smile-angle-outline" className="icon text-lg" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .sidebar {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        
        .sidebar-menu-link:hover {
          background-color: ${primaryColor}15;
          color: ${primaryColor};
        }
        
        .sidebar-menu-link.active {
          background-color: ${primaryColor};
          color: white;
        }
        
        .btn-primary {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
        }
        
        .btn-primary:hover {
          background-color: ${secondaryColor};
          border-color: ${secondaryColor};
        }
        
        .text-primary {
          color: ${primaryColor} !important;
        }
      `}</style>
    </div>
  );
};

export default ClientPortalLayout;