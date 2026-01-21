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
<img width="1919" height="946" alt="Screenshot_1" src="https://github.com/user-attachments/assets/dabfb116-5069-42dd-9dc7-3f7a82fd6c4a" />
<img width="1919" height="951" alt="Screenshot_2" src="https://github.com/user-attachments/assets/b86c9ec9-89ec-4728-a610-adb9177ab675" />
<img width="1919" height="943" alt="Screenshot_3" src="https://github.com/user-attachments/assets/614c9dd2-c05c-4baf-89da-33a3d3e321a3" />
<img width="1919" height="949" alt="Screenshot_4" src="https://github.com/user-attachments/assets/abe52ba4-50bc-4889-a4c8-7bac154488b9" />
<img width="1573" height="958" alt="Screenshot_5" src="https://github.com/user-attachments/assets/8697804c-277e-4b72-a199-a020b37c246c" />


