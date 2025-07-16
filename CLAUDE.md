# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# NINETWODASH - Marketing Digital Dashboard

## 🛠️ DEVELOPMENT COMMANDS

```bash
# Development server
pnpm dev                # Start development server on localhost:3000
npm run dev            # Alternative with npm

# Build and production
pnpm build             # Build for production
pnpm start             # Start production server
npm run build          # Alternative with npm
npm run start          # Alternative with npm

# Code quality
npm run lint           # Run ESLint for code quality checks

# Package management
pnpm install           # Install dependencies (preferred)
npm install            # Alternative with npm
```

## 🏗️ ARCHITECTURE OVERVIEW

This is a **Next.js 15** application using the **App Router** pattern with the following key architectural decisions:

### Core Technologies
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with modern hooks
- **Bootstrap 5** - CSS framework for responsive design
- **ApexCharts** - Interactive data visualization
- **Iconify** - Icon system
- **jQuery/DataTables** - Legacy table components

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.jsx         # Root layout with metadata
│   ├── page.jsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── [feature]/         # Feature-based routing
│   └── client-analytics/[id]/ # Dynamic client routes
├── components/            # React components
│   ├── [FeatureName].jsx  # Page-level components
│   ├── child/             # Sub-components and widgets
│   └── AgencyDashboard.jsx # Main dashboard component
├── masterLayout/          # Layout system
│   └── MasterLayout.jsx   # Sidebar navigation & main layout
└── helper/                # Utility components and functions
```

### Key Components Architecture
- **MasterLayout.jsx** - Main layout with sidebar navigation and theme toggle
- **AgencyDashboard.jsx** - Overview dashboard with client statistics
- **ClientAnalytics.jsx** - Individual client performance dashboards
- **ClientList.jsx** - Client management interface
- **AddEditClient.jsx** - Client CRUD operations

### Data Flow Patterns
- Components use **useState/useEffect** for local state management
- Mock data simulation with setTimeout for development
- Dynamic imports for ApexCharts to prevent SSR issues
- Client-side rendering with `"use client"` directive

### Important Development Notes
- **reactStrictMode: false** in next.config.js - be aware of potential development/production differences
- Uses **pnpm** as preferred package manager (pnpm-lock.yaml present)
- **Bootstrap 5** classes are used throughout for styling
- **Iconify React** for icons with `@iconify/react/dist/iconify.js` import pattern
- **ApexCharts** requires dynamic import with `{ ssr: false }` for SSR compatibility
- Client list is hardcoded in MasterLayout.jsx (lines 15-36) with 20 client objects

### Styling Approach
- Global styles in `src/app/globals.css` and `src/app/font.css`
- Bootstrap 5 utility classes throughout components
- Custom CSS files in `public/assets/css/` for additional styling
- Theme toggle functionality implemented via ThemeToggleButton component

### Routing Patterns
- App Router with dynamic routes like `client-analytics/[id]/page.jsx`
- Client navigation handled through usePathname and Link components
- Master layout wraps all pages with consistent sidebar and navigation

## 📋 CONTEXTO DO PROJETO

**Projeto:** NINETWODASH - Dashboard de Marketing Digital
**Cliente:** Catalisti Holdings / M2Z Agency
**Localização:** `D:\CATALISTI\M2Z\PROPRIETARIO\NINETWODASH`

### Objetivo Principal
Implementar um dashboard completo que integre dados em tempo real das APIs do Google Ads e Facebook Marketing para 20 clientes da agência, consolidando métricas de performance em uma interface moderna e responsiva.

### Clientes a Implementar (20 total)
1. Catalisti Holding ⭐ (prioritário - dados de referência já existem)
2. ABC EVO
3. Dr. Victor Mauro
4. Dr. Percio
5. CWTremds
6. Global Best Part
7. LJ Santos
8. Favretto Mídia Exterior
9. Favretto Comunicação Visual
10. Mundial
11. Naframe
12. Motin Films
13. Naport
14. Autoconnect Prime
15. Vtelco Networks
16. Amitech
17. Hogrefe Construtora
18. Colaço Engenharia
19. Pesados Web
20. Eleva Corpo e Alma

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológico
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+ com Tailwind CSS
- **Charts:** Recharts
- **State Management:** Zustand
- **Validação:** Zod
- **APIs:** Google Ads API + Facebook Marketing API
- **Cache:** LRU Cache + Redis (opcional)
- **Auth:** JWT com NextAuth

### Estrutura de Pastas
```
NINETWODASH/
├── app/
│   ├── api/
│   │   └── dashboard/
│   │       ├── [client]/route.ts
│   │       └── overview/route.ts
│   ├── dashboards/
│   │   ├── catalisti-holding/page.tsx
│   │   ├── abc-evo/page.tsx
│   │   └── [outros-clientes]/page.tsx
│   └── globals.css
├── lib/
│   ├── google-ads.ts
│   ├── facebook-ads.ts
│   ├── auth.ts
│   ├── cache.ts
│   └── utils.ts
├── components/
│   ├── dashboard/
│   │   ├── ClientDashboard.tsx
│   │   ├── KPICard.tsx
│   │   ├── MetricsChart.tsx
│   │   └── CampaignsTable.tsx
│   └── ui/
├── stores/
│   └── dashboardStore.ts
├── types/
│   └── dashboard.ts
├── middleware.ts
├── .env.local
└── package.json
```

---

## ✅ STATUS ATUAL DO PROJETO

### 🎉 FUNCIONALIDADES COMPLETADAS
- ✅ **Gestão de Clientes** - Lista, adicionar, editar com status de conexão
- ✅ **Analytics por Cliente** - Dashboard específico com 7 tipos de charts interativos
- ✅ **Dashboard da Agência** - Visão geral consolidada com estatísticas
- ✅ **Sistema de Tags** - Gerenciamento completo de tags para clientes
- ✅ **Controle de Orçamentos** - Gestão financeira e status de campanhas
- ✅ **Navegação Dinâmica** - Sidebar com lista de 20 clientes reais
- ✅ **Sistema de Notificações** - Componente de feedback ao usuário
- ✅ **Charts Interativos** - 7 tipos: Area, Donut, Line, Bar, Pie, Radar
- ✅ **Layout Responsivo** - Design consistente com Bootstrap 5
- ✅ **Correções SSR** - ApexCharts carregando dinamicamente

### 📊 COMPONENTES IMPLEMENTADOS
```
src/components/
├── ClientList.jsx          ✅ Lista de clientes
├── AddEditClient.jsx       ✅ Formulário CRUD
├── ClientAnalytics.jsx     ✅ Dashboard individual
├── ClientCharts.jsx        ✅ 7 tipos de charts
├── AgencyDashboard.jsx     ✅ Dashboard geral
├── DashboardsList.jsx      ✅ Lista de dashboards
├── ClientTagsManager.jsx   ✅ Gestão de tags
├── BudgetManager.jsx       ✅ Controle orçamentário
├── LoadingSpinner.jsx      ✅ Loading states
└── Notification.jsx        ✅ Sistema de feedback
```

### 🗂️ PÁGINAS FUNCIONAIS
```
src/app/
├── clients/                ✅ Lista de clientes
├── add-client/            ✅ Adicionar cliente
├── edit-client/[id]/      ✅ Editar cliente
├── client-analytics/[id]/ ✅ Analytics específicas
├── client-tags/           ✅ Gerenciar tags
├── budgets/               ✅ Orçamentos
└── dashboards/            ✅ Lista de dashboards
```

## ✅ INTEGRAÇÕES DE API IMPLEMENTADAS

### 🚀 NOVA FUNCIONALIDADE: APIS REAIS
- ✅ **Google Ads API** - Integração completa implementada
- ✅ **Facebook Marketing API** - Integração completa implementada
- ✅ **Sistema de Cache** - LRU Cache com TTL configurável
- ✅ **Middleware de Segurança** - Rate limiting e autenticação
- ✅ **Endpoints Consolidados** - APIs unificadas por cliente
- ✅ **Tratamento de Erros** - Fallback para dados mock
- ✅ **Teste de Conexões** - Endpoint para validar APIs

### 📁 ARQUIVOS CRIADOS
```
types/dashboard.ts              ✅ Definições TypeScript
lib/cache.ts                   ✅ Sistema de cache LRU
lib/google-ads.ts              ✅ Cliente Google Ads API
lib/facebook-ads.ts            ✅ Cliente Facebook Marketing API
middleware.ts                  ✅ Segurança e rate limiting
.env.local.example             ✅ Template de configuração

