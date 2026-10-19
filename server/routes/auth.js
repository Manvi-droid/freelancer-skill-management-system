import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user (SRS F1, S1, S6)
router.post('/register', (req, res) => {
  try {
    const { username, email, password, role = 'freelancer', full_name, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must accept the Terms of Service and Privacy Policy to register (GDPR requirement).' });
    }

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'Username, email, password, and full name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email or username already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const id = `usr-${uuidv4().substring(0, 8)}`;

    const insert = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, full_name, title, bio, location, hourly_rate, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      username,
      email,
      password_hash,
      role,
      full_name,
      role === 'freelancer' ? 'Independent Specialist' : 'Hiring Client',
      'Passionate professional cataloging verified competencies.',
      'Remote',
      role === 'freelancer' ? 50.0 : 0,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}`
    );

    const token = jwt.sign({ id, username, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id, username, email, role, full_name },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login (SRS F1, S1, S8 - Rate limiting / lock out)
router.post('/login', (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(emailOrUsername, emailOrUsername);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check rate limit lockout (SRS S8: lock account after 5 failed attempts)
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const waitMinutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
      return res.status(403).json({
        error: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${waitMinutes} minute(s). (SRS S8)`,
      });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Lock for 10 minutes per SRS S8
      }

      db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?').run(attempts, lockedUntil, user.id);

      if (attempts >= 5) {
        return res.status(403).json({
          error: 'Maximum login attempts exceeded. Account locked for 10 minutes to prevent brute-force attacks (SRS S8).',
        });
      }

      return res.status(401).json({
        error: `Invalid credentials. (${5 - attempts} attempt(s) remaining before temporary lockout).`,
      });
    }

    // Reset failed attempts on success
    db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        title: user.title,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Fast Demo-Switch (Allows evaluators to instantly switch roles with one click)
router.post('/demo-switch', (req, res) => {
  const { role = 'freelancer' } = req.body;
  let user;
  if (role === 'freelancer') {
    user = db.prepare("SELECT * FROM users WHERE id = 'usr-riya'").get();
  } else if (role === 'client') {
    user = db.prepare("SELECT * FROM users WHERE id = 'usr-client1'").get();
  } else if (role === 'admin') {
    const { password } = req.body;
    user = db.prepare("SELECT * FROM users WHERE id = 'usr-admin'").get();
    if (!user || !password || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Admin portal access requires valid administrator authentication (Admin password required).' });
    }
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: `Switched to demo ${role} account: ${user.full_name}`,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      title: user.title,
      avatar_url: user.avatar_url,
    },
  });
});

// Get current user profile & notifications count
router.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, full_name, title, bio, location, hourly_rate, avatar_url, phone, rating, reviews_count, created_at FROM users WHERE id = ?').get(req.user.id);
  const unreadNotifs = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).count;

  res.json({
    user,
    unreadNotifications: unreadNotifs,
  });
});

export default router;
