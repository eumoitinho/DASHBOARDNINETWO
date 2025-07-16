"use client";

import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const PlatformIdsDocsPage = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <MasterLayout>
        <Breadcrumb 
          title='Documentação - IDs das Plataformas' 
          breadcrumbs={[
            { label: 'Documentação', href: '/docs' },
            { label: 'IDs das Plataformas' }
          ]}
        />
        
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <Icon icon="solar:document-bold" className="me-2" />
                  Como Obter os IDs das Plataformas
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <Icon icon="solar:info-circle-bold" className="me-2" />
                  <strong>Importante:</strong> Esta documentação mostra como obter os IDs necessários para conectar as plataformas ao NINETWODASH.
                </div>

                {/* Google Analytics 4 */}
                <div className="mb-5">
                  <h4 className="mb-3">
                    <Icon icon="logos:google-analytics" className="me-2" />
                    Google Analytics 4 (GA4)
                  </h4>
                  
                  <div className="alert alert-warning">
                    <Icon icon="solar:warning-bold" className="me-2" />
                    <strong>Atenção:</strong> No GA4, não existe mais "View ID" como no Universal Analytics.
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

                {/* Meta Ads */}
                <div className="mb-5">
                  <h4 className="mb-3">
                    <Icon icon="logos:facebook" className="me-2" />
                    Meta Ads (Facebook Ads)
                  </h4>

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

                {/* Google Ads */}
                <div className="mb-5">
                  <h4 className="mb-3">
                    <Icon icon="logos:google-ads" className="me-2" />
                    Google Ads
                  </h4>

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

                {/* Permissões Necessárias */}
                <div className="mb-5">
                  <h4 className="mb-3">
                    <Icon icon="solar:shield-keyhole-bold" className="me-2" />
                    Permissões Necessárias
                  </h4>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-info">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">
                            <Icon icon="logos:google-analytics" className="me-2" />
                            Google Analytics 4
                          </h6>
                        </div>
                        <div className="card-body">
                          <ul className="mb-0">
                            <li>Adicionar usuário com permissão de <strong>"Visualização"</strong></li>
                            <li>Email: <code>ninetwo@dashboard.ninetwo.com.br</code></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-primary">
                        <div className="card-header bg-primary text-white">
                          <h6 className="mb-0">
                            <Icon icon="logos:facebook" className="me-2" />
                            Meta Ads
                          </h6>
                        </div>
                        <div className="card-body">
                          <ul className="mb-0">
                            <li>Adicionar usuário com permissão de <strong>"Visualização padrão"</strong></li>
                            <li>Email: <code>ninetwo@dashboard.ninetwo.com.br</code></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="mb-5">
                  <h4 className="mb-3">
                    <Icon icon="solar:tool-bold" className="me-2" />
                    Solução de Problemas
                  </h4>

                  <div className="accordion" id="troubleshootingAccordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                          Não consigo encontrar o Property ID no GA4
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#troubleshootingAccordion">
                        <div className="accordion-body">
                          <p>Verifique se você está na propriedade correta do GA4. Se você ainda usa Universal Analytics, será necessário migrar para GA4 primeiro.</p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                          Erro de permissão no Meta Ads
                        </button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                        <div className="accordion-body">
                          <p>Certifique-se de que o usuário foi adicionado com a permissão correta. A permissão "Visualização padrão" é suficiente para leitura de dados.</p>
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                          Customer ID do Google Ads não funciona
                        </button>
                      </h2>
                      <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                        <div className="accordion-body">
                          <p>Remova os hífens do Customer ID. Por exemplo, se aparece "123-456-7890", use apenas "1234567890".</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="alert alert-success">
                  <Icon icon="solar:headphones-bold" className="me-2" />
                  <strong>Precisa de ajuda?</strong> Entre em contato com nossa equipe técnica em <strong>suporte@ninetwo.com.br</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MasterLayout>
    </ProtectedRoute>
  );
};

export default PlatformIdsDocsPage; 