"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientPortalLayout from '@/components/client-portal/ClientPortalLayout';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const CampanhasPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const [clientData, setClientData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    platform: 'all', // all, google_ads, facebook
    status: 'all', // all, active, paused, ended
    period: '30d' // 7d, 30d, 90d
  });

  // Fetch client data and campaigns
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

        // Fetch campaigns data
        const campaignsResponse = await fetch(`/api/campaigns/${clientSlug}?period=${filter.period}&platform=${filter.platform}&status=${filter.status}`);
        if (campaignsResponse.ok) {
          const campaignsResult = await campaignsResponse.json();
          setCampaigns(campaignsResult.data || []);
        } else {
          setError('Erro ao carregar campanhas');
          setCampaigns([]);
        }
      } catch (err) {
        setError(err.message);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.client, filter.period, filter.platform, filter.status]);


  const handleFilterChange = (filterType, value) => {
    setFilter(prev => ({
      ...prev,
      [filterType]: value
    }));
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlatformInfo = (platform) => {
    const platforms = {
      google_ads: {
        name: 'Google Ads',
        icon: 'logos:google-ads',
        color: 'primary',
        bgColor: 'bg-primary-100'
      },
      facebook: {
        name: 'Facebook Ads',
        icon: 'logos:facebook',
        color: 'info',
        bgColor: 'bg-info-100'
      }
    };
    return platforms[platform] || platforms.google_ads;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      active: { name: 'Ativa', color: 'success', icon: 'solar:play-circle-bold' },
      paused: { name: 'Pausada', color: 'warning', icon: 'solar:pause-circle-bold' },
      ended: { name: 'Finalizada', color: 'secondary', icon: 'solar:stop-circle-bold' }
    };
    return statusMap[status] || statusMap.active;
  };

  if (loading) {
    return (
      <ClientPortalLayout clientData={clientData}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando campanhas...</p>
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
          Erro ao carregar campanhas: {error}
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
                  <h4 className="card-title mb-8">Campanhas Publicitárias</h4>
                  <p className="text-secondary-light mb-0">
                    Gerencie e monitore suas campanhas do Google Ads e Facebook Ads
                  </p>
                </div>
                <div className="d-flex align-items-center gap-12">
                  <button className="btn btn-outline-primary btn-sm">
                    <Icon icon="solar:refresh-bold" className="me-2" />
                    Sincronizar
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <Icon icon="solar:add-circle-bold" className="me-2" />
                    Nova Campanha
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="row">
                <div className="col-lg-3 col-md-6 mb-12">
                  <label className="form-label text-sm fw-semibold">Plataforma</label>
                  <select 
                    className="form-select form-select-sm"
                    value={filter.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                  >
                    <option value="all">Todas as Plataformas</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="facebook">Facebook Ads</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-6 mb-12">
                  <label className="form-label text-sm fw-semibold">Status</label>
                  <select 
                    className="form-select form-select-sm"
                    value={filter.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativas</option>
                    <option value="paused">Pausadas</option>
                    <option value="ended">Finalizadas</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-6 mb-12">
                  <label className="form-label text-sm fw-semibold">Período</label>
                  <select 
                    className="form-select form-select-sm"
                    value={filter.period}
                    onChange={(e) => handleFilterChange('period', e.target.value)}
                  >
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-6 mb-12 d-flex align-items-end">
                  <button className="btn btn-outline-secondary btn-sm w-100">
                    <Icon icon="solar:filter-bold" className="me-2" />
                    Filtros Avançados
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Summary Cards */}
      <div className="row mb-24">
        <div className="col-xxl-3 col-sm-6 mb-24">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-primary-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:target-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Campanhas Ativas</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {campaigns.filter(c => c.status === 'active').length}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  {campaigns.filter(c => c.status === 'paused').length} pausadas
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
                    <Icon icon="solar:dollar-minimalistic-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Orçamento Total</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatCurrency(campaigns.reduce((sum, c) => sum + (c.budget || 0), 0))}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-info-focus text-info-main px-1 rounded-2 fw-semibold text-xs">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + (c.metrics?.cost || 0), 0))} gastos
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
                    <Icon icon="solar:cursor-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Total Cliques</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0))}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  CTR: {(campaigns.reduce((sum, c) => sum + (c.metrics?.ctr || 0), 0) / campaigns.length || 0).toFixed(2)}%
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
                    <Icon icon="solar:chart-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Conversões</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatNumber(campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0))}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  Taxa: {(campaigns.reduce((sum, c) => sum + (c.metrics?.conversionRate || 0), 0) / campaigns.length || 0).toFixed(2)}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Lista de Campanhas ({campaigns.length})</h6>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary btn-sm">
                  <Icon icon="solar:export-bold" className="me-1" />
                  Exportar
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Campanha</th>
                      <th>Plataforma</th>
                      <th>Status</th>
                      <th>Orçamento</th>
                      <th>Gastos</th>
                      <th>Impressões</th>
                      <th>Cliques</th>
                      <th>CTR</th>
                      <th>Conversões</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const platformInfo = getPlatformInfo(campaign.platform);
                      const statusInfo = getStatusInfo(campaign.status);
                      
                      return (
                        <tr key={campaign.campaignId}>
                          <td>
                            <div>
                              <div className="fw-semibold text-primary-light">{campaign.campaignName}</div>
                              <small className="text-secondary-light">
                                Início: {formatDate(campaign.startDate)}
                                {campaign.endDate && ` • Fim: ${formatDate(campaign.endDate)}`}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${platformInfo.bgColor} text-${platformInfo.color}`}>
                              <Icon icon={platformInfo.icon} className="me-1" />
                              {platformInfo.name}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${statusInfo.color}-100 text-${statusInfo.color}-main`}>
                              <Icon icon={statusInfo.icon} className="me-1" />
                              {statusInfo.name}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">{formatCurrency(campaign.budget)}</div>
                              <small className="text-secondary-light">
                                Diário: {formatCurrency(campaign.dailyBudget)}
                              </small>
                            </div>
                          </td>
                          <td className="fw-semibold">
                            {formatCurrency(campaign.metrics.cost)}
                          </td>
                          <td>{formatNumber(campaign.metrics.impressions)}</td>
                          <td>{formatNumber(campaign.metrics.clicks)}</td>
                          <td>
                            <span className={`fw-semibold ${campaign.metrics.ctr > 1 ? 'text-success' : 'text-warning'}`}>
                              {campaign.metrics.ctr.toFixed(2)}%
                            </span>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">{campaign.metrics.conversions}</div>
                              <small className="text-secondary-light">
                                Taxa: {campaign.metrics.conversionRate.toFixed(2)}%
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <button className="btn btn-outline-primary btn-sm">
                                <Icon icon="solar:eye-bold" />
                              </button>
                              <button className="btn btn-outline-secondary btn-sm">
                                <Icon icon="solar:settings-bold" />
                              </button>
                              <button className="btn btn-outline-info btn-sm">
                                <Icon icon="solar:chart-2-bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

export default CampanhasPage;