import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Endorse a skill (SRS F4, Use Case U2, P2)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { freelancer_skill_id, comment = '' } = req.body;
    const endorserId = req.user.id;

    if (!freelancer_skill_id) {
      return res.status(400).json({ error: 'Freelancer skill ID is required.' });
    }

    // Step 1: Find the skill and its owner
    const skill = db.prepare(`
      SELECT fs.*, u.full_name as freelancer_name 
      FROM freelancer_skills fs
      JOIN users u ON fs.freelancer_id = u.id
      WHERE fs.id = ?
    `).get(freelancer_skill_id);

    if (!skill) {
      return res.status(404).json({ error: 'Freelancer profile or skill has been removed/deactivated (SRS U2 Exception).' });
    }

    // Cannot endorse yourself
    if (skill.freelancer_id === endorserId) {
      return res.status(400).json({ error: 'You cannot endorse your own skills.' });
    }

    // Step 2: Check if already endorsed (SRS U2 Alternative Flow)
    const existingEndorsement = db.prepare(`
      SELECT * FROM endorsements WHERE freelancer_skill_id = ? AND endorser_id = ?
    `).get(freelancer_skill_id, endorserId);

    if (existingEndorsement) {
      // Update existing endorsement comment
      db.prepare(`
        UPDATE endorsements SET comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(comment, existingEndorsement.id);

      return res.json({
        message: 'You have already endorsed this skill. Your endorsement comment has been updated! (SRS U2 Alt Flow)',
        endorsement: { ...existingEndorsement, comment },
        wasUpdated: true,
      });
    }

    // Step 3: Record new endorsement & increment count
    const endorsementId = `end-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO endorsements (id, freelancer_skill_id, freelancer_id, endorser_id, endorser_name, endorser_role, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      endorsementId,
      freelancer_skill_id,
      skill.freelancer_id,
      endorserId,
      req.user.full_name,
      req.user.role,
      comment
    );

    // Update skill status to 'Endorsed' (if it wasn't already 'Assessed') and increment count
    const newStatus = skill.status === 'Assessed' ? 'Assessed' : 'Endorsed';
    db.prepare(`
      UPDATE freelancer_skills 
      SET status = ?, 
          endorsement_count = endorsement_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, freelancer_skill_id);

    // Step 4: Send notification to the freelancer (SRS P2)
    const notifId = `notif-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, 'endorsement')
    `).run(
      notifId,
      skill.freelancer_id,
      `New Endorsement for ${skill.skill_name}!`,
      `${req.user.full_name} (${req.user.role}) endorsed your "${skill.skill_name}" skill: "${comment || 'Strong proficiency demonstrated.'}"`
    );

    const updatedSkill = db.prepare('SELECT * FROM freelancer_skills WHERE id = ?').get(freelancer_skill_id);

    res.status(201).json({
      message: `Skill "${skill.skill_name}" successfully endorsed!`,
      skill: updatedSkill,
      wasUpdated: false,
    });
  } catch (error) {
    console.error('Error submitting endorsement:', error);
    res.status(500).json({ error: 'Failed to submit endorsement.' });
  }
});

// Get endorsements for a specific skill
router.get('/skill/:skillId', (req, res) => {
  try {
    const list = db.prepare(`
      SELECT e.*, u.avatar_url as endorser_avatar
      FROM endorsements e
      LEFT JOIN users u ON e.endorser_id = u.id
      WHERE e.freelancer_skill_id = ?
      ORDER BY e.created_at DESC
    `).all(req.params.skillId);

    res.json({ endorsements: list });
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ error: 'Failed to retrieve endorsements.' });
  }
});

export default router;
