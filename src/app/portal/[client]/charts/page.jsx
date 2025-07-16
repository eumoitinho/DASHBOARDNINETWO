"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientPortalLayout from '@/components/client-portal/ClientPortalLayout';
import ChartBuilder from '@/components/charts/ChartBuilder';
import CustomChart from '@/components/charts/CustomChart';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const ChartsPage = () => {
  const params = useParams();
  const clientSlug = params?.client;
  const { data: session } = useSession();
  const [clientData, setClientData] = useState(null);
  const [customCharts, setCustomCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingChart, setEditingChart] = useState(null);

  // Fetch client data and custom charts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${clientSlug}`);
        if (clientResponse.ok) {
          const clientResult = await clientResponse.json();
          setClientData(clientResult.data);
        }

        // Fetch custom charts
        const chartsResponse = await fetch(`/api/charts/${clientSlug}`);
        if (chartsResponse.ok) {
          const chartsResult = await chartsResponse.json();
          setCustomCharts(chartsResult.data || []);
        } else {
          // Use default charts if none exist
          setCustomCharts(getDefaultCharts());
        }
      } catch (err) {
        setError(err.message);
        setCustomCharts(getDefaultCharts());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientSlug]);

  const getDefaultCharts = () => {
    return [
      {
        id: 'default_performance',
        name: 'Performance Geral',
        type: 'line',
        metrics: ['impressions', 'clicks', 'cost'],
        period: '30d',
        groupBy: 'date',
        filters: {},
        style: {
          width: 'full',
          height: 'medium',
          color: 'primary'
        }
      },
      {
        id: 'default_conversions',
        name: 'Conversões e CTR',
        type: 'bar',
        metrics: ['conversions', 'ctr'],
        period: '30d',
        groupBy: 'date',
        filters: {},
        style: {
          width: 'half',
          height: 'medium',
          color: 'success'
        }
      },
      {
        id: 'default_costs',
        name: 'Análise de Custos',
        type: 'area',
        metrics: ['cpc', 'cpm'],
        period: '30d',
        groupBy: 'date',
        filters: {},
        style: {
          width: 'half',
          height: 'medium',
          color: 'warning'
        }
      }
    ];
  };

  const handleSaveChart = async (chartConfig) => {
    try {
      
      const response = await fetch(`/api/charts/${clientSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chartConfig)
      });

      if (response.ok) {
        const result = await response.json();
        if (editingChart) {
          // Update existing chart
          setCustomCharts(prev => 
            prev.map(chart => 
              chart.id === editingChart.id ? result.data : chart
            )
          );
        } else {
          // Add new chart
          setCustomCharts(prev => [...prev, result.data]);
        }
        setShowBuilder(false);
        setEditingChart(null);
      } else {
        throw new Error('Erro ao salvar gráfico');
      }
    } catch (err) {
      setError(err.message);
      // For demo, just add to local state
      if (editingChart) {
        setCustomCharts(prev => 
          prev.map(chart => 
            chart.id === editingChart.id ? chartConfig : chart
          )
        );
      } else {
        setCustomCharts(prev => [...prev, chartConfig]);
      }
      setShowBuilder(false);
      setEditingChart(null);
    }
  };

  const handleEditChart = (chart) => {
    setEditingChart(chart);
    setShowBuilder(true);
  };

  const handleDeleteChart = async (chartId) => {
    if (!window.confirm('Tem certeza que deseja excluir este gráfico?')) {
      return;
    }

    try {
      
      const response = await fetch(`/api/charts/${clientSlug}/${chartId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCustomCharts(prev => prev.filter(chart => chart.id !== chartId));
      } else {
        throw new Error('Erro ao excluir gráfico');
      }
    } catch (err) {
      setError(err.message);
      // For demo, just remove from local state
      setCustomCharts(prev => prev.filter(chart => chart.id !== chartId));
    }
  };

  const handleDuplicateChart = (chart) => {
    const duplicatedChart = {
      ...chart,
      id: `${chart.id}_copy_${Date.now()}`,
      name: `${chart.name} (Cópia)`
    };
    setCustomCharts(prev => [...prev, duplicatedChart]);
  };

  const handleNewChart = () => {
    setEditingChart(null);
    setShowBuilder(true);
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingChart(null);
  };

  if (loading) {
    return (
      <ClientPortalLayout clientData={clientData}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando gráficos...</p>
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
          Erro ao carregar gráficos: {error}
        </div>
      </ClientPortalLayout>
    );
  }

  if (showBuilder) {
    return (
      <ClientPortalLayout clientData={clientData}>
        <div className="row mb-24">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-8">
                  {editingChart ? 'Editar Gráfico' : 'Criar Novo Gráfico'}
                </h4>
                <p className="text-secondary-light mb-0">
                  Configure as métricas e visualização do seu gráfico personalizado
                </p>
              </div>
            </div>
          </div>
        </div>

        <ChartBuilder
          clientSlug={clientSlug}
          onSave={handleSaveChart}
          onCancel={handleCancelBuilder}
          editChart={editingChart}
        />
      </ClientPortalLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'client']}>
      <ClientAccessGuard clientSlug={clientSlug}>
        <ClientPortalLayout clientData={clientData}>
      {/* Page Header */}
      <div className="row mb-24">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="card-title mb-8">Gráficos Personalizados</h4>
                  <p className="text-secondary-light mb-0">
                    Crie e gerencie visualizações customizadas das suas métricas
                  </p>
                </div>
                <div className="d-flex align-items-center gap-12">
                  <button 
                    className="btn btn-primary"
                    onClick={handleNewChart}
                  >
                    <Icon icon="solar:add-circle-bold" className="me-2" />
                    Novo Gráfico
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Summary */}
      <div className="row mb-24">
        <div className="col-xxl-3 col-sm-6 mb-24">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-primary-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:chart-2-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Total Gráficos</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {customCharts.length}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  Ativos
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
                    <Icon icon="solar:database-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Métricas</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {customCharts.reduce((total, chart) => total + chart.metrics.length, 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-info-focus text-info-main px-1 rounded-2 fw-semibold text-xs">
                  Monitoradas
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
                    <Icon icon="solar:pie-chart-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Tipos</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {[...new Set(customCharts.map(chart => chart.type))].length}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-warning-focus text-warning-main px-1 rounded-2 fw-semibold text-xs">
                  Diferentes
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
                    <Icon icon="solar:refresh-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Última Atualização</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">Agora</h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  Tempo real
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Charts Grid */}
      {customCharts.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <Icon icon="solar:chart-2-bold" className="text-muted mb-3" size={64} />
                <h5 className="mb-3">Nenhum gráfico personalizado</h5>
                <p className="text-muted mb-4">
                  Comece criando seu primeiro gráfico personalizado para monitorar suas métricas específicas.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={handleNewChart}
                >
                  <Icon icon="solar:add-circle-bold" className="me-2" />
                  Criar Primeiro Gráfico
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {customCharts.map((chart) => (
            <CustomChart
              key={chart.id}
              config={chart}
              clientSlug={clientSlug}
              onEdit={handleEditChart}
              onDelete={handleDeleteChart}
              onDuplicate={handleDuplicateChart}
              isEditable={true}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-3">Ações Rápidas</h6>
              <div className="d-flex flex-wrap gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    const perfChart = {
                      id: `quick_performance_${Date.now()}`,
                      name: 'Performance Rápida',
                      type: 'line',
                      metrics: ['impressions', 'clicks', 'conversions'],
                      period: '7d',
                      groupBy: 'date',
                      filters: {},
                      style: { width: 'full', height: 'medium', color: 'primary' }
                    };
                    setCustomCharts(prev => [...prev, perfChart]);
                  }}
                >
                  <Icon icon="solar:chart-bold" className="me-1" />
                  Gráfico de Performance
                </button>
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => {
                    const costChart = {
                      id: `quick_costs_${Date.now()}`,
                      name: 'Análise de Custos',
                      type: 'bar',
                      metrics: ['cost', 'cpc', 'cpm'],
                      period: '30d',
                      groupBy: 'date',
                      filters: {},
                      style: { width: 'half', height: 'medium', color: 'warning' }
                    };
                    setCustomCharts(prev => [...prev, costChart]);
                  }}
                >
                  <Icon icon="solar:dollar-minimalistic-bold" className="me-1" />
                  Gráfico de Custos
                </button>
                <button 
                  className="btn btn-outline-info btn-sm"
                  onClick={() => {
                    const analyticsChart = {
                      id: `quick_analytics_${Date.now()}`,
                      name: 'Analytics Rápido',
                      type: 'area',
                      metrics: ['sessions', 'users', 'pageviews'],
                      period: '30d',
                      groupBy: 'date',
                      filters: {},
                      style: { width: 'half', height: 'medium', color: 'info' }
                    };
                    setCustomCharts(prev => [...prev, analyticsChart]);
                  }}
                >
                  <Icon icon="solar:graph-bold" className="me-1" />
                  Gráfico Analytics
                </button>
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

export default ChartsPage;