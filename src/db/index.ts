import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as usersSchema from '../schemas/users.js';
import * as notesSchema from '../schemas/notes.js';
import * as notesMediaSchema from '../schemas/notesMedia.js';

const schema = {
  ...usersSchema,
  ...notesSchema,
  ...notesMediaSchema,
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
