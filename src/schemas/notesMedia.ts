import { pgTable, serial, integer, text, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { notes } from './notes.js';

export const notesMedia = pgTable('notes_media', {
  id: serial('id').primaryKey(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  mediaUrl: text('media_url').notNull(),
  mediaType: varchar('media_type', { length: 50 }).notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type NoteMedia = typeof notesMedia.$inferSelect;
export type NewNoteMedia = typeof notesMedia.$inferInsert;
