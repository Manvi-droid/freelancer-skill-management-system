import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadEvidenceFile } from '../config/aws-s3.js';

const router = express.Router();

// Get skill categories and standard taxonomy (SRS Section 4.3 Adaptability)
router.get('/taxonomy', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    const skills = db.prepare('SELECT * FROM skills_taxonomy ORDER BY name ASC').all();

    const categorized = categories.map(cat => ({
      ...cat,
      skills: skills.filter(s => s.category_id === cat.id),
    }));

    res.json({
      categories: categorized,
      totalTaxonomySkills: skills.length,
    });
  } catch (error) {
    console.error('Error fetching taxonomy:', error);
    res.status(500).json({ error: 'Failed to retrieve skill taxonomy.' });
  }
});

// Get current freelancer's skills with evidence and endorsement counts (SRS F2, 3.1.1)
router.get('/my-skills', authenticateToken, requireRole('freelancer'), (req, res) => {
  try {
    const skills = db.prepare(`
      SELECT fs.*,
        (SELECT COUNT(*) FROM endorsements WHERE freelancer_skill_id = fs.id) as endorsement_count
      FROM freelancer_skills fs
      WHERE fs.freelancer_id = ?
      ORDER BY fs.created_at DESC
    `).all(req.user.id);

    const evidence = db.prepare('SELECT * FROM evidence WHERE freelancer_id = ?').all(req.user.id);

    const fullSkills = skills.map(s => ({
      ...s,
      evidence: evidence.filter(e => e.freelancer_skill_id === s.id),
    }));

    res.json({ skills: fullSkills });
  } catch (error) {
    console.error('Error fetching my-skills:', error);
    res.status(500).json({ error: 'Failed to retrieve skills.' });
  }
});

// Add a skill to freelancer profile (SRS F2 - "adding a skill takes no more than 3 clicks")
router.post('/my-skills', authenticateToken, requireRole('freelancer'), (req, res) => {
  try {
    const { skill_name, category_name = 'Web Development', proficiency_level = 'Intermediate' } = req.body;

    if (!skill_name) {
      return res.status(400).json({ error: 'Skill name is required.' });
    }

    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (!validLevels.includes(proficiency_level)) {
      return res.status(400).json({ error: `Invalid proficiency level. Must be one of: ${validLevels.join(', ')}` });
    }

    // Check duplicate
    const existing = db.prepare('SELECT id FROM freelancer_skills WHERE freelancer_id = ? AND LOWER(skill_name) = LOWER(?)').get(req.user.id, skill_name);
    if (existing) {
      return res.status(400).json({ error: 'You have already added this skill to your profile.' });
    }

    const id = `fsk-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO freelancer_skills (id, freelancer_id, skill_name, category_name, proficiency_level, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `).run(id, req.user.id, skill_name.trim(), category_name, proficiency_level);

    const newSkill = db.prepare('SELECT * FROM freelancer_skills WHERE id = ?').get(id);

    res.status(201).json({
      message: `Skill "${skill_name}" added successfully!`,
      skill: { ...newSkill, evidence: [] },
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Failed to add skill.' });
  }
});

// Update skill proficiency level (SRS F2)
router.put('/my-skills/:id', authenticateToken, requireRole('freelancer'), (req, res) => {
  try {
    const { proficiency_level } = req.body;
    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (!validLevels.includes(proficiency_level)) {
      return res.status(400).json({ error: 'Invalid proficiency level.' });
    }

    const result = db.prepare(`
      UPDATE freelancer_skills 
      SET proficiency_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND freelancer_id = ?
    `).run(proficiency_level, req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Skill not found or access denied.' });
    }

    const updated = db.prepare('SELECT * FROM freelancer_skills WHERE id = ?').get(req.params.id);
    res.json({ message: 'Skill level updated successfully!', skill: updated });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Failed to update skill.' });
  }
});

// Delete skill
router.delete('/my-skills/:id', authenticateToken, requireRole('freelancer'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM freelancer_skills WHERE id = ? AND freelancer_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Skill not found or unauthorized.' });
    }
    res.json({ message: 'Skill deleted successfully.' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
});

// Upload Supporting Documentation / Evidence / Portfolio Item (SRS F3, S7)
// Integrates with File Storage Engine (Local / Object Storage)
router.post('/evidence', authenticateToken, requireRole('freelancer'), upload.single('evidenceFile'), async (req, res) => {
  try {
    const { freelancer_skill_id, title = 'Skill Evidence', notes = '' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please select a file to upload (PDF, PNG, JPG, ZIP).' });
    }

    if (!freelancer_skill_id) {
      return res.status(400).json({ error: 'Skill ID is required to link evidence.' });
    }

    // Verify ownership of skill
    const skill = db.prepare('SELECT id, skill_name FROM freelancer_skills WHERE id = ? AND freelancer_id = ?').get(freelancer_skill_id, req.user.id);
    if (!skill) {
      return res.status(404).json({ error: 'Selected skill was not found on your profile.' });
    }

    // Process upload via evidence file storage adapter
    const uploadResult = await uploadEvidenceFile(req.file);

    const id = `ev-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO evidence (id, freelancer_skill_id, freelancer_id, title, file_url, file_type, file_size, storage_type, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Uploaded', ?)
    `).run(
      id,
      freelancer_skill_id,
      req.user.id,
      title,
      uploadResult.fileUrl,
      req.file.mimetype,
      req.file.size,
      uploadResult.storageType,
      notes
    );

    const savedEvidence = db.prepare('SELECT * FROM evidence WHERE id = ?').get(id);

    res.status(201).json({
      message: `Evidence uploaded successfully via ${uploadResult.storageType.toUpperCase()}!`,
      evidence: savedEvidence,
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ error: error.message || 'Failed to upload evidence.' });
  }
});

// Delete evidence
router.delete('/evidence/:id', authenticateToken, requireRole('freelancer'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM evidence WHERE id = ? AND freelancer_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Evidence not found or unauthorized.' });
    }
    res.json({ message: 'Evidence deleted successfully.' });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    res.status(500).json({ error: 'Failed to delete evidence.' });
  }
});

export default router;
