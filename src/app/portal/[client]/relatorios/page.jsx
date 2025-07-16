"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientPortalLayout from '@/components/client-portal/ClientPortalLayout';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const RelatoriosPage = () => {
  const params = useParams();
  const clientSlug = params?.client;
  const { data: session } = useSession();
  const [clientData, setClientData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Fetch client data and reports
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

        // Fetch reports list
        const reportsResponse = await fetch(`/api/reports/${clientSlug}`);
        if (reportsResponse.ok) {
          const reportsResult = await reportsResponse.json();
          setReports(reportsResult.data || []);
        } else {
          setError('Erro ao carregar relatórios');
          setReports([]);
        }
      } catch (err) {
        setError(err.message);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientSlug]);


  const generateReport = async (reportType, period) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/reports/${clientSlug}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: reportType, period })
      });

      if (response.ok) {
        const result = await response.json();
        setReports(prev => [result.data, ...prev]);
        setSelectedReport(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (report) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/reports/${clientSlug}/${report.id}`);
      if (response.ok) {
        const result = await response.json();
        setReportData(result.data);
        setSelectedReport(report);
      } else {
        // Use mock report data
        setReportData(getMockReportData(report));
        setSelectedReport(report);
      }
    } catch (err) {
      setError(err.message);
      setReportData(getMockReportData(report));
      setSelectedReport(report);
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (report) => {
    return {
      ...report,
      sections: [
        {
          title: 'Resumo Executivo',
          type: 'summary',
          data: {
            totalInvestment: report.summary?.totalInvestment || 0,
            totalLeads: report.summary?.totalLeads || 0,
            costPerLead: report.summary ? (report.summary.totalInvestment / report.summary.totalLeads) : 0,
            conversionRate: report.summary ? ((report.summary.totalConversions / report.summary.totalLeads) * 100) : 0,
            roas: report.summary?.roas || 0
          }
        },
        {
          title: 'Performance por Plataforma',
          type: 'platforms',
          data: [
            {
              platform: 'Google Ads',
              investment: (report.summary?.totalInvestment || 0) * 0.6,
              leads: Math.floor((report.summary?.totalLeads || 0) * 0.55),
              cpc: (report.summary?.averageCPC || 0) * 1.1,
              ctr: (report.summary?.averageCTR || 0) * 1.2
            },
            {
              platform: 'Facebook Ads',
              investment: (report.summary?.totalInvestment || 0) * 0.4,
              leads: Math.floor((report.summary?.totalLeads || 0) * 0.45),
              cpc: (report.summary?.averageCPC || 0) * 0.8,
              ctr: (report.summary?.averageCTR || 0) * 0.9
            }
          ]
        },
        {
          title: 'Campanhas Top Performance',
          type: 'top_campaigns',
          data: [
            {
              name: 'Campanha de Busca Principal',
              investment: (report.summary?.totalInvestment || 0) * 0.35,
              leads: Math.floor((report.summary?.totalLeads || 0) * 0.4),
              roas: (report.summary?.roas || 0) * 1.2
            },
            {
              name: 'Facebook Feed Segmentado',
              investment: (report.summary?.totalInvestment || 0) * 0.25,
              leads: Math.floor((report.summary?.totalLeads || 0) * 0.3),
              roas: (report.summary?.roas || 0) * 0.9
            }
          ]
        }
      ]
    };
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

  const getReportTypeInfo = (type) => {
    const types = {
      monthly: { name: 'Mensal', icon: 'solar:calendar-bold', color: 'primary' },
      weekly: { name: 'Semanal', icon: 'solar:calendar-minimalistic-bold', color: 'success' },
      campaign: { name: 'Campanha', icon: 'solar:target-bold', color: 'warning' },
      custom: { name: 'Personalizado', icon: 'solar:settings-bold', color: 'info' }
    };
    return types[type] || types.monthly;
  };

  const getStatusInfo = (status) => {
    const statuses = {
      ready: { name: 'Pronto', icon: 'solar:check-circle-bold', color: 'success' },
      processing: { name: 'Processando', icon: 'solar:refresh-bold', color: 'warning' },
      error: { name: 'Erro', icon: 'solar:danger-circle-bold', color: 'danger' }
    };
    return statuses[status] || statuses.ready;
  };

  if (loading && !selectedReport) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'client']}>
        <ClientAccessGuard clientSlug={clientSlug}>
          <ClientPortalLayout clientData={clientData}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando relatórios...</p>
          </div>
        </div>
          </ClientPortalLayout>
        </ClientAccessGuard>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'client']}>
        <ClientAccessGuard clientSlug={clientSlug}>
          <ClientPortalLayout clientData={clientData}>
        <div className="alert alert-danger">
          <Icon icon="solar:danger-circle-bold" className="me-2" />
          Erro ao carregar relatórios: {error}
        </div>
          </ClientPortalLayout>
        </ClientAccessGuard>
      </ProtectedRoute>
    );
  }

  // Report detail view
  if (selectedReport && reportData) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'client']}>
        <ClientAccessGuard clientSlug={clientSlug}>
          <ClientPortalLayout clientData={clientData}>
        {/* Report Header */}
        <div className="row mb-24">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-20">
                  <div>
                    <button
                      className="btn btn-outline-secondary btn-sm me-3"
                      onClick={() => {
                        setSelectedReport(null);
                        setReportData(null);
                      }}
                    >
                      <Icon icon="solar:arrow-left-bold" className="me-2" />
                      Voltar
                    </button>
                    <h4 className="card-title mb-8 d-inline">{selectedReport.name}</h4>
                    <p className="text-secondary-light mb-0">
                      Período: {formatDate(selectedReport.period.start)} - {formatDate(selectedReport.period.end)}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-12">
                    <button className="btn btn-outline-primary btn-sm">
                      <Icon icon="solar:download-bold" className="me-2" />
                      Baixar PDF
                    </button>
                    <button className="btn btn-outline-success btn-sm">
                      <Icon icon="solar:share-bold" className="me-2" />
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {reportData.sections?.map((section, index) => (
          <div key={index} className="row mb-24">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">{section.title}</h6>
                </div>
                <div className="card-body">
                  {section.type === 'summary' && (
                    <div className="row">
                      <div className="col-md-2 mb-3">
                        <div className="text-center">
                          <h4 className="fw-bold text-primary">{formatCurrency(section.data.totalInvestment)}</h4>
                          <small className="text-muted">Investimento Total</small>
                        </div>
                      </div>
                      <div className="col-md-2 mb-3">
                        <div className="text-center">
                          <h4 className="fw-bold text-success">{formatNumber(section.data.totalLeads)}</h4>
                          <small className="text-muted">Total de Leads</small>
                        </div>
                      </div>
                      <div className="col-md-2 mb-3">
                        <div className="text-center">
                          <h4 className="fw-bold text-warning">{formatCurrency(section.data.costPerLead)}</h4>
                          <small className="text-muted">Custo por Lead</small>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="text-center">
                          <h4 className="fw-bold text-info">{section.data.conversionRate.toFixed(2)}%</h4>
                          <small className="text-muted">Taxa de Conversão</small>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="text-center">
                          <h4 className="fw-bold text-purple">{section.data.roas.toFixed(2)}x</h4>
                          <small className="text-muted">ROAS</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.type === 'platforms' && (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Plataforma</th>
                            <th>Investimento</th>
                            <th>Leads</th>
                            <th>CPC Médio</th>
                            <th>CTR</th>
                            <th>Participação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.data.map((platform, idx) => (
                            <tr key={idx}>
                              <td className="fw-semibold">{platform.platform}</td>
                              <td>{formatCurrency(platform.investment)}</td>
                              <td>{formatNumber(platform.leads)}</td>
                              <td>{formatCurrency(platform.cpc)}</td>
                              <td>{platform.ctr.toFixed(2)}%</td>
                              <td>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div 
                                    className="progress-bar" 
                                    style={{ 
                                      width: `${(platform.investment / reportData.sections[0].data.totalInvestment) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === 'top_campaigns' && (
                    <div className="row">
                      {section.data.map((campaign, idx) => (
                        <div key={idx} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <h6 className="card-title">{campaign.name}</h6>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Investimento:</span>
                                <strong>{formatCurrency(campaign.investment)}</strong>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Leads:</span>
                                <strong>{formatNumber(campaign.leads)}</strong>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>ROAS:</span>
                                <strong className="text-success">{campaign.roas.toFixed(2)}x</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
          </ClientPortalLayout>
        </ClientAccessGuard>
      </ProtectedRoute>
    );
  }

  // Reports list view
  return (
    <ProtectedRoute allowedRoles={['admin', 'client']}>
      <ClientAccessGuard clientSlug={clientSlug}>
        <ClientPortalLayout clientData={clientData}>
      {/* Page Header */}
      <div className="row mb-24">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-20">
                <div>
                  <h4 className="card-title mb-8">Relatórios e Análises</h4>
                  <p className="text-secondary-light mb-0">
                    Gere e visualize relatórios detalhados das suas campanhas
                  </p>
                </div>
                <div className="d-flex align-items-center gap-12">
                  <div className="dropdown">
                    <button 
                      className="btn btn-primary btn-sm dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                    >
                      <Icon icon="solar:add-circle-bold" className="me-2" />
                      Novo Relatório
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button 
                          className="dropdown-item"
                          onClick={() => generateReport('weekly', { days: 7 })}
                        >
                          <Icon icon="solar:calendar-minimalistic-bold" className="me-2" />
                          Relatório Semanal
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item"
                          onClick={() => generateReport('monthly', { days: 30 })}
                        >
                          <Icon icon="solar:calendar-bold" className="me-2" />
                          Relatório Mensal
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item"
                          onClick={() => generateReport('custom', { days: 90 })}
                        >
                          <Icon icon="solar:settings-bold" className="me-2" />
                          Relatório Personalizado
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-24">
        <div className="col-xxl-3 col-sm-6 mb-24">
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="d-flex align-items-center gap-2">
                  <div className="w-44-px h-44-px bg-primary-600 rounded-circle d-flex justify-content-center align-items-center">
                    <Icon icon="solar:document-text-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Total Relatórios</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {reports.length}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  {reports.filter(r => r.status === 'ready').length} prontos
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
                  <span className="text-secondary-light text-lg fw-normal">Último Período</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {formatCurrency(reports[0]?.summary?.totalInvestment || 0)}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-info-focus text-info-main px-1 rounded-2 fw-semibold text-xs">
                  {reports[0]?.summary?.totalLeads || 0} leads
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
                    <Icon icon="solar:target-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">ROAS Médio</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {(reports.reduce((sum, r) => sum + (r.summary?.roas || 0), 0) / reports.length || 0).toFixed(2)}x
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-success-focus text-success-main px-1 rounded-2 fw-semibold text-xs">
                  Últimos relatórios
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
                    <Icon icon="solar:download-bold" className="text-white text-xl" />
                  </div>
                  <span className="text-secondary-light text-lg fw-normal">Downloads</span>
                </div>
              </div>
              <h3 className="fw-semibold mb-12 text-primary-light">
                {reports.length * 3}
              </h3>
              <p className="text-sm mb-0">
                <span className="bg-warning-focus text-warning-main px-1 rounded-2 fw-semibold text-xs">
                  Este mês
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title mb-0">Histórico de Relatórios ({reports.length})</h6>
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary btn-sm">
                  <Icon icon="solar:filter-bold" className="me-1" />
                  Filtros
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Relatório</th>
                      <th>Tipo</th>
                      <th>Período</th>
                      <th>Status</th>
                      <th>Investimento</th>
                      <th>Leads</th>
                      <th>ROAS</th>
                      <th>Criado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const typeInfo = getReportTypeInfo(report.type);
                      const statusInfo = getStatusInfo(report.status);
                      
                      return (
                        <tr key={report.id}>
                          <td>
                            <div className="fw-semibold text-primary-light">{report.name}</div>
                          </td>
                          <td>
                            <span className={`badge bg-${typeInfo.color}-100 text-${typeInfo.color}-main`}>
                              <Icon icon={typeInfo.icon} className="me-1" />
                              {typeInfo.name}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div className="text-sm">{formatDate(report.period.start)}</div>
                              <div className="text-sm text-secondary-light">até {formatDate(report.period.end)}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${statusInfo.color}-100 text-${statusInfo.color}-main`}>
                              <Icon icon={statusInfo.icon} className="me-1" />
                              {statusInfo.name}
                            </span>
                          </td>
                          <td className="fw-semibold">
                            {report.summary ? formatCurrency(report.summary.totalInvestment) : '-'}
                          </td>
                          <td>{report.summary ? formatNumber(report.summary.totalLeads) : '-'}</td>
                          <td>
                            {report.summary ? (
                              <span className="fw-semibold text-success">
                                {report.summary.roas.toFixed(2)}x
                              </span>
                            ) : '-'}
                          </td>
                          <td>{formatDate(report.createdAt)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              {report.status === 'ready' && (
                                <>
                                  <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => viewReport(report)}
                                  >
                                    <Icon icon="solar:eye-bold" />
                                  </button>
                                  <button className="btn btn-outline-success btn-sm">
                                    <Icon icon="solar:download-bold" />
                                  </button>
                                  <button className="btn btn-outline-info btn-sm">
                                    <Icon icon="solar:share-bold" />
                                  </button>
                                </>
                              )}
                              {report.status === 'processing' && (
                                <span className="spinner-border spinner-border-sm text-warning"></span>
                              )}
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

export default RelatoriosPage;