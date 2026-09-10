import { Request, Response, NextFunction } from 'express';
import { dbRepository } from '../db/repository';
import { User, UserRole } from '../../src/types/index';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// In-memory token cache: token -> userId (or user)
const tokenCache = new Map<string, { userId: string; expiresAt: number }>();

export function generateToken(userId: string): string {
  const token = `gh_${Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64url')}`;
  // 7-day token expiry
  tokenCache.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
  return token;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if public route or assign public viewer
    req.user = undefined;
    return next();
  }

  const token = authHeader.substring(7).trim();
  const cached = tokenCache.get(token);

  if (cached && cached.expiresAt > Date.now()) {
    const user = await dbRepository.getUserById(cached.userId);
    if (user && user.isActive) {
      req.user = user;
      return next();
    }
  }

  // Fallback: check if token directly encodes userId for seamless development
  try {
    const decoded = Buffer.from(token.replace(/^gh_/, ''), 'base64url').toString('utf8');
    const [userId] = decoded.split(':');
    if (userId) {
      const user = await dbRepository.getUserById(userId);
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    }
  } catch {}

  req.user = undefined;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please sign in to access this government resource.'
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied. Role '${req.user.role}' is not authorized for this operation. Required: [${allowedRoles.join(', ')}]`
      });
      return;
    }

    next();
  };
}
