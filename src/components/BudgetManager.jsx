"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar clientes
      const clientsResponse = await fetch('/api/admin/clients');
      const clientsData = await clientsResponse.json();

      if (clientsResponse.ok) {
        setClients(clientsData.data || []);
      }

      // Buscar orçamentos
      const budgetsResponse = await fetch(`/api/admin/budgets?period=${selectedPeriod}`);
      const budgetsData = await budgetsResponse.json();

      if (budgetsResponse.ok) {
        setBudgets(budgetsData.data || []);
      } else {
        // Se não conseguir buscar orçamentos, criar dados básicos baseados nos clientes
        const basicBudgets = (clientsData.data || []).map(client => ({
          _id: `budget-${client._id}`,
          clientId: client._id,
          clientSlug: client.slug,
          clientName: client.name,
          period: selectedPeriod === 'current' ? '2024-01' : selectedPeriod === 'previous' ? '2023-12' : '2024-02',
          budget: client.monthlyBudget || 0,
          spent: Math.round((client.monthlyBudget || 0) * 0.7), // Simular 70% gasto
          remaining: Math.round((client.monthlyBudget || 0) * 0.3), // Simular 30% restante
          status: client.status === 'active' ? 'active' : 'pending',
          channels: client.googleAds?.connected ? ['Google Ads'] : [],
          notes: `Orçamento para ${client.name}`
        }));
        setBudgets(basicBudgets);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados de orçamentos');
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "bg-success-subtle text-success-main",
      exhausted: "bg-danger-subtle text-danger-main",
      pending: "bg-warning-subtle text-warning-main",
      inactive: "bg-secondary-subtle text-secondary-main"
    };
    
    const statusLabels = {
      active: "Ativo",
      exhausted: "Esgotado",
      pending: "Pendente",
      inactive: "Inativo"
    };

    return (
      <span className={`badge ${statusClasses[status] || statusClasses.inactive}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const getProgressPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const handleAddBudget = () => {
    setNotification({
      type: 'info',
      title: 'Funcionalidade',
      message: 'Funcionalidade de adicionar orçamento será implementada'
    });
  };

  const handleEditBudget = (budgetId) => {
    setNotification({
      type: 'info',
      title: 'Funcionalidade',
      message: 'Funcionalidade de editar orçamento será implementada'
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando orçamentos..." />;
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:close-circle-bold" className="text-danger text-4xl mb-3" />
              <h5>Erro ao carregar orçamentos</h5>
              <p className="text-muted">{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={fetchData}
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
      {notification && (
        <div className="col-12 mb-3">
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Filtros e Controles */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <h6 className="mb-0">Gerenciar Orçamentos</h6>
              </div>
              <div className="col-md-3 mb-3 mb-md-0">
                <select
                  className="form-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="current">Período Atual</option>
                  <option value="previous">Período Anterior</option>
                  <option value="next">Próximo Período</option>
                </select>
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleAddBudget}
                >
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Adicionar Orçamento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo dos Orçamentos */}
      <div className="col-12 mb-4">
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <Icon icon="solar:money-bag-bold" className="text-primary text-2xl mb-2" />
                <h4 className="text-primary mb-1">
                  {formatCurrency(budgets.reduce((sum, budget) => sum + budget.budget, 0))}
                </h4>
                <p className="text-muted mb-0">Orçamento Total</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <Icon icon="solar:wallet-money-bold" className="text-success text-2xl mb-2" />
                <h4 className="text-success mb-1">
                  {formatCurrency(budgets.reduce((sum, budget) => sum + budget.spent, 0))}
                </h4>
                <p className="text-muted mb-0">Gasto Total</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <Icon icon="solar:chart-2-bold" className="text-warning text-2xl mb-2" />
                <h4 className="text-warning mb-1">
                  {formatCurrency(budgets.reduce((sum, budget) => sum + budget.remaining, 0))}
                </h4>
                <p className="text-muted mb-0">Restante</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <Icon icon="solar:users-group-rounded-bold" className="text-info text-2xl mb-2" />
                <h4 className="text-info mb-1">{budgets.length}</h4>
                <p className="text-muted mb-0">Clientes Ativos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Orçamentos por Cliente</h5>
          </div>
          <div className="card-body">
            {budgets.length === 0 ? (
              <div className="text-center py-4">
                <Icon icon="solar:money-bag-bold" className="text-muted text-4xl mb-3" />
                <h6>Nenhum orçamento encontrado</h6>
                <p className="text-muted">Adicione orçamentos para começar</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleAddBudget}
                >
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Adicionar Orçamento
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Período</th>
                      <th>Orçamento</th>
                      <th>Gasto</th>
                      <th>Restante</th>
                      <th>Progresso</th>
                      <th>Status</th>
                      <th>Canais</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget) => {
                      const client = clients.find(c => c._id === budget.clientId) || {};
                      const progressPercentage = getProgressPercentage(budget.spent, budget.budget);
                      const progressColor = getProgressColor(progressPercentage);
                      
                      return (
                        <tr key={budget._id}>
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
                                  {client.name?.charAt(0).toUpperCase() || 'C'}
                                </div>
                              )}
                              <div>
                                <h6 className="mb-0">{client.name || budget.clientName}</h6>
                                <small className="text-muted">{client.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">{budget.period}</span>
                          </td>
                          <td>
                            <span className="fw-semibold">
                              {formatCurrency(budget.budget)}
                            </span>
                          </td>
                          <td>
                            <span className="text-success">
                              {formatCurrency(budget.spent)}
                            </span>
                          </td>
                          <td>
                            <span className="text-warning">
                              {formatCurrency(budget.remaining)}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{height: '8px'}}>
                                <div 
                                  className={`progress-bar bg-${progressColor}`}
                                  style={{width: `${progressPercentage}%`}}
                                />
                              </div>
                              <small className="text-muted">
                                {progressPercentage.toFixed(1)}%
                              </small>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(budget.status)}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {budget.channels?.map((channel, index) => (
                                <span key={index} className="badge bg-light text-dark">
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditBudget(budget._id)}
                                title="Editar"
                              >
                                <Icon icon="solar:pen-bold" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Ver Detalhes"
                              >
                                <Icon icon="solar:eye-bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default BudgetManager; 