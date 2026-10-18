import express from 'express';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get full public freelancer profile with skills and evidence (SRS F1, 3.3.1)
router.get('/freelancers/:id', (req, res) => {
  try {
    const freelancer = db.prepare(`
      SELECT id, username, email, full_name, title, bio, location, hourly_rate, avatar_url, phone, rating, reviews_count, created_at
      FROM users WHERE id = ? AND role = 'freelancer'
    `).get(req.params.id);

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer profile not found.' });
    }

    // Get skills
    const skills = db.prepare(`
      SELECT fs.*, 
        (SELECT COUNT(*) FROM endorsements WHERE freelancer_skill_id = fs.id) as endorsement_count
      FROM freelancer_skills fs
      WHERE fs.freelancer_id = ?
      ORDER BY 
        CASE fs.status 
          WHEN 'Assessed' THEN 1 
          WHEN 'Endorsed' THEN 2 
          WHEN 'Pending' THEN 3 
          ELSE 4 
        END,
        fs.created_at DESC
    `).all(req.params.id);

    // Get evidence for each skill
    const evidence = db.prepare(`
      SELECT * FROM evidence WHERE freelancer_id = ? ORDER BY created_at DESC
    `).all(req.params.id);

    // Group evidence by skill
    const skillsWithEvidence = skills.map(skill => ({
      ...skill,
      evidence: evidence.filter(e => e.freelancer_skill_id === skill.id),
    }));

    res.json({
      freelancer,
      skills: skillsWithEvidence,
      totalEvidenceCount: evidence.length,
    });
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    res.status(500).json({ error: 'Failed to retrieve freelancer profile.' });
  }
});

// Update current user's profile (SRS F1, S3)
router.put('/me', authenticateToken, (req, res) => {
  try {
    const { full_name, title, bio, location, hourly_rate, phone, avatar_url } = req.body;

    const update = db.prepare(`
      UPDATE users SET 
        full_name = COALESCE(?, full_name),
        title = COALESCE(?, title),
        bio = COALESCE(?, bio),
        location = COALESCE(?, location),
        hourly_rate = COALESCE(?, hourly_rate),
        phone = COALESCE(?, phone),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(full_name, title, bio, location, hourly_rate, phone, avatar_url, req.user.id);

    const updatedUser = db.prepare('SELECT id, username, email, role, full_name, title, bio, location, hourly_rate, avatar_url, phone, rating, reviews_count FROM users WHERE id = ?').get(req.user.id);

    res.json({
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// GDPR Data Export (SRS S6, Section 5.3)
router.get('/gdpr/export', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    const userData = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const skills = db.prepare('SELECT * FROM freelancer_skills WHERE freelancer_id = ?').all(userId);
    const evidence = db.prepare('SELECT * FROM evidence WHERE freelancer_id = ?').all(userId);
    const endorsementsGiven = db.prepare('SELECT * FROM endorsements WHERE endorser_id = ?').all(userId);
    const endorsementsReceived = db.prepare('SELECT * FROM endorsements WHERE freelancer_id = ?').all(userId);
    const assessmentResults = db.prepare('SELECT * FROM assessment_results WHERE freelancer_id = ?').all(userId);
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ?').all(userId);

    const exportBundle = {
      compliance: 'GDPR Article 20 - Right to Data Portability',
      generated_at: new Date().toISOString(),
      account_holder: userData,
      cataloged_skills: skills,
      uploaded_evidence: evidence,
      endorsements_received: endorsementsReceived,
      endorsements_given: endorsementsGiven,
      assessment_history: assessmentResults,
      in_app_notifications: notifications,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="fsms_gdpr_export_${req.user.username}.json"`);
    res.json(exportBundle);
  } catch (error) {
    console.error('GDPR export error:', error);
    res.status(500).json({ error: 'Failed to generate GDPR data export.' });
  }
});

// GDPR Account Deletion (Right to be Forgotten - SRS S6)
router.delete('/gdpr/delete-account', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    // Strict cascading delete via foreign keys enabled in database.js
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({
      message: 'Your account and all associated skills, evidence, and records have been permanently purged per GDPR Article 17.',
    });
  } catch (error) {
    console.error('GDPR deletion error:', error);
    res.status(500).json({ error: 'Failed to process account deletion.' });
  }
});

export default router;
