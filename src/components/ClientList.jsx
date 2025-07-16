"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/clients');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }
      
      const data = await response.json();
      setClients(data.data || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "bg-primary-subtle text-primary",
      pending: "bg-primary-subtle text-primary-700",
      inactive: "bg-primary-subtle text-primary-900"
    };
    return (
      <span className={`badge ${statusClasses[status] || statusClasses.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConnectionStatus = (connected) => {
    return connected ? (
      <Icon icon="solar:check-circle-bold" className="text-primary text-xl" />
    ) : (
      <Icon icon="solar:close-circle-bold" className="text-primary-700 text-xl" />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não sincronizado';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <div className="spinner-border" style={{color: '#D00054'}} role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando clientes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:close-circle-bold" className="text-primary text-4xl mb-3" />
              <h5>Erro ao carregar clientes</h5>
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
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              Gestão de Clientes ({clients.length})
            </h5>
            <div className="d-flex gap-2">
              <Link href="/client-tags" className="btn btn-outline-primary">
                <Icon icon="solar:tag-price-bold" className="me-2" />
                Gerenciar Tags
              </Link>
              <Link href="/budgets" className="btn btn-outline-primary">
                <Icon icon="solar:money-bag-bold" className="me-2" />
                Orçamentos
              </Link>
              <Link href="/add-client" className="btn btn-primary">
                <Icon icon="solar:add-circle-bold" className="me-2" />
                Adicionar Cliente
              </Link>
            </div>
          </div>
          <div className="card-body">
            {clients.length === 0 ? (
              <div className="text-center py-5">
                <Icon icon="solar:users-group-rounded-bold" className="text-muted text-4xl mb-3" />
                <h5>Nenhum cliente encontrado</h5>
                <p className="text-muted">Adicione seu primeiro cliente para começar</p>
                <Link href="/add-client" className="btn btn-primary">
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
                      <th>Google Analytics 4</th>
                      <th>Meta Ads</th>
                      <th>Última Sincronização</th>
                      <th>Orçamento Mensal</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar me-3">
                              {client.avatar ? (
                                <img
                                  src={client.avatar}
                                  alt={client.name}
                                  className="rounded-circle"
                                  width="40"
                                  height="40"
                                />
                              ) : (
                                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" 
                                     style={{width: '40px', height: '40px'}}>
                                  {client.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="mb-0">{client.name}</h6>
                              <small className="text-muted">{client.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(client.status)}</td>
                        <td>{getConnectionStatus(client.googleAnalytics?.connected)}</td>
                        <td>{getConnectionStatus(client.facebookAds?.connected)}</td>
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
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Remover"
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja remover ${client.name}?`)) {
                                  // TODO: Implementar remoção
                                  console.log('Remover cliente:', client._id);
                                }
                              }}
                            >
                              <Icon icon="solar:trash-bin-trash-bold" />
                            </button>
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
    </div>
  );
};

export default ClientList; 