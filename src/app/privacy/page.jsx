import React from 'react';
import Link from 'next/link';
import { Icon } from "@iconify/react/dist/iconify.js";

export const metadata = {
  title: "Política de Privacidade - WowDash",
  description: "Política de privacidade da plataforma WowDash para agências de tráfego pago.",
};

const PrivacyPage = () => {
  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <Link href="/" className="text-decoration-none">
              <div className="d-flex align-items-center">
                <Icon icon="solar:chart-2-bold" className="text-primary fs-2 me-2" />
                <span className="fs-4 fw-bold text-dark">WowDash</span>
              </div>
            </Link>
            <div className="d-flex gap-3">
              <Link href="/sign-in" className="btn btn-outline-primary btn-sm">
                Entrar
              </Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm">
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h1 className="text-center mb-5">Política de Privacidade</h1>
                
                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">1. Informações Coletadas</h2>
                  <p className="text-muted">
                    Coletamos informações que você nos fornece diretamente, como quando cria uma conta, 
                    configura seu perfil ou utiliza nossos serviços. Isso pode incluir:
                  </p>
                  <ul className="text-muted">
                    <li>Informações de identificação pessoal (nome, email, telefone)</li>
                    <li>Informações da empresa (nome da empresa, CNPJ, endereço)</li>
                    <li>Dados de configuração de APIs (Google Analytics, Meta Ads)</li>
                    <li>Informações de uso da plataforma</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">2. Como Utilizamos Suas Informações</h2>
                  <p className="text-muted">
                    Utilizamos suas informações para:
                  </p>
                  <ul className="text-muted">
                    <li>Fornecer e melhorar nossos serviços</li>
                    <li>Processar pagamentos e faturas</li>
                    <li>Enviar comunicações importantes sobre sua conta</li>
                    <li>Fornecer suporte técnico</li>
                    <li>Analisar o uso da plataforma para melhorias</li>
                    <li>Cumprir obrigações legais</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">3. Compartilhamento de Informações</h2>
                  <p className="text-muted">
                    Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                    exceto nas seguintes situações:
                  </p>
                  <ul className="text-muted">
                    <li>Com seu consentimento explícito</li>
                    <li>Para cumprir obrigações legais</li>
                    <li>Com prestadores de serviços que nos ajudam a operar a plataforma</li>
                    <li>Para proteger nossos direitos e segurança</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">4. Segurança dos Dados</h2>
                  <p className="text-muted">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger 
                    suas informações pessoais contra acesso não autorizado, alteração, divulgação 
                    ou destruição.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">5. Cookies e Tecnologias Similares</h2>
                  <p className="text-muted">
                    Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                    analisar o uso da plataforma e personalizar conteúdo. Você pode controlar 
                    o uso de cookies através das configurações do seu navegador.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">6. Seus Direitos</h2>
                  <p className="text-muted">
                    Você tem o direito de:
                  </p>
                  <ul className="text-muted">
                    <li>Acessar suas informações pessoais</li>
                    <li>Corrigir informações imprecisas</li>
                    <li>Solicitar a exclusão de seus dados</li>
                    <li>Limitar o processamento de seus dados</li>
                    <li>Portabilidade de seus dados</li>
                    <li>Opor-se ao processamento de seus dados</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">7. Retenção de Dados</h2>
                  <p className="text-muted">
                    Mantemos suas informações pessoais pelo tempo necessário para fornecer 
                    nossos serviços, cumprir obrigações legais, resolver disputas e fazer 
                    cumprir nossos acordos.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">8. Transferências Internacionais</h2>
                  <p className="text-muted">
                    Suas informações podem ser transferidas e processadas em países diferentes 
                    do seu país de residência. Garantimos que essas transferências sejam feitas 
                    de acordo com as leis de proteção de dados aplicáveis.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">9. Menores de Idade</h2>
                  <p className="text-muted">
                    Nossos serviços não são destinados a menores de 18 anos. Não coletamos 
                    intencionalmente informações pessoais de menores de idade.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">10. Alterações nesta Política</h2>
                  <p className="text-muted">
                    Podemos atualizar esta política de privacidade periodicamente. 
                    Notificaremos você sobre mudanças significativas através do email 
                    ou através de um aviso em nossa plataforma.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">11. Contato</h2>
                  <p className="text-muted">
                    Se você tiver dúvidas sobre esta política de privacidade ou sobre 
                    como tratamos suas informações pessoais, entre em contato conosco:
                  </p>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><strong>Email:</strong> privacy@wowdash.com</p>
                    <p className="mb-1"><strong>Telefone:</strong> (11) 9999-9999</p>
                    <p className="mb-0"><strong>Endereço:</strong> Rua das Flores, 123 - São Paulo, SP</p>
                  </div>
                </div>

                <div className="text-center mt-5">
                  <p className="text-muted mb-0">
                    <small>Última atualização: {new Date().toLocaleDateString('pt-BR')}</small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-0">&copy; 2024 WowDash. Todos os direitos reservados.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <Link href="/terms" className="text-light text-decoration-none me-3">
                Termos de Uso
              </Link>
              <Link href="/privacy" className="text-light text-decoration-none">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage; 