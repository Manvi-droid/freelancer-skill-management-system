import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to log admin actions (SRS S5)
function logAdminAction(adminId, adminName, action, targetType, targetId, details) {
  const logId = `log-${uuidv4().substring(0, 8)}`;
  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, target_type, target_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(logId, adminId, adminName, action, targetType, targetId, details);
}

// Platform Analytics & Metrics (SRS F10)
router.get('/metrics', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const totalFreelancers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'freelancer'").get().count;
    const totalClients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get().count;
    const totalSkills = db.prepare("SELECT COUNT(*) as count FROM freelancer_skills").get().count;
    const verifiedSkills = db.prepare("SELECT COUNT(*) as count FROM freelancer_skills WHERE status IN ('Assessed', 'Endorsed')").get().count;
    const totalEndorsements = db.prepare("SELECT COUNT(*) as count FROM endorsements").get().count;
    const totalAssessmentsTaken = db.prepare("SELECT COUNT(*) as count FROM assessment_results").get().count;
    const passedAssessments = db.prepare("SELECT COUNT(*) as count FROM assessment_results WHERE passed = 1").get().count;
    const pendingEvidence = db.prepare("SELECT COUNT(*) as count FROM evidence WHERE status = 'Uploaded'").get().count;

    // Breakdown by category
    const categoryBreakdown = db.prepare(`
      SELECT category_name, COUNT(*) as count
      FROM freelancer_skills
      GROUP BY category_name
      ORDER BY count DESC
    `).all();

    // Breakdown by verification status
    const statusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM freelancer_skills
      GROUP BY status
    `).all();

    res.json({
      metrics: {
        totalFreelancers,
        totalClients,
        totalSkills,
        verifiedSkills,
        verificationRate: totalSkills > 0 ? Math.round((verifiedSkills / totalSkills) * 100) : 0,
        totalEndorsements,
        totalAssessmentsTaken,
        passedAssessments,
        assessmentPassRate: totalAssessmentsTaken > 0 ? Math.round((passedAssessments / totalAssessmentsTaken) * 100) : 0,
        pendingEvidence,
      },
      categoryBreakdown,
      statusBreakdown,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Failed to retrieve platform analytics.' });
  }
});

// Moderation Queue for evidence (SRS F9)
router.get('/moderation-queue', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const items = db.prepare(`
      SELECT e.*, fs.skill_name, u.full_name as freelancer_name, u.email as freelancer_email
      FROM evidence e
      JOIN freelancer_skills fs ON e.freelancer_skill_id = fs.id
      JOIN users u ON e.freelancer_id = u.id
      ORDER BY 
        CASE e.status WHEN 'Uploaded' THEN 1 WHEN 'Flagged' THEN 2 ELSE 3 END,
        e.created_at DESC
    `).all();

    res.json({ moderationItems: items });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Failed to load moderation queue.' });
  }
});

// Moderate evidence item (Approve, Reject, Flag) (SRS F9, S5)
router.post('/moderation/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { status, notes = '' } = req.body; // status: 'Verified', 'Flagged', 'Rejected'
    const evidenceId = req.params.id;

    if (!['Verified', 'Flagged', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation status.' });
    }

    const item = db.prepare(`
      SELECT e.*, fs.skill_name, u.full_name as freelancer_name, e.freelancer_id
      FROM evidence e
      JOIN freelancer_skills fs ON e.freelancer_skill_id = fs.id
      JOIN users u ON e.freelancer_id = u.id
      WHERE e.id = ?
    `).get(evidenceId);

    if (!item) {
      return res.status(404).json({ error: 'Evidence item not found.' });
    }

    db.prepare('UPDATE evidence SET status = ?, notes = ? WHERE id = ?').run(status, notes, evidenceId);

    // If verified, ensure skill status reflects verification
    if (status === 'Verified') {
      db.prepare(`
        UPDATE freelancer_skills 
        SET status = CASE WHEN status = 'Pending' THEN 'Endorsed' ELSE status END
        WHERE id = ?
      `).run(item.freelancer_skill_id);
    }

    // Notify freelancer
    const notifTitle = status === 'Verified' ? 'Evidence Verified ✅' : `Evidence Update: ${status}`;
    const notifMsg = `Your uploaded document "${item.title}" for ${item.skill_name} has been reviewed and marked as ${status}. ${notes ? `Admin notes: ${notes}` : ''}`;
    const notifId = `notif-${uuidv4().substring(0, 8)}`;
    db.prepare('INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)').run(
      notifId,
      item.freelancer_id,
      notifTitle,
      notifMsg,
      'admin'
    );

    // Audit log (SRS S5)
    logAdminAction(
      req.user.id,
      req.user.full_name,
      `EVIDENCE_${status.toUpperCase()}`,
      'EVIDENCE',
      evidenceId,
      `Marked evidence "${item.title}" for ${item.freelancer_name} as ${status}. Notes: ${notes}`
    );

    res.json({ message: `Evidence marked as ${status}.`, updatedStatus: status });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ error: 'Failed to process moderation action.' });
  }
});

// Add new Skill Category (SRS F9, 4.3 Adaptability)
router.post('/categories', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, description = '', icon = 'Folder' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const id = `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    db.prepare('INSERT INTO categories (id, name, description, icon) VALUES (?, ?, ?, ?)').run(id, name, description, icon);

    logAdminAction(req.user.id, req.user.full_name, 'CATEGORY_CREATED', 'CATEGORY', id, `Added category: ${name}`);

    res.status(201).json({ message: `Category "${name}" created successfully.`, categoryId: id });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Category already exists or creation failed.' });
  }
});

// Add new standard Skill to Taxonomy (SRS F9, 4.3 Adaptability)
router.post('/skills', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { category_id, name, description = '' } = req.body;
    if (!category_id || !name) {
      return res.status(400).json({ error: 'Category ID and skill name are required.' });
    }

    const id = `tax-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    db.prepare('INSERT INTO skills_taxonomy (id, category_id, name, description) VALUES (?, ?, ?, ?)').run(id, category_id, name, description);

    logAdminAction(req.user.id, req.user.full_name, 'SKILL_TAXONOMY_CREATED', 'SKILL', id, `Added skill "${name}" to category ${category_id}`);

    res.status(201).json({ message: `Skill "${name}" added to taxonomy.`, skillId: id });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Skill already exists in this category or creation failed.' });
  }
});

// Audit Logs Viewer (SRS S5)
router.get('/audit-logs', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});

export default router;
