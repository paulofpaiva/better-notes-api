# Better Notes API

API Node.js com Express, Drizzle ORM e PostgreSQL para gerenciamento de notas.

## Estrutura do Projeto

```
better-notes-api/
├── src/
│   ├── db/
│   │   └── index.ts          # Configuração do banco de dados
│   ├── middleware/
│   │   └── auth.ts           # Middleware de autenticação
│   ├── routes/
│   │   ├── auth.ts           # Rotas de autenticação
│   │   └── notes.ts          # Rotas de notas
│   ├── schemas/              # Schemas do Drizzle
│   │   ├── users.ts          # Schema de usuários
│   │   ├── notes.ts          # Schema de notas
│   │   └── notesMedia.ts     # Schema de mídia das notas
│   └── index.ts              # Arquivo principal
├── drizzle/                  # Migrações do banco
├── drizzle.config.ts         # Configuração do Drizzle
├── package.json
├── tsconfig.json
└── env.example               # Exemplo de variáveis de ambiente
```

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

3. Configure as variáveis no arquivo `.env`:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/better_notes

# JWT - Use uma chave secreta forte em produção
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random

# Server
PORT=3001
NODE_ENV=development

# API Base URL (para servir arquivos estáticos)
API_BASE_URL=http://localhost:3001
```

4. Execute as migrações do banco:
```bash
npm run db:generate
npm run db:migrate
```

**Nota**: A API usa o schema `better_notes` no PostgreSQL. O schema será criado automaticamente durante a migração.

## Estrutura do Banco de Dados

A API utiliza o schema `better_notes` no PostgreSQL com as seguintes tabelas:

### Tabela `users`
- `id` (UUID) - Chave primária
- `email` (VARCHAR) - Email único do usuário
- `password_hash` (VARCHAR) - Hash da senha
- `name` (VARCHAR) - Nome do usuário
- `created_at` (TIMESTAMP) - Data de criação

### Tabela `notes`
- `id` (SERIAL) - Chave primária
- `user_id` (UUID) - Referência ao usuário
- `title` (TEXT) - Título da nota
- `content` (JSONB) - Conteúdo rico em formato estruturado
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

### Tabela `notes_media`
- `id` (SERIAL) - Chave primária
- `note_id` (INTEGER) - Referência à nota
- `media_url` (TEXT) - URL da mídia
- `media_type` (VARCHAR) - Tipo da mídia ("image", "video", "gif")
- `position` (INTEGER) - Ordem da mídia na nota
- `created_at` (TIMESTAMP) - Data de criação

## Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm run start` - Executa a versão compilada
- `npm run db:generate` - Gera migrações do banco
- `npm run db:migrate` - Executa migrações do banco
- `npm run db:studio` - Abre o Drizzle Studio

## Autenticação JWT

A API implementa autenticação JWT completa com as seguintes funcionalidades:

### Rotas de Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/me` - Obter dados do usuário autenticado

### Exemplo de Uso

#### Registrar usuário:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "name": "Nome do Usuário"
  }'
```

#### Fazer login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

#### Acessar rota protegida:
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: auth_token=seu-jwt-token-aqui"
```

### Configuração do JWT

- **Expiração**: 7 dias
- **Armazenamento**: Cookie httpOnly
- **Segurança**: Configurado para produção com HTTPS

## Próximos Passos

1. ✅ Schemas do Drizzle para usuários
2. ✅ Rotas de autenticação (registro, login, logout)
3. Implementar CRUD de notas
4. ✅ Validação com Zod
5. Implementar upload de arquivos se necessário

## Tecnologias Utilizadas

- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT para autenticação
- Zod para validação
