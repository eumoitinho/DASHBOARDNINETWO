"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientPortalLayout from '@/components/client-portal/ClientPortalLayout';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const AnalyticsPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const [clientData, setClientData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  // Fetch client data and analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clientSlug = params.client;

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${clientSlug}`);
        if (clientResponse.ok) {
          const clientResult = await clientResponse.json();
          setClientData(clientResult.data);
        }

        // Fetch analytics data
        const analyticsResponse = await fetch(`/api/analytics/${clientSlug}?period=${period}`);
        if (analyticsResponse.ok) {
          const analyticsResult = await analyticsResponse.json();
          setAnalyticsData(analyticsResult.data);
        } else {
          setError('Erro ao carregar dados de analytics');
          setAnalyticsData(null);
        }
      } catch (err) {
        setError(err.message);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.client, period]);


  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <ClientPortalLayout clientData={clientData}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando analytics...</p>
          </div>
        </div>
      </ClientPortalLayout>
    );
  }

  if (error) {
    return (
      <ClientPortalLayout clientData={clientData}>
        <div className="alert alert-danger">
          <Icon icon="solar:danger-circle-bold" className="me-2" />
          Erro ao carregar analytics: {error}
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'client']}>
      <ClientAccessGuard clientSlug={params.client}>
        <ClientPortalLayout clientData={clientData}>
          {/* Page Header */}
          <div className="row mb-24">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-20">
                    <div>
                      <h4 className="card-title mb-8">Google Analytics</h4>
                      <p className="text-secondary-light mb-0">
                        Acompanhe o comportamento dos visitantes em seu site
                      </p>
                    </div>
                <div className="d-flex align-items-center gap-12">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${period === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setPeriod('7d')}
                    >
                      7 dias
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${period === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setPeriod('30d')}
                    >
                      30 dias
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${period === '90d' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setPeriod('90d')}
                    >
                      90 dias
                    </button>
                  </div>
                  <button className="btn btn-outline-primary btn-sm">
                    <Icon icon="solar:refresh-bold" className="me-2" />
                    Atualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row mb-24">
        <div className="col-xxl-3 col-sm-6 mb-24">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-primary-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:users-group-two-rounded-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Usuários</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(analyticsData?.overview?.users || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  +12% vs. período anterior
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6 mb-24">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-success-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:chart-2-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Sessões</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(analyticsData?.overview?.sessions || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  +8% vs. período anterior
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6 mb-24">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-warning-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:document-text-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Pageviews</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(analyticsData?.overview?.pageviews || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  +15% vs. período anterior
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-sm-6 mb-24">
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
                {formatNumber(analyticsData?.overview?.conversions || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  {analyticsData?.overview?.conversionRate?.toFixed(2) || 0}% taxa
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="row">
        {/* Traffic Sources */}
        <div className="col-lg-6 mb-24">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Fontes de Tráfego</h6>
            </div>
            <div className="card-body">
              {analyticsData?.trafficSources?.map((source, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between mb-16">
                  <div className="d-flex align-items-center gap-2">
                    <div className={`w-12-px h-12-px rounded-circle bg-${['primary', 'success', 'warning', 'info', 'secondary'][index % 5]}-600`}></div>
                    <span className="text-secondary-light">{source.source}</span>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold text-primary-light">{formatNumber(source.sessions)}</div>
                    <small className="text-secondary-light">{source.percentage}%</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Types */}
        <div className="col-lg-6 mb-24">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Dispositivos</h6>
            </div>
            <div className="card-body">
              {analyticsData?.devices?.map((device, index) => (
                <div key={index} className="d-flex align-items-center justify-content-between mb-16">
                  <div className="d-flex align-items-center gap-2">
                    <Icon 
                      icon={device.device === 'Mobile' ? 'solar:phone-bold' : device.device === 'Desktop' ? 'solar:monitor-bold' : 'solar:tablet-bold'} 
                      className="text-secondary-light text-lg" 
                    />
                    <span className="text-secondary-light">{device.device}</span>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold text-primary-light">{formatNumber(device.sessions)}</div>
                    <small className="text-secondary-light">{device.percentage}%</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="col-lg-8 mb-24">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Páginas Mais Visitadas</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Página</th>
                      <th>Visualizações</th>
                      <th>Usuários Únicos</th>
                      <th>Tempo Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.topPages?.map((page, index) => (
                      <tr key={index}>
                        <td>
                          <span className="fw-semibold text-primary-light">{page.page}</span>
                        </td>
                        <td>{formatNumber(page.views)}</td>
                        <td>{formatNumber(page.users)}</td>
                        <td>{formatDuration(page.avgTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="col-lg-4 mb-24">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Métricas Principais</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-20">
                <span className="text-secondary-light">Taxa de Rejeição</span>
                <span className="fw-semibold text-warning">
                  {analyticsData?.overview?.bounceRate?.toFixed(1) || 0}%
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between mb-20">
                <span className="text-secondary-light">Duração Média da Sessão</span>
                <span className="fw-semibold text-info">
                  {formatDuration(analyticsData?.overview?.avgSessionDuration || 0)}
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between mb-20">
                <span className="text-secondary-light">Taxa de Conversão</span>
                <span className="fw-semibold text-success">
                  {analyticsData?.overview?.conversionRate?.toFixed(2) || 0}%
                </span>
              </div>
              
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-secondary-light">Receita Total</span>
                <span className="fw-semibold text-primary">
                  {formatCurrency(analyticsData?.overview?.revenue || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Objetivos e Conversões</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Objetivo</th>
                      <th>Conversões</th>
                      <th>Valor por Conversão</th>
                      <th>Valor Total</th>
                      <th>Taxa de Conversão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.goals?.map((goal, index) => (
                      <tr key={index}>
                        <td className="fw-semibold text-primary-light">{goal.name}</td>
                        <td>{formatNumber(goal.completions)}</td>
                        <td>{formatCurrency(goal.value)}</td>
                        <td className="fw-semibold">{formatCurrency(goal.completions * goal.value)}</td>
                        <td>
                          <span className="badge bg-success-100 text-success-main">
                            {((goal.completions / (analyticsData?.overview?.sessions || 1)) * 100).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
        </ClientPortalLayout>
      </ClientAccessGuard>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;