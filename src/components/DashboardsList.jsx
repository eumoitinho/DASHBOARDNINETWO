"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';

const DashboardsList = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();

      if (response.ok) {
        setClients(data.data || []);
      } else {
        throw new Error(data.message || 'Erro ao carregar clientes');
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar lista de clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "bg-success-subtle text-success-main",
      pending: "bg-warning-subtle text-warning-main",
      inactive: "bg-secondary-subtle text-secondary-main"
    };
    
    const statusLabels = {
      active: "Ativo",
      pending: "Pendente",
      inactive: "Inativo"
    };

    return (
      <span className={`badge ${statusClasses[status] || statusClasses.inactive}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getConnectionStatus = (connected) => {
    return connected ? (
      <Icon icon="solar:check-circle-bold" className="text-success" />
    ) : (
      <Icon icon="solar:close-circle-bold" className="text-danger" />
    );
  };

  const getConnectionBadge = (connected, label) => {
    return connected ? (
      <span className="badge bg-success-subtle text-success-main">
        <Icon icon="solar:check-circle-bold" className="me-1" />
        {label}
      </span>
    ) : (
      <span className="badge bg-danger-subtle text-danger-main">
        <Icon icon="solar:close-circle-bold" className="me-1" />
        {label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não sincronizado';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastSyncDate = (client) => {
    const dates = [
      client.googleAnalyticsLastSync,
      client.googleAdsLastSync,
      client.facebookAdsLastSync
    ].filter(date => date);
    
    if (dates.length === 0) return null;
    
    // Retorna a data mais recente
    return dates.reduce((latest, current) => {
      return new Date(current) > new Date(latest) ? current : latest;
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando dashboards..." />;
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:close-circle-bold" className="text-danger text-4xl mb-3" />
              <h5>Erro ao carregar dashboards</h5>
              <p className="text-muted">{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={fetchClients}
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
      {/* Filtros e Busca */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="input-group">
                  <span className="input-group-text">
                    <Icon icon="solar:magnifer-bold" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3 mb-3 mb-md-0">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativos</option>
                  <option value="pending">Pendentes</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              <div className="col-md-3">
                <Link href="/add-client" className="btn btn-primary w-100">
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Adicionar Cliente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Dashboards */}
      <div className="col-12">
        {filteredClients.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <Icon icon="solar:users-group-rounded-bold" className="text-muted text-4xl mb-3" />
              <h5>Nenhum cliente encontrado</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Adicione clientes para começar'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link href="/add-client" className="btn btn-primary">
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Adicionar Primeiro Cliente
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredClients.map((client) => (
              <div key={client._id} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    {/* Header do Cliente */}
                    <div className="d-flex align-items-center mb-3">
                      {client.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="rounded-circle me-3"
                          width="50"
                          height="50"
                        />
                      ) : (
                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3" 
                             style={{width: '50px', height: '50px'}}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{client.name}</h6>
                        <small className="text-muted">{client.email}</small>
                      </div>
                      <div className="text-end">
                        {getStatusBadge(client.status)}
                      </div>
                    </div>

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                      <div className="mb-3">
                        <div className="d-flex flex-wrap gap-1">
                          {client.tags.map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status de Conexão */}
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-2">
                        {getConnectionBadge(client.googleAnalyticsConnected, 'Analytics')}
                        {getConnectionBadge(client.googleAdsConnected, 'Google Ads')}
                        {getConnectionBadge(client.facebookAdsConnected, 'Meta Ads')}
                      </div>
                    </div>

                    {/* Métricas Básicas */}
                    <div className="mb-3">
                      <div className="row text-center">
                        <div className="col-6">
                          <h6 className="mb-1 text-primary">
                            {formatCurrency(client.monthlyBudget)}
                          </h6>
                          <small className="text-muted">Orçamento Mensal</small>
                        </div>
                        <div className="col-6">
                          <h6 className="mb-1 text-success">
                            {formatDate(getLastSyncDate(client))}
                          </h6>
                          <small className="text-muted">Última Sincronização</small>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="d-flex gap-2">
                      <Link
                        href={`/client-analytics/${client.slug}`}
                        className="btn btn-primary btn-sm flex-grow-1"
                      >
                        <Icon icon="solar:chart-2-bold" className="me-2" />
                        Ver Analytics
                      </Link>
                      <Link
                        href={`/edit-client/${client.slug}`}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        <Icon icon="solar:pen-bold" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardsList; 