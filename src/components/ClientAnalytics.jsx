"use client";
import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import dynamic from 'next/dynamic';
import ClientCharts from './child/ClientCharts';

// Importar componentes de chart dinamicamente para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ClientAnalytics = ({ clientSlug }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientSlug) {
      fetchDashboardData();
    }
  }, [clientSlug, selectedPeriod]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar dados do cliente
      const clientResponse = await fetch(`/api/clients/${clientSlug}`);
      const clientData = await clientResponse.json();

      if (!clientResponse.ok) {
        throw new Error(clientData.message || 'Cliente não encontrado');
      }

      setClient(clientData.data);

      // Buscar dados de analytics
      const analyticsResponse = await fetch(`/api/dashboard/${clientSlug}?period=${selectedPeriod}`);
      const analyticsData = await analyticsResponse.json();

      if (analyticsResponse.ok && analyticsData.success) {
        setDashboardData(analyticsData.data);
      } else {
        // Se não conseguir buscar analytics, usar dados básicos do cliente
        setDashboardData({
          client: clientData.data,
          summary: {
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            cpm: 0,
            conversionRate: 0,
            roas: 0
          },
          campaigns: [],
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatPercentage = (num) => {
    return `${num.toFixed(2)}%`;
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando analytics..." />;
  }

  if (error) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:close-circle-bold" className="text-danger text-4xl mb-3" />
              <h5>Erro ao carregar analytics</h5>
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

  if (!client) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <Icon icon="solar:users-group-rounded-bold" className="text-muted text-4xl mb-3" />
              <h5>Cliente não encontrado</h5>
              <p className="text-muted">O cliente solicitado não foi encontrado</p>
              <Link href="/clients" className="btn btn-primary">
                Voltar para Clientes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Header do Cliente */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {client.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                ) : (
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3" 
                       style={{width: '60px', height: '60px'}}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="mb-1">{client.name}</h4>
                  <p className="text-muted mb-0">{client.email}</p>
                  <div className="d-flex gap-2 mt-2">
                    <span className={`badge ${client.status === 'active' ? 'bg-success-subtle text-success-main' : 'bg-warning-subtle text-warning-main'}`}>
                      {client.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                    <span className="badge bg-info-subtle text-info-main">
                      {formatCurrency(client.monthlyBudget)}/mês
                    </span>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <select 
                  className="form-select" 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                </select>
                <Link href={`/edit-client/${clientSlug}`} className="btn btn-outline-primary">
                  <Icon icon="solar:pen-bold" className="me-2" />
                  Editar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      {dashboardData?.summary && (
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="w-48-px h-48-px bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center">
                    <Icon icon="solar:eye-bold" className="text-primary text-xl" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-1">{formatNumber(dashboardData.summary.impressions)}</h4>
                  <p className="text-muted mb-0">Impressões</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardData?.summary && (
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="w-48-px h-48-px bg-success-subtle rounded-circle d-flex align-items-center justify-content-center">
                    <Icon icon="solar:cursor-bold" className="text-success text-xl" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-1">{formatNumber(dashboardData.summary.clicks)}</h4>
                  <p className="text-muted mb-0">Cliques</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardData?.summary && (
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="w-48-px h-48-px bg-warning-subtle rounded-circle d-flex align-items-center justify-content-center">
                    <Icon icon="solar:money-bag-bold" className="text-warning text-xl" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-1">{formatCurrency(dashboardData.summary.cost)}</h4>
                  <p className="text-muted mb-0">Gasto</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardData?.summary && (
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="w-48-px h-48-px bg-info-subtle rounded-circle d-flex align-items-center justify-content-center">
                    <Icon icon="solar:chart-2-bold" className="text-info text-xl" />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-1">{formatNumber(dashboardData.summary.conversions)}</h4>
                  <p className="text-muted mb-0">Conversões</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="col-12 mb-4">
        <ClientCharts 
          clientSlug={clientSlug}
          period={selectedPeriod}
          dashboardData={dashboardData}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      {/* Campanhas */}
      {dashboardData?.campaigns && dashboardData.campaigns.length > 0 && (
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Campanhas Ativas</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Campanha</th>
                      <th>Plataforma</th>
                      <th>Status</th>
                      <th>Impressões</th>
                      <th>Cliques</th>
                      <th>CTR</th>
                      <th>Gasto</th>
                      <th>Conversões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.campaigns.map((campaign, index) => (
                      <tr key={index}>
                        <td>
                          <h6 className="mb-0">{campaign.campaignName}</h6>
                          <small className="text-muted">{campaign.campaignId}</small>
                        </td>
                        <td>
                          <span className={`badge ${campaign.platform === 'google_ads' ? 'bg-primary-subtle text-primary-main' : 'bg-info-subtle text-info-main'}`}>
                            {campaign.platform === 'google_ads' ? 'Google Ads' : 'Meta Ads'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${campaign.status === 'active' ? 'bg-success-subtle text-success-main' : 'bg-warning-subtle text-warning-main'}`}>
                            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                          </span>
                        </td>
                        <td>{formatNumber(campaign.metrics.impressions)}</td>
                        <td>{formatNumber(campaign.metrics.clicks)}</td>
                        <td>{formatPercentage(campaign.metrics.ctr)}</td>
                        <td>{formatCurrency(campaign.metrics.cost)}</td>
                        <td>{formatNumber(campaign.metrics.conversions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAnalytics; 