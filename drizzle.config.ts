import type { Config } from 'drizzle-kit';
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export default {
  schema: './src/schemas/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
