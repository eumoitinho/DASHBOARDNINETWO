# WowDash - Plataforma para Agências de Tráfego Pago

Uma plataforma completa para agências de tráfego pago gerenciarem múltiplos clientes e suas analytics conectadas ao Google Analytics 4 e Meta Ads.

## 🚀 Funcionalidades

### **Gestão de Clientes**
- ✅ Lista de clientes com status de conexão
- ✅ Adicionar/editar clientes
- ✅ Configurações de API (GA4 e Meta Ads)
- ✅ Teste de conectividade
- ✅ Status de sincronização

### **Analytics por Cliente**
- ✅ Dashboard específico por cliente
- ✅ Dados do Google Analytics 4
- ✅ Dados do Meta Ads
- ✅ Períodos de análise (7, 30, 90 dias)
- ✅ Métricas consolidadas

### **Dashboard da Agência**
- ✅ Visão geral de todos os clientes
- ✅ Estatísticas consolidadas
- ✅ Clientes recentes
- ✅ Ações rápidas

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **Bootstrap 5** - CSS Framework
- **Iconify** - Ícones
- **React Hooks** - Gerenciamento de estado

## 📦 Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd NINETWODASH

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── clients/           # Lista de clientes
│   ├── add-client/        # Adicionar cliente
│   ├── edit-client/       # Editar cliente
│   ├── client-analytics/  # Analytics do cliente
│   └── index-9/          # Dashboard principal
├── components/            # Componentes React
│   ├── ClientList.jsx     # Lista de clientes
│   ├── AddEditClient.jsx  # Formulário de cliente
│   ├── ClientAnalytics.jsx # Analytics específicas
│   ├── AgencyDashboard.jsx # Dashboard da agência
│   ├── LoadingSpinner.jsx # Componente de loading
│   └── Notification.jsx   # Sistema de notificações
└── masterLayout/          # Layout principal
    └── MasterLayout.jsx   # Sidebar e navegação
```

## 🔧 Configuração

### **Google Analytics 4**
1. Acesse o Google Analytics
2. Configure a propriedade GA4
3. Obtenha o Property ID e View ID
4. Configure no formulário do cliente

### **Meta Ads**
1. Acesse o Facebook Business Manager
2. Configure a conta de anúncios
3. Obtenha o Ad Account ID e Pixel ID
4. Configure no formulário do cliente

## 🚀 Próximos Passos

- [ ] Backend/API para persistência de dados
- [ ] Integração real com GA4 API
- [ ] Integração real com Meta Ads API
- [ ] Sistema de autenticação
- [ ] Relatórios avançados
- [ ] Gráficos interativos
- [ ] Exportação de dados
- [ ] Notificações em tempo real

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.