src/app/api/
├── google-ads/[client]/       ✅ Endpoint Google Ads
├── facebook-ads/[client]/     ✅ Endpoint Facebook Ads
├── dashboard/[client]/        ✅ Endpoint consolidado
└── test-connections/          ✅ Teste de APIs
```

### 🔧 COMPONENTES ATUALIZADOS
- ✅ **ClientAnalytics.jsx** - Agora usa APIs reais com fallback
- ✅ **Tratamento de Erros** - Display de erros e status da API
- ✅ **KPIs Dinâmicos** - Métricas reais das APIs
- ✅ **Fonte de Dados** - Indicador se são dados reais ou mock

## 🎯 CONFIGURAÇÃO PARA USO

### 1. Configurar Variáveis de Ambiente
```bash
# Copiar template e configurar
cp .env.local.example .env.local

# Editar com suas credenciais reais
# Google Ads API, Facebook Marketing API, etc.
```

### 2. Testar Conexões
```bash
# Acessar endpoint de teste
GET /api/test-connections

# Testará automaticamente:
# - Google Ads API
# - Facebook Marketing API  
# - Cache status
# - Configurações do sistema
```

### 3. Usar Dados Reais
```bash
# No .env.local, definir:
USE_MOCK_DATA=false

# Para manter dados simulados durante desenvolvimento:
USE_MOCK_DATA=true
```

## 🎯 PRÓXIMAS PRIORIDADES

### FASE 1: CONFIGURAÇÃO E TESTES (Alta Prioridade)
1. **Instalar dependências necessárias**
   ```bash
   npm install google-ads-api facebook-business-sdk zod jose lru-cache date-fns
   ```

2. **Criar arquivo .env.local para configurações**
   ```bash
   # Google Ads API
   GOOGLE_ADS_DEVELOPER_TOKEN=
   GOOGLE_ADS_CLIENT_ID=
   GOOGLE_ADS_CLIENT_SECRET=
   GOOGLE_ADS_REFRESH_TOKEN=
   
   # Facebook Marketing API
   FACEBOOK_APP_ID=
   FACEBOOK_APP_SECRET=
   FACEBOOK_ACCESS_TOKEN=
   
   # Cliente IDs específicos
   GOOGLE_ADS_CATALISTI_ID=
   FACEBOOK_CATALISTI_ID=
   
   # Security
   NEXTAUTH_SECRET=
   API_KEY=ninetwodash-secure-key-2025
   ```

3. **Criar serviços de integração**
   - `lib/google-ads.ts` - Serviço Google Ads API
   - `lib/facebook-ads.ts` - Serviço Facebook Marketing API
   - `lib/cache.ts` - Sistema de cache LRU

4. **Implementar endpoints da API**
   - `app/api/google-ads/[client]/route.ts`
   - `app/api/facebook-ads/[client]/route.ts`
   - `app/api/dashboard/[client]/route.ts` - Dados consolidados

### FASE 2: SEGURANÇA E PERFORMANCE (Média Prioridade)
5. **Implementar middleware de segurança**
   - `middleware.ts` - Rate limiting e autenticação
   - Validação de API keys
   - Controle de acesso por cliente

6. **Sistema de cache inteligente**
   - Cache de 15 minutos para dados de campanha
   - Cache de 1 hora para dados históricos
   - Invalidação automática

### FASE 3: DADOS REAIS PRIMEIRO CLIENTE (Catalisti Holding)
7. **Configurar Catalisti Holding com APIs reais**
   - Testar conexão Google Ads
   - Testar conexão Facebook Ads
   - Validar métricas de referência

8. **Migrar dados mock para dados reais**
   - Atualizar ClientAnalytics.jsx
   - Implementar tratamento de erros
   - Loading states para APIs

---

## 📊 MÉTRICAS A IMPLEMENTAR

### KPIs Principais
- **Impressões** - Total de visualizações
- **Cliques** - Interações dos usuários
- **Custo** - Investimento total
- **Conversões** - Ações valiosas

### Métricas Calculadas
- **CTR** - Taxa de cliques (clicks/impressions * 100)
- **CPC** - Custo por clique (cost/clicks)
- **CPM** - Custo por mil impressões (cost/impressions * 1000)
- **Taxa de Conversão** - (conversions/clicks * 100)
- **ROAS** - Retorno sobre investimento

### Dados de Referência (Catalisti Holding)
```javascript
// Baseado no dashboard atual do cliente
const referenciaMetrics = {
  totalInvestimento: 1996.65,
  totalLeads: 18,
  cplGoogle: 110.93,
  impressoes: 14923,
  cliques: 138,
  cpc: 14.47,
  cpm: 133.80
};
```

---

## 🔧 CÓDIGO DE REFERÊNCIA

### Estrutura da API Response
```typescript
interface DashboardResponse {
  client: string;
  dateRange: { from: string; to: string };
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    totalConversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    conversionRate: number;
    roas: number;
  };
  campaigns: Array<{
    platform: 'google_ads' | 'facebook';
    campaignId: string;
    campaignName: string;
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    date: string;
    ctr: number;
    cpc: number;
    cpm: number;
  }>;
  lastUpdated: string;
}
```

### Mapeamento de Clientes
```typescript
const clientRouteMapping = {
  'catalisti-holding': 'Catalisti Holding',
  'abc-evo': 'ABC EVO',
  'dr-victor-mauro': 'Dr. Victor Mauro',
  'dr-percio': 'Dr. Percio',
  'cwtrends': 'CWTremds',
  'global-best-part': 'Global Best Part',
  // ... continuar para todos os 20 clientes
};
```

---

## 🧪 ESTRATÉGIA DE TESTE

### Fase de Desenvolvimento
1. **Mock Data** - Usar dados simulados durante desenvolvimento
2. **Catalisti Holding** - Primeiro cliente com dados reais
3. **Validação API** - Testar uma campanha de cada plataforma
4. **Escalabilidade** - Implementar para todos os clientes

### Dados Mock para Desenvolvimento
```javascript
const mockCatalistiData = {
  summary: {
    totalImpressions: 14923,
    totalClicks: 138,
    totalCost: 1996.65,
    totalConversions: 18,
    ctr: 0.92,
    cpc: 14.47,
    cpm: 133.80,
    conversionRate: 13.04,
    roas: 1.35
  }
};
```

---

## ⚡ IMPLEMENTAÇÃO IMEDIATA

### Comandos para Executar
```bash
# 1. Instalar dependências
npm install google-ads-api facebook-business-sdk zustand zod jose lru-cache recharts date-fns

