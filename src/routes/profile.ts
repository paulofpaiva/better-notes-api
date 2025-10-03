import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, blacklistedTokens } from '../schemas/users.js';
import { notes } from '../schemas/notes.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const notesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(notes)
      .where(eq(notes.userId, req.user!.id));

    const foldersCount = 0;

    res.json({
      message: 'User profile retrieved successfully',
      user: {
        ...req.user,
        notesCount: notesCount[0].count,
        foldersCount,
        memberSince: req.user!.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as profileRoutes };
