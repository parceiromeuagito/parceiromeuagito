# 🚀 Projeto Parceiros Meu Agito

## 📋 Visão Geral

O **parceirosmeuagito.com** é um **Portal de Gestão Completo** desenvolvido para parceiros (estabelecimentos comerciais) da plataforma Meu Agito. É uma aplicação web moderna que permite aos estabelecimentos gerenciarem todos os aspectos do seu negócio.

---

## 🎯 Propósito da Aplicação

### Objetivo Principal

Fornecer uma **plataforma unificada** para que parceiros (restaurantes, lojas, hotéis, prestadores de serviço, organizadores de eventos) possam:

1. **Receber e gerenciar pedidos** vindos da plataforma Meu Agito
2. **Operar um PDV (Ponto de Venda)** para vendas balcão
3. **Gerenciar cardápio/catálogo** de produtos e serviços
4. **Acompanhar métricas e relatórios** de desempenho
5. **Comunicar-se com clientes** via chat integrado
6. **Criar campanhas de marketing** com IA

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Tecnologia        | Versão   | Função                   |
| ----------------- | -------- | ------------------------ |
| **React**         | 19.1.0   | Framework UI             |
| **TypeScript**    | 5.8.3    | Tipagem estática         |
| **Vite**          | 6.3.5    | Build tool               |
| **Zustand**       | 5.0.9    | Gerenciamento de estado  |
| **TailwindCSS**   | 3.4.1    | Estilização              |
| **React Router**  | 7.10.0   | Roteamento SPA           |
| **ECharts**       | 6.0.0    | Gráficos e visualizações |
| **Framer Motion** | 12.23.25 | Animações                |
| **Radix UI**      | Vários   | Componentes acessíveis   |
| **Playwright**    | 1.57.0   | Testes E2E               |

### Estrutura de Diretórios

```
src/
├── components/        # 37 componentes reutilizáveis
│   ├── ui/           # 16 componentes base (Button, Input, Modal...)
│   ├── dashboard/    # Cards e widgets do dashboard
│   ├── pos/          # Componentes do PDV
│   ├── orders/       # Componentes de pedidos
│   └── ...
├── contexts/         # 6 React Contexts
│   ├── AppContext        # Usuário/Autenticação
│   ├── OrderContext      # Gestão de Pedidos
│   ├── PartnerContext    # Estado principal do parceiro
│   ├── NotificationContext # Sistema de notificações
│   ├── SecurityContext   # Segurança e permissões
│   └── ToastContext      # Mensagens toast
├── store/            # 8 Zustand Stores
│   ├── useBusinessStore   # Configurações do negócio
│   ├── useCashRegisterStore # Controle de caixa
│   ├── useOrderStore      # Estado de pedidos
│   ├── usePOSStore        # Estado do PDV
│   └── ...
├── pages/            # 10 páginas principais
├── types/            # Definições TypeScript
├── lib/              # Utilitários e helpers
├── hooks/            # Custom React hooks
└── services/         # Serviços e APIs
```

---

## 📱 Páginas e Funcionalidades

### 1. 🔐 Login (`/login`)

- Autenticação de parceiros
- Verificação de tipo de conta (`partner`)
- Redirecionamento automático

### 2. 📊 Dashboard (`/dashboard`)

**Hub central de métricas e insights**

- **Estatísticas em tempo real:**
  - Receita Total
  - Pedidos Ativos
  - Pedidos Concluídos
  - Tendências (%)
- **AI Insights Card:** Sugestões inteligentes baseadas em IA
- **Gráfico de Desempenho:** Receita por período (ECharts)
- **Feed de Atividades:** Últimos eventos
- **Dashboards por Serviço:** Métricas específicas por tipo

### 3. 📦 Pedidos (`/dashboard/orders`)

**Central de gestão de pedidos**

- **Tipos suportados:**
  - `delivery` - Entrega
  - `pickup` - Retirada
  - `table` - Mesa
  - `booking` - Agendamento
  - `event` - Evento
  - `stay` - Hospedagem

- **Status disponíveis:**
  - `pending` → `preparing` → `ready` → `delivering` → `completed`
  - `cancelled`, `rejected`, `returned`

- **Funcionalidades:**
  - Filtros por status/tipo
  - Atualização de status em tempo real
  - Histórico de mudanças
  - Chat com cliente

### 4. 🛒 PDV / POS (`/dashboard/pos`)

**Ponto de Venda para vendas presenciais**

- Seleção de produtos do catálogo
- Carrinho de compras
- **Múltiplas formas de pagamento:**
  - Dinheiro (com cálculo de troco)
  - Cartão (crédito/débito com parcelas)
  - PIX
  - Pagamento dividido
- Integração com gestão de caixa
- Impressão de cupom

### 5. 🍔 Menu / Catálogo (`/dashboard/menu`)

**Gestão completa de produtos e serviços**

