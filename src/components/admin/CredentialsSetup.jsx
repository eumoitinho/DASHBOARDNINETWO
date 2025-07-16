"use client";
import React, { useState } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const CredentialsSetup = ({ clientId, onSave }) => {
  const [activeTab, setActiveTab] = useState('googleAds');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    googleAds: {
      customerId: '',
      // As credenciais da NineTwo são configuradas no .env.local
    },
    facebookAds: {
      adAccountId: '',
      pixelId: '',
    },
    googleAnalytics: {
      propertyId: '',
      viewId: '',
    }
  });

  const handleSave = async (platform) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          credentials: credentials[platform],
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Credenciais ${platform} salvas com sucesso!`);
        if (onSave) onSave(platform);
      } else {
        alert(`Erro ao salvar: ${result.message}`);
      }
    } catch (error) {
      alert('Erro ao salvar credenciais');
    } finally {
      setLoading(false);
    }
  };

  const testConnections = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/test-connections`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        const { results, summary } = result.data;
        let message = `Resultado dos testes:\n\n`;
        message += `Google Ads: ${results.googleAds ? '✅ Conectado' : '❌ Falhou'}\n`;
        message += `Facebook Ads: ${results.facebookAds ? '✅ Conectado' : '❌ Falhou'}\n`;
        message += `Google Analytics: ${results.googleAnalytics ? '✅ Conectado' : '❌ Falhou'}\n\n`;
        message += `Taxa de sucesso: ${summary.successRate.toFixed(1)}%`;
        
        alert(message);
      } else {
        alert(`Erro nos testes: ${result.message}`);
      }
    } catch (error) {
      alert('Erro ao testar conexões');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <Icon icon="solar:key-bold" className="me-2" />
          Configuração de APIs do Cliente
        </h5>
      </div>
      
      <div className="card-body">
        {/* Informações importantes */}
        <div className="alert alert-info mb-4">
          <Icon icon="solar:info-circle-bold" className="me-2" />
          <strong>Importante:</strong> O cliente precisa fornecer apenas os IDs das contas. 
          As credenciais da NineTwo já estão configuradas no sistema.
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'googleAds' ? 'active' : ''}`}
              onClick={() => setActiveTab('googleAds')}
            >
              <Icon icon="logos:google-ads" className="me-2" />
              Google Ads
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'facebookAds' ? 'active' : ''}`}
              onClick={() => setActiveTab('facebookAds')}
            >
              <Icon icon="logos:facebook" className="me-2" />
              Facebook Ads
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'googleAnalytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('googleAnalytics')}
            >
              <Icon icon="logos:google-analytics" className="me-2" />
              Google Analytics
            </button>
          </li>
        </ul>

        {/* Google Ads Tab */}
        {activeTab === 'googleAds' && (
          <div className="tab-content">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">
                    <Icon icon="solar:hashtag-bold" className="me-1" />
                    Google Ads Customer ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ex: 1234567890 (sem hífens)"
                    value={credentials.googleAds.customerId}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      googleAds: { ...credentials.googleAds, customerId: e.target.value }
                    })}
                  />
                  <div className="form-text">
                    Encontrar em: Google Ads → Configurações → Detalhes da conta
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 bg-light">
                  <h6 className="text-sm font-weight-semibold mb-2">
                    <Icon icon="solar:user-plus-bold" className="me-1" />
                    Permissão Necessária
                  </h6>
                  <p className="text-xs mb-0">
                    Cliente deve adicionar sua conta Google Ads como <strong>"Usuário"</strong> 
                    com permissão de <strong>"Visualização padrão"</strong>.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={() => handleSave('googleAds')}
              disabled={loading || !credentials.googleAds.customerId}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" className="me-2" />
                  Salvar Google Ads
                </>
              )}
            </button>
          </div>
        )}

        {/* Facebook Ads Tab */}
        {activeTab === 'facebookAds' && (
          <div className="tab-content">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">
                    <Icon icon="solar:hashtag-bold" className="me-1" />
                    Facebook Ad Account ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ex: act_123456789012345"
                    value={credentials.facebookAds.adAccountId}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      facebookAds: { ...credentials.facebookAds, adAccountId: e.target.value }
                    })}
                  />
                  <div className="form-text">
                    Encontrar em: Facebook Business → Gerenciador de anúncios
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <Icon icon="solar:code-bold" className="me-1" />
                    Facebook Pixel ID (Opcional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ex: 123456789012345"
                    value={credentials.facebookAds.pixelId}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      facebookAds: { ...credentials.facebookAds, pixelId: e.target.value }
                    })}
                  />
                  <div className="form-text">
                    Encontrar em: Facebook Business → Gerenciador de eventos
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 bg-light">
                  <h6 className="text-sm font-weight-semibold mb-2">
                    <Icon icon="solar:user-plus-bold" className="me-1" />
                    Permissão Necessária
                  </h6>
                  <p className="text-xs mb-0">
                    Cliente deve adicionar o App da NineTwo como <strong>"Administrador"</strong> 
                    na conta de anúncios do Facebook Business.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={() => handleSave('facebookAds')}
              disabled={loading || !credentials.facebookAds.adAccountId}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" className="me-2" />
                  Salvar Facebook Ads
                </>
              )}
            </button>
          </div>
        )}

        {/* Google Analytics Tab */}
        {activeTab === 'googleAnalytics' && (
          <div className="tab-content">
            <div className="row">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">
                    <Icon icon="solar:hashtag-bold" className="me-1" />
                    Google Analytics Property ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ex: 123456789"
                    value={credentials.googleAnalytics.propertyId}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      googleAnalytics: { ...credentials.googleAnalytics, propertyId: e.target.value }
                    })}
                  />
                  <div className="form-text">
                    Encontrar em: GA4 → Admin → Detalhes da propriedade
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <Icon icon="solar:eye-bold" className="me-1" />
                    View ID (Opcional - GA Universal)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ex: 987654321"
                    value={credentials.googleAnalytics.viewId}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      googleAnalytics: { ...credentials.googleAnalytics, viewId: e.target.value }
                    })}
                  />
                  <div className="form-text">
                    Apenas se ainda usar Google Analytics Universal (não GA4)
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border rounded p-3 bg-light">
                  <h6 className="text-sm font-weight-semibold mb-2">
                    <Icon icon="solar:user-plus-bold" className="me-1" />
                    Permissão Necessária
                  </h6>
                  <p className="text-xs mb-0">
                    Cliente deve adicionar a Service Account da NineTwo como <strong>"Visualizador"</strong> 
                    na propriedade do Google Analytics.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={() => handleSave('googleAnalytics')}
              disabled={loading || !credentials.googleAnalytics.propertyId}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" className="me-2" />
                  Salvar Google Analytics
                </>
              )}
            </button>
          </div>
        )}

        {/* Teste de Conexões */}
        <hr className="my-4" />
        
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="mb-1">Testar Todas as Conexões</h6>
            <p className="text-muted text-sm mb-0">
              Verificar se as configurações estão funcionando corretamente
            </p>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={testConnections}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Testando...
              </>
            ) : (
              <>
                <Icon icon="solar:play-circle-bold" className="me-2" />
                Testar Conexões
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsSetup;