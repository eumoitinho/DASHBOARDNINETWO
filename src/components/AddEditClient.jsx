"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

const AddEditClient = ({ clientSlug = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    slug: '',
    phone: '',
    company: '',
    website: '',
    monthlyBudget: 0,
    status: 'active',
    tags: '',
    notes: '',
    portalSettings: {
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
    },
    googleAds: {
      customerId: '',
      managerId: '',
      connected: false,
    },
    facebookAds: {
      adAccountId: '',
      pixelId: '',
      connected: false,
    },
    googleAnalytics: {
      propertyId: '',
      viewId: '',
      connected: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isEditing] = useState(!!clientSlug);
  const [notification, setNotification] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState('googleAnalytics');

  useEffect(() => {
    if (clientSlug) {
      fetchClientData();
    }
  }, [clientSlug]);

  // Debug: logar formData sempre que mudar
  useEffect(() => {
    console.log('🔄 FormData atualizado:', formData);
  }, [formData]);

  const fetchClientData = async () => {
    if (!clientSlug) return;
    
    setIsLoadingData(true);
    try {
      console.log('🔍 Buscando dados do cliente:', clientSlug);
      const response = await fetch(`/api/admin/clients/${clientSlug}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Dados recebidos da API:', data);
        if (data.success) {
          const client = data.data;
          console.log('👤 Dados do cliente:', client);
          console.log('📊 Google Analytics:', client.googleAnalytics);
          console.log('📘 Facebook Ads:', client.facebookAds);
          console.log('🎯 Google Ads:', client.googleAds);
          
          setFormData({
            name: client.name || '',
            email: client.email || '',
            slug: client.slug || '',
            phone: client.phone || '',
            company: client.company || '',
            website: client.website || '',
            monthlyBudget: client.monthlyBudget || 0,
            status: client.status || 'active',
            tags: client.tags ? client.tags.join(', ') : '',
            notes: client.notes || '',
            portalSettings: {
              primaryColor: client.portalSettings?.primaryColor || '#3B82F6',
              secondaryColor: client.portalSettings?.secondaryColor || '#8B5CF6',
              allowedSections: client.portalSettings?.allowedSections || ['dashboard', 'campanhas', 'analytics', 'relatorios'],
            },
            googleAds: {
              customerId: client.googleAds?.customerId || '',
              managerId: client.googleAds?.managerId || '',
              connected: client.googleAds?.connected || false,
              lastSync: client.googleAds?.lastSync || null,
            },
            facebookAds: {
              adAccountId: client.facebookAds?.adAccountId || '',
              pixelId: client.facebookAds?.pixelId || '',
              connected: client.facebookAds?.connected || false,
              lastSync: client.facebookAds?.lastSync || null,
            },
            googleAnalytics: {
              propertyId: client.googleAnalytics?.propertyId || '',
              viewId: client.googleAnalytics?.viewId || '',
              connected: client.googleAnalytics?.connected || false,
              lastSync: client.googleAnalytics?.lastSync || null,
            },
          });
          console.log('✅ FormData atualizado com sucesso');
        } else {
          console.error('❌ API retornou erro:', data);
        }
      } else {
        console.error('❌ Erro na resposta da API:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do cliente:', error);
      setNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar dados do cliente'
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Processar tags
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      const submitData = {
        ...formData,
        tags,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };

      const url = isEditing ? `/api/admin/clients/${clientSlug}` : '/api/admin/clients';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotification({
          type: 'success',
          title: 'Sucesso',
          message: isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente adicionado com sucesso!'
        });
        
        if (!isEditing) {
          // Limpar formulário após adicionar
          setFormData({
            name: '',
            email: '',
            slug: '',
            phone: '',
            company: '',
            website: '',
            monthlyBudget: 0,
            status: 'active',
            tags: '',
            notes: '',
            portalSettings: {
              primaryColor: '#3B82F6',
              secondaryColor: '#8B5CF6',
              allowedSections: ['dashboard', 'campanhas', 'analytics', 'relatorios'],
            },
            googleAds: {
              customerId: '',
              managerId: '',
              connected: false,
            },
            facebookAds: {
              adAccountId: '',
              pixelId: '',
              connected: false,
            },
            googleAnalytics: {
              propertyId: '',
              viewId: '',
              connected: false,
            },
          });
        }
      } else {
        setNotification({
          type: 'error',
          title: 'Erro',
          message: result.message || 'Erro ao salvar cliente'
        });
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar cliente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startGoogleAnalyticsOAuth = async () => {
    try {
      if (!clientSlug) {
        setNotification({
          type: 'error',
          title: 'Erro',
          message: 'É necessário salvar o cliente antes de autorizar o Google Analytics'
        });
        return;
      }

      const response = await fetch(`/api/auth/google-analytics?clientSlug=${clientSlug}`);
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirecionar para autorização OAuth
        window.location.href = data.authUrl;
      } else {
        setNotification({
          type: 'error',
          title: 'Erro',
          message: data.message || 'Erro ao iniciar autorização OAuth'
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar OAuth:', error);
      setNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao iniciar autorização com Google'
      });
    }
  };

  const startGoogleAdsOAuth = async () => {
    try {
      if (!clientSlug) {
        setNotification({
          type: 'error',
          title: 'Erro',
          message: 'É necessário salvar o cliente antes de autorizar o Google Ads'
        });
        return;
      }

      const response = await fetch(`/api/auth/google-ads?clientSlug=${clientSlug}`);
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirecionar para autorização OAuth
        window.location.href = data.authUrl;
      } else {
        setNotification({
          type: 'error',
          title: 'Erro',
          message: data.message || 'Erro ao iniciar autorização OAuth'
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar OAuth Google Ads:', error);
      setNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao iniciar autorização com Google Ads'
      });
    }
  };

  const testConnection = async (platform) => {
    if (platform === 'googleAnalytics') {
      return startGoogleAnalyticsOAuth();
    }
    if (platform === 'googleAds') {
      return startGoogleAdsOAuth();
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/test-connection/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientSlug,
          credentials: formData[platform]
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const timestamp = new Date().toISOString();
        
        // Marcar plataforma como conectada
        setFormData(prev => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            connected: true,
            lastSync: timestamp
          }
        }));

        // Salvar no banco de dados se estivermos editando um cliente
        if (clientSlug) {
          try {
            await fetch(`/api/admin/clients/${clientSlug}/connection`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                platform,
                connected: true,
                lastSync: timestamp,
                connectionData: result.data
              }),
            });
          } catch (error) {
            console.error('Erro ao salvar conexão no banco:', error);
          }
        }

        setNotification({
          type: 'success',
          title: 'Conexão Estabelecida!',
          message: `Conexão ${platform} testada com sucesso! Plataforma agora está conectada.`
        });
      } else {
        setNotification({
          type: 'error',
          title: 'Erro na Conexão',
          message: result.message || `Erro ao testar conexão ${platform}`
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erro',
        message: `Erro ao testar conexão ${platform}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const HelpModal = () => (
    <>
      <div className={`modal-backdrop fade ${showHelpModal ? 'show' : ''}`} 
           style={{ display: showHelpModal ? 'block' : 'none' }}></div>
      <div className={`modal fade ${showHelpModal ? 'show' : ''}`} 
           style={{ display: showHelpModal ? 'block' : 'none' }}
           tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <Icon icon="solar:info-circle-bold" className="me-2" />
                Como Obter os IDs das Plataformas
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowHelpModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {/* Tabs */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeHelpTab === 'googleAnalytics' ? 'active' : ''}`}
                    onClick={() => setActiveHelpTab('googleAnalytics')}
                  >
                    <Icon icon="logos:google-analytics" className="me-2" />
                    Google Analytics 4
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeHelpTab === 'metaAds' ? 'active' : ''}`}
                    onClick={() => setActiveHelpTab('metaAds')}
                  >
                    <Icon icon="logos:facebook" className="me-2" />
                    Meta Ads
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeHelpTab === 'googleAds' ? 'active' : ''}`}
                    onClick={() => setActiveHelpTab('googleAds')}
                  >
                    <Icon icon="logos:google-ads" className="me-2" />
                    Google Ads
                  </button>
                </li>
              </ul>

              {/* Google Analytics 4 */}
              {activeHelpTab === 'googleAnalytics' && (
                <div>
                  <div className="alert alert-info">
                    <Icon icon="solar:info-circle-bold" className="me-2" />
                    <strong>Importante:</strong> No GA4, não existe mais "View ID" como no Universal Analytics.
                  </div>
                  
                  <h6>📊 Property ID</h6>
                  <ol>
                    <li>Acesse <a href="https://analytics.google.com/" target="_blank" rel="noopener">Google Analytics</a></li>
                    <li>Selecione sua propriedade GA4</li>
                    <li>Vá em <strong>Administrador</strong> (ícone de engrenagem)</li>
                    <li>Na coluna <strong>Propriedade</strong>, clique em <strong>Configurações da propriedade</strong></li>
                    <li>O <strong>ID da propriedade</strong> aparece no topo (formato: <code>123456789</code>)</li>
                  </ol>
                  
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>💡 Dica</h6>
                    <p className="mb-0">Se você ainda usa Universal Analytics, migre para GA4 para ter acesso aos dados mais recentes.</p>
                  </div>
                </div>
              )}

              {/* Meta Ads */}
              {activeHelpTab === 'metaAds' && (
                <div>
                  <h6>📘 Ad Account ID</h6>
                  <ol>
                    <li>Acesse <a href="https://business.facebook.com/" target="_blank" rel="noopener">Facebook Business Manager</a></li>
                    <li>Vá em <strong>Contas de anúncios</strong></li>
                    <li>Selecione sua conta de anúncios</li>
                    <li>O <strong>ID da conta de anúncios</strong> aparece no formato: <code>act_123456789012345</code></li>
                  </ol>

                  <h6 className="mt-4">🎯 Pixel ID</h6>
                  <ol>
                    <li>No Business Manager, vá em <strong>Eventos</strong> → <strong>Pixels</strong></li>
                    <li>Selecione seu pixel ou crie um novo</li>
                    <li>O <strong>ID do pixel</strong> aparece no formato: <code>123456789012345</code></li>
                  </ol>

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>💡 Dica</h6>
                    <p className="mb-0">Se você não tem um pixel, crie um novo para rastrear conversões e otimizar campanhas.</p>
                  </div>
                </div>
              )}

              {/* Google Ads */}
              {activeHelpTab === 'googleAds' && (
                <div>
                  <h6>🎯 Customer ID</h6>
                  <ol>
                    <li>Acesse <a href="https://ads.google.com/" target="_blank" rel="noopener">Google Ads</a></li>
                    <li>Vá em <strong>Configurações</strong> → <strong>Detalhes da conta</strong></li>
                    <li>O <strong>ID do cliente</strong> aparece no formato: <code>123-456-7890</code> (sem hífens)</li>
                  </ol>

                  <h6 className="mt-4">👥 Manager ID (Opcional)</h6>
                  <ol>
                    <li>Se você usa um Google Ads Manager Account:</li>
                    <li>Vá em <strong>Configurações</strong> → <strong>Conta do gerente</strong></li>
                    <li>O <strong>ID do gerente</strong> aparece no formato: <code>123-456-7890</code></li>
                  </ol>

                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>💡 Dica</h6>
                    <p className="mb-0">O Manager ID é opcional e só necessário se você gerencia múltiplas contas Google Ads.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-primary" 
                onClick={() => setShowHelpModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (isLoadingData) {
    return <LoadingSpinner text="Carregando dados do cliente..." />;
  }

  return (
    <div className="row">
      {notification && (
        <div className="col-12 mb-3">
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              {isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
            </h5>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowHelpModal(true)}
            >
              <Icon icon="solar:question-circle-bold" className="me-2" />
              Como Obter IDs
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Informações Básicas */}
                <div className="col-md-6">
                  <h6 className="mb-3">Informações Básicas</h6>
                  
                  <div className="mb-3">
                    <label className="form-label">Nome do Cliente *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Empresa</label>
                    <input
                      type="text"
                      className="form-control"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://exemplo.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Orçamento Mensal (R$)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="monthlyBudget"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="pending">Pendente</option>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="E-commerce, Premium, etc."
                    />
                    <small className="text-muted">Separe as tags por vírgula</small>
                  </div>
                </div>

                {/* Configurações de API */}
                <div className="col-md-6">
                  <h6 className="mb-3">Configurações de API</h6>
                  
                  {/* Google Analytics 4 */}
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Icon icon="logos:google-analytics" className="me-2" />
                        <span>Google Analytics 4</span>
                        {formData.googleAnalytics.connected && (
                          <span className="badge bg-primary ms-2">
                            <Icon icon="solar:check-circle-bold" className="me-1" />
                            Conectado
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.googleAnalytics.connected ? 'btn-outline-primary' : 'btn-outline-primary'}`}
                        onClick={() => testConnection('googleAnalytics')}
                        disabled={isLoading}
                      >
                        <Icon icon="logos:google" className="me-1" />
                        {formData.googleAnalytics.connected ? 'Reconectar' : 'Autorizar com Google'}
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Property ID</label>
                        <input
                          type="text"
                          className="form-control"
                          name="googleAnalytics.propertyId"
                          value={formData.googleAnalytics.propertyId}
                          onChange={handleInputChange}
                          placeholder="123456789"
                        />
                      </div>
                      {formData.googleAnalytics.connected && formData.googleAnalytics.lastSync && (
                        <div className="text-muted small mt-2">
                          <Icon icon="solar:time-bold" className="me-1" />
                          Conectado em: {new Date(formData.googleAnalytics.lastSync).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta Ads */}
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Icon icon="logos:facebook" className="me-2" />
                        <span>Meta Ads</span>
                        {formData.facebookAds.connected && (
                          <span className="badge bg-primary ms-2">
                            <Icon icon="solar:check-circle-bold" className="me-1" />
                            Conectado
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.facebookAds.connected ? 'btn-outline-primary' : 'btn-outline-primary'}`}
                        onClick={() => testConnection('facebookAds')}
                        disabled={isLoading}
                      >
                        <Icon icon="solar:refresh-bold" className="me-1" />
                        {formData.facebookAds.connected ? 'Reconectar' : 'Testar'}
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Ad Account ID</label>
                        <input
                          type="text"
                          className="form-control"
                          name="facebookAds.adAccountId"
                          value={formData.facebookAds.adAccountId}
                          onChange={handleInputChange}
                          placeholder="act_123456789"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Pixel ID</label>
                        <input
                          type="text"
                          className="form-control"
                          name="facebookAds.pixelId"
                          value={formData.facebookAds.pixelId}
                          onChange={handleInputChange}
                          placeholder="123456789"
                        />
                      </div>
                      {formData.facebookAds.connected && formData.facebookAds.lastSync && (
                        <div className="text-muted small mt-2">
                          <Icon icon="solar:time-bold" className="me-1" />
                          Conectado em: {new Date(formData.facebookAds.lastSync).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Google Ads */}
                  <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Icon icon="logos:google-ads" className="me-2" />
                        <span>Google Ads</span>
                        {formData.googleAds.connected && (
                          <span className="badge bg-primary ms-2">
                            <Icon icon="solar:check-circle-bold" className="me-1" />
                            Conectado
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${formData.googleAds.connected ? 'btn-outline-primary' : 'btn-outline-primary'}`}
                        onClick={() => testConnection('googleAds')}
                        disabled={isLoading}
                      >
                        <Icon icon="logos:google" className="me-1" />
                        {formData.googleAds.connected ? 'Reconectar' : 'Autorizar com Google'}
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Customer ID</label>
                        <input
                          type="text"
                          className="form-control"
                          name="googleAds.customerId"
                          value={formData.googleAds.customerId}
                          onChange={handleInputChange}
                          placeholder="123-456-7890"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Manager ID</label>
                        <input
                          type="text"
                          className="form-control"
                          name="googleAds.managerId"
                          value={formData.googleAds.managerId}
                          onChange={handleInputChange}
                          placeholder="123-456-7890"
                        />
                      </div>
                      {formData.googleAds.connected && formData.googleAds.lastSync && (
                        <div className="text-muted small mt-2">
                          <Icon icon="solar:time-bold" className="me-1" />
                          Conectado em: {new Date(formData.googleAds.lastSync).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Observações</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Observações sobre o cliente..."
                    />
                  </div>
                </div>

                {/* Botões */}
                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Icon icon="solar:check-circle-bold" className="me-2" />
                          {isEditing ? 'Atualizar' : 'Adicionar'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => window.history.back()}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Help Modal */}
      {showHelpModal && <HelpModal />}
    </div>
  );
};

export default AddEditClient; 