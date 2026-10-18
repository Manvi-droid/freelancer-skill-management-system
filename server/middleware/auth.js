import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fsms_jwt_secret_free_tier_safe_key_2026';

/**
 * Authentication middleware that verifies JWT and enforces session validity
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }

    // Verify user still exists in DB
    const user = db.prepare('SELECT id, username, email, role, full_name, avatar_url, locked_until FROM users WHERE id = ?').get(decodedUser.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({ error: 'Account temporarily locked due to security policy.' });
    }

    req.user = user;
    next();
  });
}

/**
 * Role-Based Access Control (RBAC) middleware (SRS S3)
 * @param  {...string} allowedRoles 
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role "${req.user.role}" does not have sufficient privileges. Required: ${allowedRoles.join(' or ')}`,
      });
    }
    next();
  };
}

export { JWT_SECRET };
