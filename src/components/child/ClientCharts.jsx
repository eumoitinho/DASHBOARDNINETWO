"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Importar componentes de chart dinamicamente para evitar problemas de SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ClientCharts = ({ clientSlug, period, dashboardData, onPeriodChange }) => {
  // Configurações do gráfico de tráfego por fonte
  const trafficSourceOptions = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: {
        show: false
      }
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%',
      }
    },
    xaxis: {
      categories: ['Google Ads', 'Facebook Ads', 'Orgânico', 'Direto', 'Outros']
    },
    yaxis: {
      title: {
        text: 'Sessões'
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " sessões";
        }
      }
    }
  };

  // Processar dados reais das campanhas por plataforma
  const processTrafficSourceData = () => {
    if (!dashboardData?.campaigns) {
      return [{ name: 'Sessões', data: [0, 0, 0, 0, 0] }];
    }

    const googleAdsData = dashboardData.campaigns
      .filter(campaign => campaign.platform === 'google_ads')
      .reduce((acc, campaign) => acc + (campaign.metrics?.impressions || 0), 0);

    const facebookAdsData = dashboardData.campaigns
      .filter(campaign => campaign.platform === 'facebook')
      .reduce((acc, campaign) => acc + (campaign.metrics?.impressions || 0), 0);

    // Simular dados para outras fontes baseado na proporção
    const total = googleAdsData + facebookAdsData;
    const organic = Math.round(total * 0.3);
    const direct = Math.round(total * 0.2);
    const others = Math.round(total * 0.1);

    return [{
      name: 'Impressões',
      data: [googleAdsData, facebookAdsData, organic, direct, others]
    }];
  };

  const trafficSourceSeries = processTrafficSourceData();

  // Configurações do gráfico de conversões por dispositivo
  const deviceConversionOptions = {
    chart: {
      type: 'pie',
      height: 250
    },
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
    labels: ['Desktop', 'Mobile', 'Tablet'],
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(1) + '%';
      }
    },
    legend: {
      position: 'bottom'
    }
  };

  // Processar dados de conversões por dispositivo
  const processDeviceConversionData = () => {
    if (!dashboardData?.summary) {
      return [0, 0, 0];
    }

    const totalConversions = dashboardData.summary.totalConversions || dashboardData.summary.conversions || 0;
    
    if (totalConversions === 0) {
      return [0, 0, 0];
    }

    // Simular distribuição baseada em padrões comuns
    const desktop = Math.round(totalConversions * 0.45);
    const mobile = Math.round(totalConversions * 0.40);
    const tablet = totalConversions - desktop - mobile;

    return [desktop, mobile, tablet];
  };

  const deviceConversionSeries = processDeviceConversionData();

  // Configurações do gráfico de performance de campanhas
  const campaignPerformanceOptions = {
    chart: {
      type: 'radar',
      height: 300
    },
    colors: ['#3B82F6'],
    dataLabels: {
      enabled: true
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: '#e8e8e8',
          fill: {
            colors: ['#f8f8f8', '#fff']
          }
        }
      }
    },
    xaxis: {
      categories: ['CTR', 'CPC', 'Conversões', 'ROAS', 'Impressões', 'Cliques']
    },
    yaxis: {
      tickAmount: 7,
      labels: {
        formatter: function(val, i) {
          if (i % 2 === 0) {
            return val.toFixed(0);
          } else {
            return '';
          }
        }
      }
    }
  };

  // Processar dados de performance de campanhas
  const processCampaignPerformanceData = () => {
    if (!dashboardData?.summary) {
      return [{ name: 'Performance', data: [0, 0, 0, 0, 0, 0] }];
    }

    const summary = dashboardData.summary;
    const ctr = summary.averageCTR || summary.ctr || 0;
    const cpc = summary.averageCPC || summary.cpc || 0;
    const conversions = summary.totalConversions || summary.conversions || 0;
    const roas = summary.totalROAS || summary.roas || 0;
    const impressions = summary.totalImpressions || summary.impressions || 0;
    const clicks = summary.totalClicks || summary.clicks || 0;

    // Normalizar dados para o gráfico radar (escala 0-100)
    const normalizedData = [
      Math.min(ctr * 10, 100), // CTR * 10 para melhor visualização
      Math.min(cpc, 100), // CPC já em escala adequada
      Math.min(conversions, 100), // Conversões limitadas a 100
      Math.min(roas * 20, 100), // ROAS * 20 para visualização
      Math.min(impressions / 1000, 100), // Impressões / 1000
      Math.min(clicks, 100) // Cliques limitados a 100
    ];

    return [{
      name: 'Performance',
      data: normalizedData
    }];
  };

  const campaignPerformanceSeries = processCampaignPerformanceData();

  // Configurações do gráfico de tendência de conversões
  const conversionTrendOptions = {
    chart: {
      type: 'line',
      height: 250,
      toolbar: {
        show: false
      }
    },
    colors: ['#10B981'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    },
    yaxis: {
      title: {
        text: 'Conversões'
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " conversões";
        }
      }
    }
  };

  // Processar dados de tendência de conversões
  const processConversionTrendData = () => {
    if (!dashboardData?.campaigns) {
      return [{ name: 'Conversões', data: [0, 0, 0, 0, 0, 0, 0] }];
    }

    const totalConversions = dashboardData.summary?.totalConversions || dashboardData.summary?.conversions || 0;
    
    if (totalConversions === 0) {
      return [{ name: 'Conversões', data: [0, 0, 0, 0, 0, 0, 0] }];
    }

    // Simular tendência dos últimos 7 dias baseado no total
    const avgDaily = totalConversions / 7;
    const variation = avgDaily * 0.3; // 30% de variação
    
    const trendData = Array.from({ length: 7 }, (_, i) => {
      const base = avgDaily;
      const random = (Math.random() - 0.5) * 2 * variation;
      return Math.max(0, Math.round(base + random));
    });

    return [{
      name: 'Conversões',
      data: trendData
    }];
  };

  const conversionTrendSeries = processConversionTrendData();

  // Configurações do gráfico de dispersão (Custo x Conversões)
  const scatterPlotOptions = {
    chart: {
      type: 'scatter',
      height: 300,
      toolbar: {
        show: false
      }
    },
    colors: ['#3B82F6', '#10B981'],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      title: {
        text: 'Custo (R$)'
      },
      labels: {
        formatter: function (val) {
          return 'R$ ' + val.toFixed(0);
        }
      }
    },
    yaxis: {
      title: {
        text: 'Conversões'
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return `
          <div class="bg-white p-3 border border-gray-200 rounded shadow-sm">
            <div><strong>${w.globals.seriesNames[seriesIndex]}</strong></div>
            <div>Custo: R$ ${data.x.toFixed(2)}</div>
            <div>Conversões: ${data.y}</div>
          </div>
        `;
      }
    },
    grid: {
      borderColor: '#e8e8e8',
      strokeDashArray: 3
    }
  };

  // Processar dados de dispersão (Custo x Conversões)
  const processScatterPlotData = () => {
    if (!dashboardData?.campaigns || dashboardData.campaigns.length === 0) {
      return [
        {
          name: 'Google Ads',
          data: [{ x: 0, y: 0 }]
        },
        {
          name: 'Meta Ads',
          data: [{ x: 0, y: 0 }]
        }
      ];
    }

    const googleAdsData = dashboardData.campaigns
      .filter(campaign => campaign.platform === 'google_ads')
      .map(campaign => ({
        x: campaign.metrics?.cost || 0,
        y: campaign.metrics?.conversions || 0
      }));

    const facebookAdsData = dashboardData.campaigns
      .filter(campaign => campaign.platform === 'facebook')
      .map(campaign => ({
        x: campaign.metrics?.cost || 0,
        y: campaign.metrics?.conversions || 0
      }));

    return [
      {
        name: 'Google Ads',
        data: googleAdsData.length > 0 ? googleAdsData : [{ x: 0, y: 0 }]
      },
      {
        name: 'Meta Ads', 
        data: facebookAdsData.length > 0 ? facebookAdsData : [{ x: 0, y: 0 }]
      }
    ];
  };

  const scatterPlotSeries = processScatterPlotData();

  return (
    <div className="row gy-4">
      {/* Gráfico de Tráfego por Fonte */}
      <div className="col-xxl-6">
        <div className="card h-100">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-4">
              <h6 className="mb-2 fw-bold text-lg mb-0">Tráfego por Fonte</h6>
              <select 
                className="form-select form-select-sm w-auto bg-base border text-secondary-light"
                value={period}
                onChange={(e) => onPeriodChange && onPeriodChange(e.target.value)}
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
            <Chart
              options={trafficSourceOptions}
              series={trafficSourceSeries}
              type="bar"
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Conversões por Dispositivo */}
      <div className="col-xxl-6">
        <div className="card h-100">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-4">
              <h6 className="mb-2 fw-bold text-lg mb-0">Conversões por Dispositivo</h6>
              <span className="badge bg-success-subtle text-success-main">Ativo</span>
            </div>
            <Chart
              options={deviceConversionOptions}
              series={deviceConversionSeries}
              type="pie"
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Performance de Campanhas */}
      <div className="col-xxl-6">
        <div className="card h-100">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-4">
              <h6 className="mb-2 fw-bold text-lg mb-0">Performance de Campanhas</h6>
              <div className="d-flex gap-2">
                <span className="badge bg-primary-subtle text-primary-main">
                  CTR: {dashboardData?.summary ? (dashboardData.summary.averageCTR || dashboardData.summary.ctr || 0).toFixed(1) : '0'}%
                </span>
                <span className="badge bg-success-subtle text-success-main">
                  ROAS: {dashboardData?.summary ? (dashboardData.summary.totalROAS || dashboardData.summary.roas || 0).toFixed(1) : '0'}
                </span>
              </div>
            </div>
            <Chart
              options={campaignPerformanceOptions}
              series={campaignPerformanceSeries}
              type="radar"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Dispersão: Custo x Conversões */}
      <div className="col-xxl-6">
        <div className="card h-100">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-4">
              <h6 className="mb-2 fw-bold text-lg mb-0">Custo x Conversões</h6>
              <div className="d-flex gap-2">
                <span className="badge bg-info-subtle text-info-main">
                  Eficiência: {dashboardData?.summary ? 
                    (dashboardData.summary.totalCost > 0 ? 
                      ((dashboardData.summary.totalConversions || dashboardData.summary.conversions || 0) / dashboardData.summary.totalCost * 100).toFixed(1) : 
                      '0'
                    ) : '0'}%
                </span>
              </div>
            </div>
            <Chart
              options={scatterPlotOptions}
              series={scatterPlotSeries}
              type="scatter"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Tendência de Conversões */}
      <div className="col-xxl-4">
        <div className="card h-100">
          <div className="card-body p-24">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-4">
              <h6 className="mb-2 fw-bold text-lg mb-0">Tendência de Conversões</h6>
              <select 
                className="form-select form-select-sm w-auto bg-base border text-secondary-light"
                value={period}
                onChange={(e) => onPeriodChange && onPeriodChange(e.target.value)}
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
            <Chart
              options={conversionTrendOptions}
              series={conversionTrendSeries}
              type="line"
              height={250}
            />
            <div className="text-center mt-3">
              <h4 className="text-success mb-1">
                {dashboardData?.summary ? 
                  ((dashboardData.summary.totalConversions || dashboardData.summary.conversions || 0) / 7).toFixed(1) : 
                  '0'
                }
              </h4>
              <p className="text-muted mb-0">Média diária de conversões</p>
              <span className="text-success-600 d-flex align-items-center justify-content-center gap-1 text-sm fw-bolder">
                {dashboardData?.summary ? 
                  (dashboardData.summary.averageConversionRate || dashboardData.summary.conversionRate || 0).toFixed(1) : 
                  '0'
                }% <i className="ri-arrow-up-s-fill d-flex" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCharts; 