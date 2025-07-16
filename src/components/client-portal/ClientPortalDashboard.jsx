"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientPortalLayout from './ClientPortalLayout';

const ClientPortalDashboard = ({ clientSlug }) => {
  const { data: session } = useSession();
  const [clientData, setClientData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch client data from database
        const clientResponse = await fetch(`/api/clients/${clientSlug}`);
        if (!clientResponse.ok) {
          throw new Error('Cliente não encontrado');
        }
        
        const clientResult = await clientResponse.json();
        if (!clientResult.success) {
          throw new Error(clientResult.message || 'Erro ao carregar dados do cliente');
        }
        
        setClientData(clientResult.data);

        // Fetch dashboard data from database and APIs
        const dashboardResponse = await fetch(`/api/dashboard/${clientSlug}?period=${period}`);
        if (dashboardResponse.ok) {
          const dashboardResult = await dashboardResponse.json();
          if (dashboardResult.success) {
            setDashboardData(dashboardResult.data);
          } else {
            throw new Error(dashboardResult.message || 'Erro ao carregar dados do dashboard');
          }
        } else {
          throw new Error('Erro ao conectar com a API do dashboard');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientSlug) {
      fetchClientData();
    }
  }, [clientSlug, period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p>Carregando dashboard do cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <Icon icon="solar:danger-circle-bold" className="text-danger mb-3" size={48} />
          <h5>Erro ao carregar dados</h5>
          <p className="text-muted">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientPortalLayout clientData={clientData}>
      {/* Period Filter */}
      <div className="row mb-24">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="card-title mb-0">Dashboard - {clientData.name}</h6>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${period === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePeriodChange('7d')}
                  >
                    7 dias
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${period === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePeriodChange('30d')}
                  >
                    30 dias
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${period === '90d' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePeriodChange('90d')}
                  >
                    90 dias
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row mb-24">
        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-primary-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:eye-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Impressões</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(dashboardData?.summary?.totalImpressions || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  +12%
                </span>
                vs. período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-success-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:cursor-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Cliques</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(dashboardData?.summary?.totalClicks || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  +8%
                </span>
                vs. período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-warning-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:dollar-minimalistic-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Investimento</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatCurrency(dashboardData?.summary?.totalCost || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  -5%
                </span>
                vs. período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-purple-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:target-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Conversões</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(dashboardData?.summary?.totalConversions || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  +25%
                </span>
                vs. período anterior
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="row mb-24">
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Performance das Campanhas</h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Campanha</th>
                      <th>Plataforma</th>
                      <th>Impressões</th>
                      <th>Cliques</th>
                      <th>CTR</th>
                      <th>Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.campaigns?.map((campaign, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{campaign.campaignName}</td>
                        <td>
                          <span className={`badge ${campaign.platform === 'google_ads' ? 'bg-primary' : 'bg-info'}`}>
                            {campaign.platform === 'google_ads' ? 'Google Ads' : 'Facebook'}
                          </span>
                        </td>
                        <td>{formatNumber(campaign.metrics.impressions)}</td>
                        <td>{formatNumber(campaign.metrics.clicks)}</td>
                        <td>{campaign.metrics.ctr.toFixed(2)}%</td>
                        <td>{formatCurrency(campaign.metrics.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Métricas Principais</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <span className="text-secondary-light">CTR Médio</span>
                <span className="fw-semibold text-primary-light">
                  {dashboardData?.summary?.averageCTR?.toFixed(2)}%
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between mb-16">
                <span className="text-secondary-light">CPC Médio</span>
                <span className="fw-semibold text-primary-light">
                  {formatCurrency(dashboardData?.summary?.averageCPC || 0)}
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between mb-16">
                <span className="text-secondary-light">CPM Médio</span>
                <span className="fw-semibold text-primary-light">
                  {formatCurrency(dashboardData?.summary?.averageCPM || 0)}
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between mb-16">
                <span className="text-secondary-light">Taxa de Conversão</span>
                <span className="fw-semibold text-primary-light">
                  {dashboardData?.summary?.averageConversionRate?.toFixed(2)}%
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-secondary-light">ROAS</span>
                <span className="fw-semibold text-success">
                  {dashboardData?.summary?.totalROAS?.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      {dashboardData?.lastUpdated && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-success">
              <Icon icon="solar:check-circle-bold" className="me-2" />
              <strong>Dados em Tempo Real:</strong> Última atualização em {new Date(dashboardData.lastUpdated).toLocaleString('pt-BR')}.
              Os dados são atualizados automaticamente a cada hora.
            </div>
          </div>
        </div>
      )}
    </ClientPortalLayout>
  );
};

export default ClientPortalDashboard;