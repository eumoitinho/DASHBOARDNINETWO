"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';

const CustomChart = ({ 
  config, 
  clientSlug, 
  onEdit, 
  onDelete, 
  onDuplicate,
  isEditable = true 
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [config, clientSlug]);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/charts/data/${clientSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: config.metrics,
          period: config.period,
          groupBy: config.groupBy,
          filters: config.filters
        })
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        // Generate mock data if API fails
        setData(generateMockData());
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err.message);
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const days = config.period === '7d' ? 7 : config.period === '30d' ? 30 : 90;
    const mockData = [];
    
    const metricsOptions = [
      { id: 'impressions', type: 'number' },
      { id: 'clicks', type: 'number' },
      { id: 'cost', type: 'currency' },
      { id: 'conversions', type: 'number' },
      { id: 'ctr', type: 'percentage' },
      { id: 'cpc', type: 'currency' },
      { id: 'cpm', type: 'currency' },
      { id: 'sessions', type: 'number' },
      { id: 'users', type: 'number' },
      { id: 'pageviews', type: 'number' },
      { id: 'bounceRate', type: 'percentage' },
      { id: 'roas', type: 'number' }
    ];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const entry = {
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
      };

      config.metrics.forEach(metricId => {
        const metric = metricsOptions.find(m => m.id === metricId);
        if (metric) {
          switch (metric.type) {
            case 'currency':
              entry[metricId] = Math.random() * 1000 + 100;
              break;
            case 'percentage':
              entry[metricId] = Math.random() * 10 + 1;
              break;
            default:
              entry[metricId] = Math.floor(Math.random() * 1000) + 50;
          }
        }
      });

      mockData.push(entry);
    }
    
    return mockData;
  };

  const formatValue = (value, metricId) => {
    const metricTypes = {
      cost: 'currency',
      cpc: 'currency',
      cpm: 'currency',
      ctr: 'percentage',
      bounceRate: 'percentage',
      conversionRate: 'percentage'
    };

    const type = metricTypes[metricId] || 'number';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(2)}%`;
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
    return colorSchemes[config.style.color] || colorSchemes.primary;
  };

  const getChartHeight = () => {
    switch (config.style.height) {
      case 'small': return 200;
      case 'medium': return 300;
      case 'large': return 400;
      default: return 300;
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: getChartHeight() }}>
          <div className="spinner-border" style={{color: '#D00054'}}></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: getChartHeight() }}>
          <Icon icon="solar:danger-circle-bold" className="text-danger mb-2" size={32} />
          <p className="text-muted mb-0">Erro ao carregar dados</p>
          <button className="btn btn-sm btn-outline-primary mt-2" onClick={fetchChartData}>
            <Icon icon="solar:refresh-bold" className="me-1" />
            Tentar novamente
          </button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: getChartHeight() }}>
          <p className="text-muted">Nenhum dado disponível</p>
        </div>
      );
    }

    const colors = getColors();
    const height = getChartHeight();

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip formatter={(value, name) => [formatValue(value, name), getMetricName(name)]} />
              <Legend />
              {config.metrics.map((metricId, index) => (
                <Line
                  key={metricId}
                  type="monotone"
                  dataKey={metricId}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={getMetricName(metricId)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip formatter={(value, name) => [formatValue(value, name), getMetricName(name)]} />
              <Legend />
              {config.metrics.map((metricId, index) => (
                <Bar
                  key={metricId}
                  dataKey={metricId}
                  fill={colors[index % colors.length]}
                  name={getMetricName(metricId)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip formatter={(value, name) => [formatValue(value, name), getMetricName(name)]} />
              <Legend />
              {config.metrics.map((metricId, index) => (
                <Area
                  key={metricId}
                  type="monotone"
                  dataKey={metricId}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                  name={getMetricName(metricId)}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const firstMetric = config.metrics[0];
        if (!firstMetric) return null;

        const pieData = data.slice(-7).map((item, index) => ({
          name: item.formattedDate,
          value: item[firstMetric],
          fill: colors[index % colors.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={height * 0.3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${formatValue(value, firstMetric)}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatValue(value, firstMetric)} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getMetricName = (metricId) => {
    const metricNames = {
      impressions: 'Impressões',
      clicks: 'Cliques',
      cost: 'Custo',
      conversions: 'Conversões',
      ctr: 'CTR (%)',
      cpc: 'CPC',
      cpm: 'CPM',
      sessions: 'Sessões',
      users: 'Usuários',
      pageviews: 'Visualizações',
      bounceRate: 'Taxa de Rejeição',
      roas: 'ROAS'
    };
    return metricNames[metricId] || metricId;
  };

  const getWidthClass = () => {
    switch (config.style.width) {
      case 'quarter': return 'col-lg-3 col-md-6';
      case 'half': return 'col-lg-6';
      case 'full': return 'col-12';
      default: return 'col-lg-6';
    }
  };

  return (
    <div className={`${getWidthClass()} mb-24`}>
      <div className="card h-100">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div>
            <h6 className="card-title mb-0">{config.name}</h6>
            <small className="text-muted">
              {config.period === '7d' ? 'Últimos 7 dias' : 
               config.period === '30d' ? 'Últimos 30 dias' : 
               'Últimos 90 dias'}
            </small>
          </div>
          {isEditable && (
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-light dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <Icon icon="solar:menu-dots-bold" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item" onClick={() => onEdit(config)}>
                    <Icon icon="solar:pen-bold" className="me-2" />
                    Editar
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => onDuplicate(config)}>
                    <Icon icon="solar:copy-bold" className="me-2" />
                    Duplicar
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={fetchChartData}>
                    <Icon icon="solar:refresh-bold" className="me-2" />
                    Atualizar
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={() => onDelete(config.id)}
                  >
                    <Icon icon="solar:trash-bin-bold" className="me-2" />
                    Excluir
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="card-body">
          {renderChart()}
        </div>
        <div className="card-footer">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-muted">
              {config.metrics.length} métrica{config.metrics.length !== 1 ? 's' : ''}
            </small>
            <small className="text-muted">
              Atualizado: {new Date().toLocaleTimeString('pt-BR')}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomChart;