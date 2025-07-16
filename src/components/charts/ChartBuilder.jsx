"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';

const ChartBuilder = ({ clientSlug, onSave, onCancel, editChart = null }) => {
  const [chartConfig, setChartConfig] = useState({
    id: editChart?.id || `chart_${Date.now()}`,
    name: editChart?.name || '',
    type: editChart?.type || 'line',
    metrics: editChart?.metrics || [],
    period: editChart?.period || '30d',
    groupBy: editChart?.groupBy || 'date',
    filters: editChart?.filters || {},
    style: editChart?.style || {
      width: 'full', // full, half, quarter
      height: 'medium', // small, medium, large
      color: 'primary'
    }
  });

  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Métricas disponíveis
  const metricsOptions = [
    // Google Ads
    { id: 'impressions', name: 'Impressões', source: 'google_ads', type: 'number' },
    { id: 'clicks', name: 'Cliques', source: 'google_ads', type: 'number' },
    { id: 'cost', name: 'Custo', source: 'google_ads', type: 'currency' },
    { id: 'conversions', name: 'Conversões', source: 'google_ads', type: 'number' },
    { id: 'ctr', name: 'CTR (%)', source: 'google_ads', type: 'percentage' },
    { id: 'cpc', name: 'CPC', source: 'google_ads', type: 'currency' },
    { id: 'cpm', name: 'CPM', source: 'google_ads', type: 'currency' },
    
    // Facebook Ads
    { id: 'fb_impressions', name: 'Impressões (FB)', source: 'facebook_ads', type: 'number' },
    { id: 'fb_clicks', name: 'Cliques (FB)', source: 'facebook_ads', type: 'number' },
    { id: 'fb_spend', name: 'Gasto (FB)', source: 'facebook_ads', type: 'currency' },
    { id: 'fb_reach', name: 'Alcance (FB)', source: 'facebook_ads', type: 'number' },
    
    // Google Analytics
    { id: 'sessions', name: 'Sessões', source: 'google_analytics', type: 'number' },
    { id: 'users', name: 'Usuários', source: 'google_analytics', type: 'number' },
    { id: 'pageviews', name: 'Visualizações', source: 'google_analytics', type: 'number' },
    { id: 'bounceRate', name: 'Taxa de Rejeição', source: 'google_analytics', type: 'percentage' },
    { id: 'avgSessionDuration', name: 'Duração Média', source: 'google_analytics', type: 'duration' },
    
    // Métricas calculadas
    { id: 'roas', name: 'ROAS', source: 'calculated', type: 'number' },
    { id: 'cpl', name: 'Custo por Lead', source: 'calculated', type: 'currency' },
    { id: 'conversionRate', name: 'Taxa de Conversão', source: 'calculated', type: 'percentage' }
  ];

  useEffect(() => {
    setAvailableMetrics(metricsOptions);
    if (chartConfig.metrics.length > 0) {
      generatePreview();
    }
  }, [chartConfig.metrics, chartConfig.period, chartConfig.groupBy]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      // Fetch data for preview
      const response = await fetch(`/api/charts/preview/${clientSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: chartConfig.metrics,
          period: chartConfig.period,
          groupBy: chartConfig.groupBy,
          filters: chartConfig.filters
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPreviewData(result.data);
      } else {
        // Generate mock preview data
        setPreviewData(generateMockData());
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const days = chartConfig.period === '7d' ? 7 : chartConfig.period === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const entry = {
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
      };

      chartConfig.metrics.forEach(metricId => {
        const metric = metricsOptions.find(m => m.id === metricId);
        if (metric) {
          switch (metric.type) {
            case 'currency':
              entry[metricId] = Math.random() * 1000 + 100;
              break;
            case 'percentage':
              entry[metricId] = Math.random() * 10 + 1;
              break;
            case 'duration':
              entry[metricId] = Math.random() * 300 + 60;
              break;
            default:
              entry[metricId] = Math.floor(Math.random() * 1000) + 50;
          }
        }
      });

      data.push(entry);
    }
    
    return data;
  };

  const handleMetricToggle = (metricId) => {
    setChartConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleConfigChange = (field, value) => {
    setChartConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStyleChange = (field, value) => {
    setChartConfig(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (!chartConfig.name || chartConfig.metrics.length === 0) {
      alert('Por favor, defina um nome e selecione pelo menos uma métrica.');
      return;
    }

    onSave(chartConfig);
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'duration':
        return `${Math.floor(value / 60)}m ${Math.floor(value % 60)}s`;
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  };

  const getColors = () => {
    const colorSchemes = {
      primary: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
      success: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
      warning: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
      info: ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63']
    };
    return colorSchemes[chartConfig.style.color] || colorSchemes.primary;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border" style={{color: '#D00054'}}></div>
        </div>
      );
    }

    if (previewData.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <p className="text-muted">Selecione métricas para visualizar o gráfico</p>
        </div>
      );
    }

    const colors = getColors();

    switch (chartConfig.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                const metric = metricsOptions.find(m => m.id === name);
                return [formatValue(value, metric?.type), metric?.name];
              }} />
              <Legend />
              {chartConfig.metrics.map((metricId, index) => {
                const metric = metricsOptions.find(m => m.id === metricId);
                return (
                  <Line
                    key={metricId}
                    type="monotone"
                    dataKey={metricId}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={metric?.name}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                const metric = metricsOptions.find(m => m.id === name);
                return [formatValue(value, metric?.type), metric?.name];
              }} />
              <Legend />
              {chartConfig.metrics.map((metricId, index) => {
                const metric = metricsOptions.find(m => m.id === metricId);
                return (
                  <Bar
                    key={metricId}
                    dataKey={metricId}
                    fill={colors[index % colors.length]}
                    name={metric?.name}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                const metric = metricsOptions.find(m => m.id === name);
                return [formatValue(value, metric?.type), metric?.name];
              }} />
              <Legend />
              {chartConfig.metrics.map((metricId, index) => {
                const metric = metricsOptions.find(m => m.id === metricId);
                return (
                  <Area
                    key={metricId}
                    type="monotone"
                    dataKey={metricId}
                    stackId="1"
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.6}
                    name={metric?.name}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        // Para pie chart, usar apenas a primeira métrica
        const firstMetric = chartConfig.metrics[0];
        if (!firstMetric) return null;

        const pieData = previewData.slice(-7).map((item, index) => ({
          name: item.formattedDate,
          value: item[firstMetric],
          fill: colors[index % colors.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => {
                  const metric = metricsOptions.find(m => m.id === firstMetric);
                  return `${name}: ${formatValue(value, metric?.type)}`;
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => {
                const metric = metricsOptions.find(m => m.id === firstMetric);
                return formatValue(value, metric?.type);
              }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chart-builder">
      <div className="row">
        {/* Configuration Panel */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Configurações do Gráfico</h6>
            </div>
            <div className="card-body">
              {/* Chart Name */}
              <div className="mb-3">
                <label className="form-label">Nome do Gráfico</label>
                <input
                  type="text"
                  className="form-control"
                  value={chartConfig.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  placeholder="Ex: Performance de Campanhas"
                />
              </div>

              {/* Chart Type */}
              <div className="mb-3">
                <label className="form-label">Tipo de Gráfico</label>
                <select
                  className="form-select"
                  value={chartConfig.type}
                  onChange={(e) => handleConfigChange('type', e.target.value)}
                >
                  <option value="line">Linha</option>
                  <option value="bar">Barras</option>
                  <option value="area">Área</option>
                  <option value="pie">Pizza</option>
                </select>
              </div>

              {/* Period */}
              <div className="mb-3">
                <label className="form-label">Período</label>
                <select
                  className="form-select"
                  value={chartConfig.period}
                  onChange={(e) => handleConfigChange('period', e.target.value)}
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                </select>
              </div>

              {/* Chart Style */}
              <div className="mb-3">
                <label className="form-label">Tamanho</label>
                <select
                  className="form-select"
                  value={chartConfig.style.width}
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                >
                  <option value="quarter">1/4 da largura</option>
                  <option value="half">1/2 da largura</option>
                  <option value="full">Largura completa</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Altura</label>
                <select
                  className="form-select"
                  value={chartConfig.style.height}
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                >
                  <option value="small">Pequeno</option>
                  <option value="medium">Médio</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Esquema de Cores</label>
                <select
                  className="form-select"
                  value={chartConfig.style.color}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                >
                  <option value="primary">Azul (Primário)</option>
                  <option value="success">Verde</option>
                  <option value="warning">Laranja</option>
                  <option value="info">Ciano</option>
                </select>
              </div>

              {/* Metrics Selection */}
              <div className="mb-3">
                <label className="form-label">Métricas</label>
                <div className="metrics-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {metricsOptions.map(metric => (
                    <div key={metric.id} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={metric.id}
                        checked={chartConfig.metrics.includes(metric.id)}
                        onChange={() => handleMetricToggle(metric.id)}
                      />
                      <label className="form-check-label" htmlFor={metric.id}>
                        <span className="fw-semibold">{metric.name}</span>
                        <br />
                        <small className="text-muted">{metric.source.replace('_', ' ')}</small>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!chartConfig.name || chartConfig.metrics.length === 0}
                >
                  <Icon icon="solar:check-circle-bold" className="me-2" />
                  Salvar Gráfico
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={onCancel}
                >
                  <Icon icon="solar:close-circle-bold" className="me-2" />
                  Cancelar
                </button>
                {chartConfig.metrics.length > 0 && (
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={generatePreview}
                  >
                    <Icon icon="solar:refresh-bold" className="me-2" />
                    Atualizar Preview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="card-title mb-0">Preview do Gráfico</h6>
              {chartConfig.name && (
                <small className="text-muted">"{chartConfig.name}"</small>
              )}
            </div>
            <div className="card-body">
              {renderChart()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartBuilder;