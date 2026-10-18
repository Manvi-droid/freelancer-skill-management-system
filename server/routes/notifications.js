import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications (SRS F8, P2)
router.get('/my', authenticateToken, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(req.user.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(req.user.id).count;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

export default router;
