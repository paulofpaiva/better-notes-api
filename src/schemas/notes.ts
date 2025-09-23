import { pgTable, serial, uuid, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { z } from 'zod';

export const textMarkSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
});

export const noteTextSchema = z.object({
  text: z.string(),
}).merge(textMarkSchema);

export const headingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  children: z.array(noteTextSchema),
});

export const paragraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  children: z.array(noteTextSchema),
});

export const listBlockSchema = z.object({
  type: z.literal('list'),
  style: z.union([z.literal('bullet'), z.literal('dash')]),
  children: z.array(noteTextSchema),
});

export const noteBlockSchema = z.union([
  headingBlockSchema,
  paragraphBlockSchema,
  listBlockSchema,
]);

export const noteContentSchema = z.array(noteBlockSchema);
export type NoteContent = z.infer<typeof noteContentSchema>;

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: jsonb('content').$type<NoteContent>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
