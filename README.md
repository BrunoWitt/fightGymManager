Classic — Painel de Gestão (Demo)

Aplicação web para gestão de uma academia/centro de lutas, cobrindo **alunos, turmas/horários e financeiro mensal**.
---

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com **JWT armazenado em cookie HttpOnly**
- Rotas protegidas no Frontend (React Router + validação via `/me`)

### 👥 Alunos
- Listagem com filtros (UI)
- **CRUD** (criar/editar/desativar)
- Detalhes do aluno:
  - turmas ativas
  - histórico de pagamentos
  - turmas vinculadas a cada pagamento

### 🗓️ Turmas e horários
- CRUD de turmas
- Definição de professor
- Configuração de **horários por dia da semana**
- Endpoint de **turmas de hoje** (por dia da semana)

### 💰 Financeiro
- Geração automática de mensalidades do mês
- Marcar mensalidade como **paga/em aberto** + observação
- **Resumo do mês**:
  - receitas previstas/recebidas/em aberto
  - despesas previstas/pagas/em aberto
  - saldo em caixa e saldo previsto
- Controle de despesas:
  - criar/editar/excluir
  - status paga/em aberto

---

## 🧰 Stack

**Backend**
- FastAPI
- psycopg2
- Pydantic
- JWT (PyJWT)
- bcrypt

**Frontend**
- React + Vite
- React Router
- TailwindCSS

**Banco**
- PostgreSQL

---