- **Tipos de itens:**
  - `food` - Alimentos
  - `product` - Produtos
  - `service` - Serviços
  - `event` - Eventos
  - `accommodation` - Hospedagem
  - `combo` - Combos

- **Controle de inventário:**
  - Estoque atual
  - Alerta de estoque baixo
  - Dedução automática ao aceitar pedido

- **Atributos flexíveis:**
  - Cores, tamanhos (produtos)
  - Duração (serviços)
  - Data, local (eventos)
  - Capacidade, amenidades (hospedagem)

### 6. 👥 Clientes (`/dashboard/customers`)

**CRM básico**

- Lista de clientes
- Histórico de compras
- Status (ativo, VIP, bloqueado)
- Notas internas

### 7. 💬 Chat (`/dashboard/chat`)

**Comunicação com clientes**

- Conversas por pedido
- Mensagens em tempo real
- Histórico persistente

### 8. 📈 Relatórios (`/dashboard/reports`)

**Análises e exportações**

- Relatórios de vendas
- Performance por período
- Exportação CSV/PDF

### 9. 🎨 Creative Studio (`/dashboard/creative-studio`)

**Criação de campanhas com IA**

- Geração de campanhas
- Templates personalizados
- Previsão de demanda

### 10. ⚙️ Configurações (`/dashboard/settings`)

**Personalização completa**

- **Perfil do negócio**
- **Tipos de negócio habilitados**
- **Gestão de equipe** (admin, manager, cashier, kitchen, staff)
- **Configurações de impressora**
- **Planos Premium** (starter, pro, enterprise)
- **Integrações** (iFood, Booking, Rappi...)
- **Notificações**
- **Segurança**

---

## 🔧 Sistemas Internos

### Gestão de Caixa

```typescript
interface CashRegisterState {
  isOpen: boolean;
  openedAt?: Date;
  closedAt?: Date;
  startAmount: number;
  currentBalance: number;
  transactions: CashTransaction[];
}
```

- Abertura/Fechamento de caixa
- Suprimentos e sangrias
- Registro automático de vendas em dinheiro

### Controle de Estoque

- Verificação de disponibilidade antes de aceitar pedido
- Dedução automática ao processar
- Alertas de estoque baixo
- Desativação automática quando esgota

### Sistema de Planos

| Plano          | Recursos                          |
| -------------- | --------------------------------- |
| **Starter**    | Funcionalidades básicas           |
| **Pro**        | Relatórios avançados, integrações |
| **Enterprise** | IA, múltiplos estabelecimentos    |

### Contexto de Negócio Adaptativo

O sistema adapta a interface automaticamente baseado no tipo de negócio:

- **Restaurant:** Foco em pedidos e cozinha
- **Hotel:** Check-in/out, quartos
- **Scheduling:** Agenda e horários
- **Tickets:** Eventos e ingressos
- **Delivery:** Entregas e rotas

---

## 🔐 Autenticação e Segurança

- **ProtectedRoute:** Verifica autenticação em todas as rotas do dashboard
- **SecurityProvider:** Contexto de segurança
- **Roles de usuário:** Controle de acesso por função
- Apenas usuários com `accountType: 'partner'` têm acesso

---

## 🌐 Integração com Ecossistema

### Marketplaces Suportados

- iFood
- Rappi
- UberEats
- Booking.com
- Eventbrite
- Google Reserve

### Fontes de Pedidos (`OrderSource`)

- `online` - App/Site Meu Agito
- `counter` - Balcão/PDV
- `marketplace_ifood`, `marketplace_rappi`, etc.

---

## 🎨 Design System

- **Tema escuro** como padrão
- **Cor primária:** Laranja vibrante (`#f97316`)
- **Componentes Radix UI** para acessibilidade
- **Animações Framer Motion** para UX premium
- **Responsivo** para desktop e tablet

---

## 📂 Arquivos Principais

| Arquivo               | Função                        |
| --------------------- | ----------------------------- |
| `App.tsx`             | Roteamento e providers        |
| `PartnerContext.tsx`  | Estado principal (766 linhas) |
| `OrderContext.tsx`    | Gestão de pedidos             |
| `useBusinessStore.ts` | Configurações do negócio      |
| `usePOSStore.ts`      | Estado do PDV                 |

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes E2E
npx playwright test
```

---

## 📝 Resumo Executivo

O **Parceiros Meu Agito** é uma aplicação completa de gestão para estabelecimentos comerciais que:

1. ✅ Centraliza operações de múltiplos canais de venda
2. ✅ Oferece PDV integrado para vendas presenciais
3. ✅ Gerencia estoque e inventário automaticamente
4. ✅ Fornece insights baseados em IA
5. ✅ Se adapta a diferentes tipos de negócio
6. ✅ Integra com principais marketplaces
7. ✅ Mantém comunicação direta com clientes
8. ✅ Gera relatórios e métricas em tempo real

**É a ferramenta essencial para parceiros maximizarem suas vendas e eficiência operacional na plataforma Meu Agito.**
