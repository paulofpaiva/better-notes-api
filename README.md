# Better Notes API

A modern Node.js API built with Express, Drizzle ORM, and PostgreSQL for rich note management with authentication and pagination.

## Features

- 🔐 **JWT Authentication** with secure password requirements
- 📝 **Rich Text Notes** with structured content (headings, paragraphs, lists)
- 🔄 **Cursor-based Pagination** for efficient data loading
- 🗑️ **Token Blacklisting** for secure logout
- 🛡️ **Input Validation** with Zod schemas
- 🎨 **TypeScript** for type safety

## Project Structure

```
better-notes-api/
├── src/
│   ├── db/
│   │   └── index.ts          # Database configuration
│   ├── middleware/
│   │   └── auth.ts           # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   └── notes.ts          # Notes CRUD routes
│   ├── schemas/              # Drizzle schemas
│   │   ├── users.ts          # Users schema
│   │   ├── notes.ts          # Notes schema with rich content
│   │   └── notesMedia.ts     # Notes media schema
│   └── index.ts              # Main server file
├── drizzle/                  # Database migrations
├── docs/                     # Documentation
├── drizzle.config.ts         # Drizzle configuration
├── package.json
├── tsconfig.json
└── env.example               # Environment variables example
```

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

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique user email
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `name` (VARCHAR) - User display name
- `created_at` (TIMESTAMP) - Account creation date

### Notes Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `title` (TEXT) - Note title
- `content` (JSONB) - Rich structured content
- `created_at` (TIMESTAMP) - Note creation date
- `updated_at` (TIMESTAMP) - Last modification date

### Notes Media Table
- `id` (SERIAL) - Primary key
- `note_id` (UUID) - Foreign key to notes
- `media_url` (TEXT) - Media file URL
- `media_type` (VARCHAR) - Media type (image, video, gif)
- `position` (INTEGER) - Display order
- `created_at` (TIMESTAMP) - Upload date

### Blacklisted Tokens Table
- `id` (SERIAL) - Primary key
- `token` (TEXT) - Invalidated JWT token
- `expires_at` (TIMESTAMP) - Token expiration
- `created_at` (TIMESTAMP) - Blacklist date

## API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Sign In
```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: auth_token=your-jwt-token
```

#### Get Current User
```http
GET /api/auth/me
Cookie: auth_token=your-jwt-token
```

### Notes

#### List Notes (Paginated)
```http
GET /api/notes?limit=10&cursor=2024-01-15T10:30:00.000Z
Cookie: auth_token=your-jwt-token
```

#### Create Note
```http
POST /api/notes
Content-Type: application/json
Cookie: auth_token=your-jwt-token

{
  "title": "My Note",
  "content": [
    {
      "type": "heading",
      "level": 1,
      "children": [{"text": "Main Title", "bold": true}]
    },
    {
      "type": "paragraph",
      "children": [{"text": "This is a paragraph with "}, {"text": "bold text", "bold": true}]
    },
    {
      "type": "list",
      "style": "bullet",
      "children": [
        {"text": "Item 1"},
        {"text": "Item 2"}
      ]
    }
  ]
}
```

#### Get Note
```http
GET /api/notes/{note-id}
Cookie: auth_token=your-jwt-token
```

#### Update Note
```http
PUT /api/notes/{note-id}
Content-Type: application/json
Cookie: auth_token=your-jwt-token

{
  "title": "Updated Title",
  "content": [...]
}
```

#### Delete Note
```http
DELETE /api/notes/{note-id}
Cookie: auth_token=your-jwt-token
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

## Password Requirements

- Minimum 6 characters
- At least 1 number
- At least 1 special character: `!@#$%^&*()_+-=[]{};':"\\|,.<>/?`

## Pagination

The notes endpoint uses cursor-based pagination:

- `limit`: Number of items per page (1-50, default: 10)
- `cursor`: ISO timestamp of the last item from previous page

Response includes:
- `hasNextPage`: Boolean indicating if more pages exist
- `nextCursor`: Timestamp for next page request
- `limit`: Current page size

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

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

## Development

The API runs on `http://localhost:3001` by default. All responses are in English and follow RESTful conventions.

For production deployment, ensure:
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure HTTPS
- Set up proper CORS origins