import { pgTable, uuid, varchar, timestamp, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 150 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const blacklistedTokens = pgTable('blacklisted_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BlacklistedToken = typeof blacklistedTokens.$inferSelect;
