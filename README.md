# Better Notes API

A modern Node.js API built with Express, Drizzle ORM, and PostgreSQL for rich note management with authentication and pagination.

## Features

- **JWT Authentication** with secure password requirements
- **Rich Text Notes** with structured content (headings, paragraphs, lists)
- **Cursor-based Pagination** for efficient data loading
- **Token Blacklisting** for secure logout
- **Input Validation** with Zod schemas
- **TypeScript** for type safety

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp env.example .env
```

3. Configure o `DATABASE_URL` no arquivo `.env` com suas credenciais do PostgreSQL.

4. Execute as migrações do banco:
```bash
npm run db:generate
npm run db:migrate
```

5. **Start the development server:**
```bash
npm run dev
```

## Rich Content Format

Notes support structured content with the following block types:

### Text Markings
- `bold: boolean` - Bold text
- `italic: boolean` - Italic text
- `underline: boolean` - Underlined text
- `strikethrough: boolean` - Strikethrough text

### Block Types

#### Heading
```json
{
  "type": "heading",
  "level": 1, // 1, 2, or 3
  "children": [{"text": "Heading Text", "bold": true}]
}
```

#### Paragraph
```json
{
  "type": "paragraph",
  "children": [{"text": "Paragraph content"}]
}
```

#### List
```json
{
  "type": "list",
  "style": "bullet", // "bullet" or "dash"
  "children": [
    {"text": "List item 1"},
    {"text": "List item 2"}
  ]
}
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled version
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## Security Features

- **JWT Authentication** with 7-day expiration
- **HttpOnly Cookies** for token storage
- **Password Hashing** with bcrypt (12 rounds)
- **Token Blacklisting** for secure logout
- **Input Validation** with Zod schemas
- **CORS** configured for development origins

## Tech Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

## Development

For production deployment, ensure:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure HTTPS
- Set up proper CORS origins