"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';

const AgencyDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    avgConversionRate: 0,
    totalSpend: 0,
    totalConversions: 0
  });

  const [recentClients, setRecentClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar estatísticas da agência
      const statsResponse = await fetch('/api/admin/dashboard/stats');
      const statsData = await statsResponse.json();

      if (statsResponse.ok) {
        setStats(statsData.data);
      }

      // Buscar clientes recentes
      const clientsResponse = await fetch('/api/admin/clients?limit=5');
      const clientsData = await clientsResponse.json();

      if (clientsResponse.ok) {
        setRecentClients(clientsData.data || []);
      }

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não sincronizado';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:close-circle-bold" className="text-primary text-4xl mb-3" />
              <h5>Erro ao carregar dashboard</h5>
              <p className="text-muted">{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={fetchDashboardData}
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Cards de Estatísticas */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="w-48-px h-48-px bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                  <Icon icon="solar:users-group-rounded-bold" className="text-primary text-xl" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="mb-1">{stats.totalClients}</h4>
                <p className="text-muted mb-0">Total de Clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="w-48-px h-48-px bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                  <Icon icon="solar:check-circle-bold" className="text-primary text-xl" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="mb-1">{stats.activeClients}</h4>
                <p className="text-muted mb-0">Clientes Ativos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="w-48-px h-48-px bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                  <Icon icon="solar:money-bag-bold" className="text-primary text-xl" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="mb-1">{formatCurrency(stats.totalRevenue)}</h4>
                <p className="text-muted mb-0">Receita Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="w-48-px h-48-px bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                  <Icon icon="solar:chart-2-bold" className="text-primary text-xl" />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="mb-1">{stats.avgConversionRate.toFixed(1)}%</h4>
                <p className="text-muted mb-0">Taxa Média de Conversão</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clientes Recentes */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Clientes Recentes</h5>
            <Link href="/clients" className="btn btn-primary btn-sm">
              Ver Todos
            </Link>
          </div>
          <div className="card-body">
            {recentClients.length === 0 ? (
              <div className="text-center py-4">
                <Icon icon="solar:users-group-rounded-bold" className="text-muted text-4xl mb-3" />
                <h6>Nenhum cliente encontrado</h6>
                <p className="text-muted">Adicione clientes para começar</p>
                <Link href="/add-client" className="btn btn-primary btn-sm">
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Adicionar Cliente
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Status</th>
                      <th>Última Sincronização</th>
                      <th>Orçamento Mensal</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClients.map((client) => (
                      <tr key={client._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                className="rounded-circle me-3"
                                width="40"
                                height="40"
                              />
                            ) : (
                              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3" 
                                   style={{width: '40px', height: '40px'}}>
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h6 className="mb-0">{client.name}</h6>
                              <small className="text-muted">{client.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${client.status === 'active' ? 'bg-primary-subtle text-primary' : 'bg-primary-subtle text-primary-700'}`}>
                            {client.status === 'active' ? 'Ativo' : 'Pendente'}
                          </span>
                        </td>
                        <td>
                          {client.googleAnalytics?.lastSync || client.facebookAds?.lastSync ? (
                            <span className="text-muted">
                              {formatDate(client.googleAnalytics?.lastSync || client.facebookAds?.lastSync)}
                            </span>
                          ) : (
                            <span className="text-primary-700">Não sincronizado</span>
                          )}
                        </td>
                        <td>
                          <span className="fw-semibold">
                            {formatCurrency(client.monthlyBudget)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link
                              href={`/client-analytics/${client.slug}`}
                              className="btn btn-sm btn-outline-primary"
                              title="Ver Analytics"
                            >
                              <Icon icon="solar:chart-2-bold" />
                            </Link>
                            <Link
                              href={`/edit-client/${client.slug}`}
                              className="btn btn-sm btn-outline-primary"
                              title="Editar"
                            >
                              <Icon icon="solar:pen-bold" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Ações Rápidas</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mb-3">
                <Link href="/add-client" className="btn btn-primary w-100">
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Adicionar Cliente
                </Link>
              </div>
              <div className="col-md-3 mb-3">
                <Link href="/clients" className="btn btn-outline-primary w-100">
                  <Icon icon="solar:users-group-rounded-bold" className="me-2" />
                  Gerenciar Clientes
                </Link>
              </div>
              <div className="col-md-3 mb-3">
                <button className="btn btn-outline-primary w-100">
                  <Icon icon="solar:refresh-bold" className="me-2" />
                  Sincronizar Todos
                </button>
              </div>
              <div className="col-md-3 mb-3">
                <button className="btn btn-outline-primary w-100">
                  <Icon icon="solar:chart-2-bold" className="me-2" />
                  Relatório Geral
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard; 