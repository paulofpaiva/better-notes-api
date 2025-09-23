import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users, blacklistedTokens } from '../schemas/users.js'
import { eq, and, gt } from 'drizzle-orm'

interface JwtPayload {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string | null
        createdAt: Date
      }
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_token

    if (!token) {
      return res.status(401).json({ error: 'Access token not provided' })
    }

    const blacklistedToken = await db
      .select()
      .from(blacklistedTokens)
      .where(
        and(
          eq(blacklistedTokens.token, token),
          gt(blacklistedTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (blacklistedToken.length > 0) {
      return res.status(401).json({ error: 'Token has been invalidated' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)

    if (userResult.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = userResult[0]
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }
    
    console.error('Authentication error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_token

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1)

      if (userResult.length > 0) {
        req.user = userResult[0]
      }
    }
    
    next()
  } catch (error) {
    next()
  }
}