# 2. Criar estrutura de pastas
mkdir -p lib components/dashboard stores app/api/dashboard types

# 3. Configurar .env.local
cp .env.example .env.local
```

### Ordem de Criação dos Arquivos
1. `types/dashboard.ts` - Definições TypeScript
2. `lib/google-ads.ts` - Integração Google Ads
3. `lib/facebook-ads.ts` - Integração Facebook
4. `stores/dashboardStore.ts` - Estado global
5. `app/api/dashboard/[client]/route.ts` - API endpoints
6. `components/dashboard/ClientDashboard.tsx` - Componente principal
7. `app/dashboards/catalisti-holding/page.tsx` - Primeira página

---

## 🎯 CRITÉRIOS DE SUCESSO

### Funcionalidades Mínimas (MVP)
- [ ] Dashboard da Catalisti Holding funcionando com dados reais
- [ ] Integração Google Ads + Facebook funcionando
- [ ] KPIs básicos exibidos corretamente
- [ ] Gráficos interativos implementados
- [ ] Sistema de cache básico funcionando

### Funcionalidades Completas
- [ ] Todos os 20 clientes implementados
- [ ] Visão geral da agência funcionando
- [ ] Sistema de autenticação implementado
- [ ] Rate limiting e segurança configurados
- [ ] Performance otimizada (< 2s carregamento)

---

## 🚨 NOTAS IMPORTANTES

1. **Priorizar Catalisti Holding** - Cliente de referência com dados existentes
2. **Usar dados mock** durante desenvolvimento para não esgotar rate limits
3. **Implementar cache agressivo** - Google Ads API tem limite de 15k operations/day
4. **Manter compatibilidade** com estrutura existente do NINETWODASH
5. **Documentar** cada integração para facilitar manutenção

---

## 📞 PRÓXIMOS PASSOS

1. **Analisar estrutura atual** do projeto NINETWODASH
2. **Implementar integração** para Catalisti Holding primeiro
3. **Testar com dados reais** das APIs
4. **Escalar para todos os clientes** gradualmente
5. **Otimizar performance** e adicionar recursos avançados

**OBJETIVO:** Dashboard completo funcionando em 1-2 semanas com dedicação de 4-6h/dia.

---

*Este arquivo serve como guia completo para implementação do NINETWODASH. Seguir esta estrutura garante um desenvolvimento organizado e eficiente.*