import React from 'react';
import Link from 'next/link';
import { Icon } from "@iconify/react/dist/iconify.js";

export const metadata = {
  title: "Termos de Uso - WowDash",
  description: "Termos de uso da plataforma WowDash para agências de tráfego pago.",
};

const TermsPage = () => {
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
                <h1 className="text-center mb-5">Termos de Uso</h1>
                
                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">1. Aceitação dos Termos</h2>
                  <p className="text-muted">
                    Ao acessar e usar a plataforma WowDash, você concorda em cumprir e estar 
                    vinculado a estes Termos de Uso. Se você não concordar com qualquer parte 
                    destes termos, não deve usar nossos serviços.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">2. Descrição dos Serviços</h2>
                  <p className="text-muted">
                    O WowDash é uma plataforma SaaS para agências de tráfego pago gerenciarem 
                    múltiplos clientes e suas analytics conectadas ao Google Analytics 4 e Meta Ads. 
                    Nossos serviços incluem:
                  </p>
                  <ul className="text-muted">
                    <li>Dashboard de analytics para múltiplos clientes</li>
                    <li>Integração com Google Analytics 4</li>
                    <li>Integração com Meta Ads</li>
                    <li>Relatórios e métricas consolidadas</li>
                    <li>Gestão de tags e orçamentos</li>
                    <li>Suporte técnico</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">3. Elegibilidade</h2>
                  <p className="text-muted">
                    Para usar nossos serviços, você deve:
                  </p>
                  <ul className="text-muted">
                    <li>Ter pelo menos 18 anos de idade</li>
                    <li>Ter capacidade legal para celebrar contratos</li>
                    <li>Fornecer informações precisas e completas</li>
                    <li>Manter a segurança de sua conta</li>
                    <li>Usar os serviços apenas para fins legais</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">4. Criação e Segurança da Conta</h2>
                  <p className="text-muted">
                    Ao criar uma conta, você é responsável por:
                  </p>
                  <ul className="text-muted">
                    <li>Manter a confidencialidade de suas credenciais</li>
                    <li>Notificar-nos imediatamente sobre uso não autorizado</li>
                    <li>Manter informações de contato atualizadas</li>
                    <li>Ser responsável por todas as atividades em sua conta</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">5. Uso Aceitável</h2>
                  <p className="text-muted">
                    Você concorda em usar nossos serviços apenas para fins legais e de acordo 
                    com estes termos. Você não deve:
                  </p>
                  <ul className="text-muted">
                    <li>Usar os serviços para atividades ilegais</li>
                    <li>Tentar acessar sistemas não autorizados</li>
                    <li>Interferir no funcionamento da plataforma</li>
                    <li>Compartilhar credenciais de acesso</li>
                    <li>Usar bots ou scripts automatizados sem autorização</li>
                    <li>Violar direitos de propriedade intelectual</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">6. Propriedade Intelectual</h2>
                  <p className="text-muted">
                    A plataforma WowDash e todo o conteúdo relacionado são protegidos por direitos 
                    autorais, marcas registradas e outras leis de propriedade intelectual. 
                    Você não pode copiar, modificar, distribuir ou criar trabalhos derivados 
                    sem nossa autorização expressa.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">7. Pagamentos e Faturamento</h2>
                  <p className="text-muted">
                    <strong>Preços:</strong> Os preços dos nossos serviços estão disponíveis 
                    em nossa página de preços e podem ser alterados com aviso prévio.
                  </p>
                  <p className="text-muted">
                    <strong>Pagamentos:</strong> Os pagamentos são processados mensalmente 
                    e você autoriza cobranças automáticas em sua forma de pagamento.
                  </p>
                  <p className="text-muted">
                    <strong>Reembolsos:</strong> Não oferecemos reembolsos para serviços 
                    já utilizados, exceto conforme exigido por lei.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">8. Limitação de Responsabilidade</h2>
                  <p className="text-muted">
                    Em nenhuma circunstância seremos responsáveis por danos indiretos, 
                    incidentais, especiais, consequenciais ou punitivos, incluindo perda 
                    de lucros, dados ou uso, incorridos por você ou qualquer terceiro.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">9. Disponibilidade do Serviço</h2>
                  <p className="text-muted">
                    Nos esforçamos para manter a plataforma disponível 24/7, mas não 
                    garantimos disponibilidade contínua. Podemos realizar manutenção 
                    programada com aviso prévio.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">10. Rescisão</h2>
                  <p className="text-muted">
                    Você pode cancelar sua conta a qualquer momento através das configurações 
                    da plataforma. Podemos suspender ou encerrar sua conta imediatamente 
                    se você violar estes termos.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">11. Modificações dos Termos</h2>
                  <p className="text-muted">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                    Mudanças significativas serão comunicadas por email ou através de 
                    um aviso na plataforma.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">12. Lei Aplicável</h2>
                  <p className="text-muted">
                    Estes termos são regidos pelas leis do Brasil. Qualquer disputa será 
                    resolvida nos tribunais da cidade de São Paulo, SP.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">13. Disposições Gerais</h2>
                  <p className="text-muted">
                    Se qualquer disposição destes termos for considerada inválida, 
                    as demais disposições permanecerão em pleno vigor. Estes termos 
                    constituem o acordo completo entre você e a WowDash.
                  </p>
                </div>

                <div className="mb-4">
                  <h2 className="h4 text-primary mb-3">14. Contato</h2>
                  <p className="text-muted">
                    Se você tiver dúvidas sobre estes termos, entre em contato conosco:
                  </p>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><strong>Email:</strong> legal@wowdash.com</p>
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

export default TermsPage; 