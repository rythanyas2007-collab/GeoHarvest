import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';
import { generateToken } from '../middleware/auth';
import { UserRole } from '../../src/types/index';

const router = Router();

// GET /api/auth/roles - list all 8 available roles and pre-configured demo users
router.get('/roles', async (req: Request, res: Response) => {
  try {
    const users = await dbRepository.getUsers();
    const demoProfiles = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation,
      department: u.department,
      district: u.district
    }));
    res.json({ profiles: demoProfiles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    let user = null;

    if (email) {
      user = await dbRepository.getUserByEmail(email);
    } else if (role) {
      const users = await dbRepository.getUsers();
      user = users.find(u => u.role === role);
    }

    if (!user) {
      res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'No registered user found for the provided credentials.'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        error: 'ACCOUNT_INACTIVE',
        message: 'This user account is inactive. Please contact the Super Administrator.'
      });
      return;
    }

    const token = generateToken(user.id);

    // Audit log
    await dbRepository.logAction({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      category: 'AUTH',
      details: `User signed in successfully with role '${user.role}' (${user.designation}).`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.json({
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal login error' });
  }
});

// POST /api/auth/switch-role (for instantaneous testing across all 8 roles)
router.post('/switch-role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body as { role: UserRole };
    const users = await dbRepository.getUsers();
    const targetUser = users.find(u => u.role === role);

    if (!targetUser) {
      res.status(404).json({ error: `User with role ${role} not found` });
      return;
    }

    const token = generateToken(targetUser.id);

    await dbRepository.logAction({
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      action: 'ROLE_SWITCH',
      category: 'AUTH',
      details: `Demonstration environment: Switched active testing session to role '${role}'.`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.json({
      token,
      user: targetUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch role' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  if (!req.user) {
    // If not authenticated, return default public viewer profile
    const users = await dbRepository.getUsers();
    const publicUser = users.find(u => u.role === 'public_viewer');
    res.json({
      user: publicUser || null,
      isAuthenticated: false
    });
    return;
  }

  res.json({
    user: req.user,
    isAuthenticated: true
  });
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  if (req.user) {
    await dbRepository.logAction({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_LOGOUT',
      category: 'AUTH',
      details: `User signed out.`,
      ipAddress: req.ip,
      isDemonstration: true
    });
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
