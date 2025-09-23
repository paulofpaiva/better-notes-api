import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users, blacklistedTokens } from '../schemas/users.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, 'Password must contain at least one number and one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const generateToken = (userId: string, email: string) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

router.post('/sign-up', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: name || null,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      });

    const token = generateToken(newUser[0].id, newUser[0].email);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: error.errors 
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sign-in', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    const token = generateToken(user[0].id, user[0].email);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        createdAt: user[0].createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid data',
        details: error.errors 
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;
    
    if (token) {
      const decoded = jwt.decode(token) as any;
      
      if (decoded && decoded.exp) {
        await db.insert(blacklistedTokens).values({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        });
      }
    }
  
    res.clearCookie('auth_token');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('auth_token');
    res.json({ message: 'Logout successful' });
  }
});

router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    message: 'Authenticated user',
    user: req.user,
  });
});

export { router as authRoutes };
