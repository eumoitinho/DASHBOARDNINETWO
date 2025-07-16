"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from "@iconify/react/dist/iconify.js";
import ClientPortalLayout from '@/components/client-portal/ClientPortalLayout';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClientAccessGuard from "@/components/auth/ClientAccessGuard";

const ConfiguracoesPage = () => {
  const params = useParams();
  const clientSlug = params?.client;
  const { data: session } = useSession();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      address: '',
      description: ''
    },
    notifications: {
      emailReports: true,
      emailAlerts: true,
      weeklyDigest: true,
      campaignUpdates: true,
      budgetAlerts: true,
      performanceAlerts: false
    },
    privacy: {
      dataRetention: '12months',
      allowAnalytics: true,
      shareData: false,
      marketingEmails: true
    },
    integrations: {
      googleAds: { connected: false, lastSync: null },
      facebookAds: { connected: false, lastSync: null },
      googleAnalytics: { connected: false, lastSync: null }
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch client data and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${clientSlug}`);
        if (clientResponse.ok) {
          const clientResult = await clientResponse.json();
          setClientData(clientResult.data);
          
          // Update settings with client data
          setSettings(prev => ({
            ...prev,
            profile: {
              name: clientResult.data.name || '',
              email: clientResult.data.email || '',
              phone: clientResult.data.phone || '',
              company: clientResult.data.name || '',
              website: clientResult.data.website || '',
              address: clientResult.data.address || '',
              description: clientResult.data.description || ''
            },
            integrations: {
              googleAds: clientResult.data.googleAds || { connected: false, lastSync: null },
              facebookAds: clientResult.data.facebookAds || { connected: false, lastSync: null },
              googleAnalytics: clientResult.data.googleAnalytics || { connected: false, lastSync: null }
            }
          }));
        }

        // Fetch user settings
        const settingsResponse = await fetch(`/api/settings/${clientSlug}`);
        if (settingsResponse.ok) {
          const settingsResult = await settingsResponse.json();
          setSettings(prev => ({ ...prev, ...settingsResult.data }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientSlug]);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/settings/${clientSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccessMessage('Configurações salvas com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectIntegration = async (platform) => {
    try {
      
      // Redirect to OAuth flow
      window.location.href = `/api/integrations/${platform}/connect?client=${clientSlug}`;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisconnectIntegration = async (platform) => {
    try {
      
      const response = await fetch(`/api/integrations/${platform}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client: clientSlug })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          integrations: {
            ...prev.integrations,
            [platform]: { connected: false, lastSync: null }
          }
        }));
        setSuccessMessage(`${platform} desconectado com sucesso!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getIntegrationInfo = (platform) => {
    const integrations = {
      googleAds: {
        name: 'Google Ads',
        icon: 'logos:google-ads',
        color: 'primary',
        description: 'Conecte sua conta do Google Ads para importar dados de campanhas automaticamente.'
      },
      facebookAds: {
        name: 'Facebook Ads',
        icon: 'logos:facebook',
        color: 'info',
        description: 'Conecte sua conta do Facebook Business para importar dados de campanhas do Facebook e Instagram.'
      },
      googleAnalytics: {
        name: 'Google Analytics',
        icon: 'logos:google-analytics',
        color: 'warning',
        description: 'Conecte sua propriedade do Google Analytics 4 para acompanhar métricas do site.'
      }
    };
    return integrations[platform];
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'client']}>
        <ClientAccessGuard clientSlug={clientSlug}>
          <ClientPortalLayout clientData={clientData}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando configurações...</p>
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
          Erro ao carregar configurações: {error}
        </div>
          </ClientPortalLayout>
        </ClientAccessGuard>
      </ProtectedRoute>
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
                  <h4 className="card-title mb-8">Configurações</h4>
                  <p className="text-secondary-light mb-0">
                    Gerencie suas preferências e integrações do portal
                  </p>
                </div>
                {successMessage && (
                  <div className="alert alert-success mb-0">
                    <Icon icon="solar:check-circle-bold" className="me-2" />
                    {successMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Settings Navigation */}
        <div className="col-lg-3 mb-24">
          <div className="card">
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className={`list-group-item border-0 ${activeTab === 'perfil' ? 'active bg-primary-100' : ''}`}>
                  <button 
                    className="btn btn-link text-start w-100 p-0 text-decoration-none"
                    onClick={() => setActiveTab('perfil')}
                  >
                    <Icon icon="solar:user-bold" className="me-2" />
                    Perfil da Empresa
                  </button>
                </li>
                <li className={`list-group-item border-0 ${activeTab === 'integracoes' ? 'active bg-primary-100' : ''}`}>
                  <button 
                    className="btn btn-link text-start w-100 p-0 text-decoration-none"
                    onClick={() => setActiveTab('integracoes')}
                  >
                    <Icon icon="solar:settings-bold" className="me-2" />
                    Integrações
                  </button>
                </li>
                <li className={`list-group-item border-0 ${activeTab === 'notificacoes' ? 'active bg-primary-100' : ''}`}>
                  <button 
                    className="btn btn-link text-start w-100 p-0 text-decoration-none"
                    onClick={() => setActiveTab('notificacoes')}
                  >
                    <Icon icon="solar:notification-bold" className="me-2" />
                    Notificações
                  </button>
                </li>
                <li className={`list-group-item border-0 ${activeTab === 'privacidade' ? 'active bg-primary-100' : ''}`}>
                  <button 
                    className="btn btn-link text-start w-100 p-0 text-decoration-none"
                    onClick={() => setActiveTab('privacidade')}
                  >
                    <Icon icon="solar:shield-bold" className="me-2" />
                    Privacidade
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-lg-9">
          {/* Profile Tab */}
          {activeTab === 'perfil' && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Informações da Empresa</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nome da Empresa</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email de Contato</label>
                    <input
                      type="email"
                      className="form-control"
                      value={settings.profile.email}
                      onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={settings.profile.phone}
                      onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      value={settings.profile.website}
                      onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                      placeholder="https://www.exemplo.com.br"
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Endereço</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.profile.address}
                      onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Descrição da Empresa</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={settings.profile.description}
                      onChange={(e) => handleInputChange('profile', 'description', e.target.value)}
                      placeholder="Descreva brevemente sua empresa e seus serviços..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integracoes' && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Integrações de Marketing</h6>
                <p className="text-muted mb-0">Conecte suas contas para importar dados automaticamente</p>
              </div>
              <div className="card-body">
                {Object.entries(settings.integrations).map(([platform, config]) => {
                  const info = getIntegrationInfo(platform);
                  return (
                    <div key={platform} className="border rounded p-3 mb-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Icon icon={info.icon} className={`text-${info.color} me-3`} size={32} />
                          <div>
                            <h6 className="mb-1">{info.name}</h6>
                            <p className="text-muted mb-0 small">{info.description}</p>
                            {config.connected && (
                              <small className="text-success">
                                <Icon icon="solar:check-circle-bold" className="me-1" />
                                Última sincronização: {formatDate(config.lastSync)}
                              </small>
                            )}
                          </div>
                        </div>
                        <div>
                          {config.connected ? (
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success-100 text-success-main">Conectado</span>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDisconnectIntegration(platform)}
                              >
                                Desconectar
                              </button>
                            </div>
                          ) : (
                            <button
                              className={`btn btn-${info.color} btn-sm`}
                              onClick={() => handleConnectIntegration(platform)}
                            >
                              <Icon icon="solar:link-bold" className="me-1" />
                              Conectar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="alert alert-info mt-3">
                  <Icon icon="solar:info-circle-bold" className="me-2" />
                  <strong>Importante:</strong> Para conectar suas contas, você precisará fornecer as credenciais necessárias. 
                  Seus dados são criptografados e armazenados com segurança.
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notificacoes' && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Preferências de Notificação</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12">
                    <h6 className="mb-3">Email</h6>
                    {Object.entries(settings.notifications).map(([key, value]) => {
                      const labels = {
                        emailReports: 'Relatórios por email',
                        emailAlerts: 'Alertas importantes',
                        weeklyDigest: 'Resumo semanal',
                        campaignUpdates: 'Atualizações de campanhas',
                        budgetAlerts: 'Alertas de orçamento',
                        performanceAlerts: 'Alertas de performance'
                      };
                      
                      return (
                        <div key={key} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={key}
                            checked={value}
                            onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={key}>
                            {labels[key]}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr />

                <div className="alert alert-warning">
                  <Icon icon="solar:notification-bold" className="me-2" />
                  <strong>Dica:</strong> Recomendamos manter os alertas de orçamento ativados para evitar gastos excessivos.
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacidade' && (
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Configurações de Privacidade</h6>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label">Retenção de Dados</label>
                  <select
                    className="form-select"
                    value={settings.privacy.dataRetention}
                    onChange={(e) => handleInputChange('privacy', 'dataRetention', e.target.value)}
                  >
                    <option value="6months">6 meses</option>
                    <option value="12months">12 meses</option>
                    <option value="24months">24 meses</option>
                    <option value="indefinite">Indefinido</option>
                  </select>
                  <small className="text-muted">Por quanto tempo manter os dados das campanhas</small>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="allowAnalytics"
                    checked={settings.privacy.allowAnalytics}
                    onChange={(e) => handleInputChange('privacy', 'allowAnalytics', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="allowAnalytics">
                    Permitir coleta de dados analíticos para melhorar o serviço
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="shareData"
                    checked={settings.privacy.shareData}
                    onChange={(e) => handleInputChange('privacy', 'shareData', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="shareData">
                    Compartilhar dados anonimizados para pesquisa de mercado
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="marketingEmails"
                    checked={settings.privacy.marketingEmails}
                    onChange={(e) => handleInputChange('privacy', 'marketingEmails', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="marketingEmails">
                    Receber emails de marketing e novidades
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-bold" className="me-2" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
        </ClientPortalLayout>
      </ClientAccessGuard>
    </ProtectedRoute>
  );
};

export default ConfiguracoesPage;