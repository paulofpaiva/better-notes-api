import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { notes, noteContentSchema } from '../schemas/notes.js';
import { notesMedia } from '../schemas/notesMedia.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq, and, lt } from 'drizzle-orm';

const router = Router();

const mediaItemSchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video', 'gif']),
  position: z.number().int().min(0),
});

const createNoteSchema = z.object({
  title: z.string().optional(),
  content: noteContentSchema,
  media: z.array(mediaItemSchema).optional().default([]),
});

const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: noteContentSchema.optional(),
  media: z.array(mediaItemSchema).optional(), // se enviado, substitui as mídias
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Limit must be between 1 and 50' });
    }

    let whereCondition = eq(notes.userId, req.user!.id);

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (isNaN(cursorDate.getTime())) {
        return res.status(400).json({ error: 'Invalid cursor format' });
      }
      
      whereCondition = and(
        eq(notes.userId, req.user!.id),
        lt(notes.updatedAt, cursorDate)
      )!;
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(whereCondition)
      .orderBy(notes.updatedAt)
      .limit(limit + 1);

    const hasNextPage = userNotes.length > limit;
    const notesToReturn = hasNextPage ? userNotes.slice(0, limit) : userNotes;
    
    const nextCursor = hasNextPage && notesToReturn.length > 0 
      ? notesToReturn[notesToReturn.length - 1].updatedAt.toISOString()
      : null;

    res.json({
      message: 'Notes retrieved successfully',
      notes: notesToReturn,
      pagination: {
        hasNextPage,
        nextCursor,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, content, media } = createNoteSchema.parse(req.body);

    const newNote = await db
      .insert(notes)
      .values({
        userId: req.user!.id,
        title: title || null,
        content,
      })
      .returning();

    if (media && media.length > 0) {
      await db.insert(notesMedia).values(
        media.map(m => ({
          noteId: newNote[0].id,
          mediaUrl: m.mediaUrl,
          mediaType: m.mediaType,
          position: m.position,
        }))
      );
    }

    const createdMedia = await db
      .select()
      .from(notesMedia)
      .where(eq(notesMedia.noteId, newNote[0].id));

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        ...newNote[0],
        media: createdMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid data',
        details: error.errors,
      });
    }
    
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;

    const note = await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.id, noteId),
          eq(notes.userId, req.user!.id)
        )
      )
      .limit(1);

    if (note.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      message: 'Note retrieved successfully',
      note: note[0],
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;

    const { title, content, media } = updateNoteSchema.parse(req.body);

    const updatedNote = await db
      .update(notes)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notes.id, noteId),
          eq(notes.userId, req.user!.id)
        )
      )
      .returning();

    if (updatedNote.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (Array.isArray(media)) {
      await db.delete(notesMedia).where(eq(notesMedia.noteId, noteId));
      if (media.length > 0) {
        await db.insert(notesMedia).values(
          media.map(m => ({
            noteId,
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType,
            position: m.position,
          }))
        );
      }
    }

    const currentMedia = await db
      .select()
      .from(notesMedia)
      .where(eq(notesMedia.noteId, noteId));

    res.json({
      message: 'Note updated successfully',
      note: {
        ...updatedNote[0],
        media: currentMedia,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid data',
        details: error.errors,
      });
    }
    
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;

    const deletedNote = await db
      .delete(notes)
      .where(
        and(
          eq(notes.id, noteId),
          eq(notes.userId, req.user!.id)
        )
      )
      .returning();

    if (deletedNote.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as notesRoutes };