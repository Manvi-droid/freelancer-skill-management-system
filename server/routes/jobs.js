import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: Calculate match score between a job's required skills and a freelancer's cataloged skills
function calculateMatchScore(requiredSkills, freelancerSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  let matchedPoints = 0;
  const levelWeights = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

  for (const req of requiredSkills) {
    const found = freelancerSkills.find(
      s => s.skill_name.toLowerCase() === req.skill_name.toLowerCase()
    );
    if (found) {
      const reqWeight = levelWeights[req.proficiency_level] || 2;
      const foundWeight = levelWeights[found.proficiency_level] || 2;
      let skillScore = Math.min(1.0, foundWeight / reqWeight);

      // Boost for verified statuses
      if (found.status === 'Assessed') skillScore = Math.min(1.2, skillScore * 1.15);
      if (found.status === 'Endorsed') skillScore = Math.min(1.2, skillScore * 1.1);

      matchedPoints += skillScore;
    }
  }

  const rawPercentage = (matchedPoints / requiredSkills.length) * 100;
  return Math.min(100, Math.round(rawPercentage));
}

// 1. GET /api/jobs - List all open jobs with client info and dynamic match score for freelancer
router.get('/', (req, res) => {
  try {
    const { category, q, budgetType } = req.query;
    let query = `
      SELECT j.*, u.full_name as client_name, u.avatar_url as client_avatar, u.location as client_location
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      WHERE j.status = 'open'
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND j.category_name = ?`;
      params.push(category);
    }

    if (budgetType && budgetType !== 'All') {
      query += ` AND j.budget_type = ?`;
      params.push(budgetType);
    }

    if (q && q.trim()) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.required_skills_json LIKE ?)`;
      params.push(`%${q.trim()}%`, `%${q.trim()}%`, `%${q.trim()}%`);
    }

    query += ` ORDER BY j.created_at DESC`;
    const jobs = db.prepare(query).all(...params);

    // If an auth token was provided, fetch freelancer's skills and applications
    let freelancerSkills = [];
    let appliedJobMap = {};
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fsms_secure_secret_key_2026_vit_bce');
        if (decoded && decoded.id) {
          freelancerSkills = db.prepare(`SELECT * FROM freelancer_skills WHERE freelancer_id = ?`).all(decoded.id);
          const apps = db.prepare(`SELECT job_id, status FROM job_applications WHERE freelancer_id = ?`).all(decoded.id);
          for (const a of apps) {
            appliedJobMap[a.job_id] = a.status;
          }
        }
      } catch {
        // Token invalid or absent, continue with anonymous results
      }
    }

    const enhancedJobs = jobs.map(job => {
      let reqSkills = [];
      try {
        reqSkills = JSON.parse(job.required_skills_json);
      } catch {}

      const matchScore = freelancerSkills.length > 0 
        ? calculateMatchScore(reqSkills, freelancerSkills) 
        : null;

      const applicantCount = db.prepare(`SELECT COUNT(*) as count FROM job_applications WHERE job_id = ?`).get(job.id)?.count || 0;

      return {
        ...job,
        required_skills: reqSkills,
        matchScore,
        applicantCount,
        hasApplied: Boolean(appliedJobMap[job.id]),
        myApplicationStatus: appliedJobMap[job.id] || null,
      };
    });

    res.json({ jobs: enhancedJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// 2. GET /api/jobs/my-posted - Client/Provider gets their posted jobs with received applications
router.get('/my-posted', authenticateToken, (req, res) => {
  try {
    const jobs = db.prepare(`
      SELECT * FROM jobs WHERE client_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    const fullJobs = jobs.map(job => {
      let reqSkills = [];
      try {
        reqSkills = JSON.parse(job.required_skills_json);
      } catch {}

      // Get applications for this job
      const applications = db.prepare(`
        SELECT a.*, 
               u.full_name as freelancer_name, 
               u.title as freelancer_title, 
               u.avatar_url as freelancer_avatar,
               u.rating as freelancer_rating,
               u.hourly_rate as freelancer_rate
        FROM job_applications a
        JOIN users u ON a.freelancer_id = u.id
        WHERE a.job_id = ?
        ORDER BY a.match_score DESC, a.created_at DESC
      `).all(job.id);

      // Enhance applicants with verified skills
      const enhancedApps = applications.map(app => {
        const skills = db.prepare(`
          SELECT skill_name, proficiency_level, status, assessment_score, endorsement_count
          FROM freelancer_skills
          WHERE freelancer_id = ?
        `).all(app.freelancer_id);
        return {
          ...app,
          freelancer_skills: skills,
        };
      });

      return {
        ...job,
        required_skills: reqSkills,
        applications: enhancedApps,
        applicantCount: applications.length,
      };
    });

    res.json({ jobs: fullJobs });
  } catch (error) {
    console.error('Error fetching client posted jobs:', error);
    res.status(500).json({ error: 'Failed to fetch posted jobs' });
  }
});

// 3. POST /api/jobs - Client/Provider creates a new job
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, category_name, budget_type = 'hourly', budget_amount, required_skills } = req.body;

    if (!title || !description || !category_name || !budget_amount) {
      return res.status(400).json({ error: 'Title, description, category, and budget are required.' });
    }

    const id = `job-${uuidv4().substring(0, 8)}`;
    const skillsJson = JSON.stringify(required_skills || []);

    db.prepare(`
      INSERT INTO jobs (id, client_id, title, description, category_name, budget_type, budget_amount, required_skills_json, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `).run(id, req.user.id, title.trim(), description.trim(), category_name, budget_type, Number(budget_amount), skillsJson);

    res.status(201).json({
      message: 'Job posting published successfully!',
      jobId: id,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to publish job' });
  }
});

// 4. GET /api/jobs/my-applications - Freelancer checks all jobs they applied to
router.get('/my-applications', authenticateToken, (req, res) => {
  try {
    const applications = db.prepare(`
      SELECT a.*, 
             j.title as job_title, 
             j.category_name, 
             j.budget_type, 
             j.budget_amount,
             j.required_skills_json,
             u.full_name as client_name,
             u.avatar_url as client_avatar,
             u.location as client_location
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.client_id = u.id
      WHERE a.freelancer_id = ?
      ORDER BY a.created_at DESC
    `).all(req.user.id);

    const enhanced = applications.map(app => {
      let reqSkills = [];
      try {
        reqSkills = JSON.parse(app.required_skills_json);
      } catch {}
      return {
        ...app,
        required_skills: reqSkills,
      };
    });

    res.json({ applications: enhanced });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// 5. POST /api/jobs/:id/apply - Freelancer applies to a job
router.post('/:id/apply', authenticateToken, (req, res) => {
  try {
    const jobId = req.params.id;
    const { cover_note, proposed_rate } = req.body;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const existing = db.prepare('SELECT id FROM job_applications WHERE job_id = ? AND freelancer_id = ?').get(jobId, req.user.id);
    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    // Compute match score
    let reqSkills = [];
    try {
      reqSkills = JSON.parse(job.required_skills_json);
    } catch {}

    const freelancerSkills = db.prepare('SELECT * FROM freelancer_skills WHERE freelancer_id = ?').all(req.user.id);
    const matchScore = calculateMatchScore(reqSkills, freelancerSkills);

    const appId = `app-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO job_applications (id, job_id, freelancer_id, cover_note, proposed_rate, status, match_score)
      VALUES (?, ?, ?, ?, ?, 'applied', ?)
    `).run(appId, jobId, req.user.id, cover_note || '', proposed_rate ? Number(proposed_rate) : job.budget_amount, matchScore);

    // Notify client about new applicant
    const freelancer = db.prepare('SELECT full_name FROM users WHERE id = ?').get(req.user.id);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, 'match')
    `).run(
      `notif-${uuidv4().substring(0, 8)}`,
      job.client_id,
      `New Applicant for "${job.title}"`,
      `${freelancer?.full_name || 'A freelancer'} applied with a match score of ${matchScore}%.`,
      'match'
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      matchScore,
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// 6. PUT /api/jobs/applications/:id/status - Client accepts or rejects application
router.put('/applications/:id/status', authenticateToken, (req, res) => {
  try {
    const appId = req.params.id;
    const { status } = req.body; // 'accepted', 'rejected', 'reviewing'

    if (!['accepted', 'rejected', 'reviewing'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const app = db.prepare(`
      SELECT a.*, j.title as job_title, j.client_id, u.full_name as client_name
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.client_id = u.id
      WHERE a.id = ?
    `).get(appId);

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (app.client_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to review this application' });
    }

    db.prepare(`UPDATE job_applications SET status = ? WHERE id = ?`).run(status, appId);

    // Send notification to freelancer
    const notifTitle = status === 'accepted' ? 'Application Accepted! 🎉' : `Application Status Update`;
    const notifMsg = status === 'accepted' 
      ? `Congratulations! ${app.client_name} accepted your proposal for "${app.job_title}".`
      : `Your application status for "${app.job_title}" was updated to: ${status}.`;

    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, 'match')
    `).run(`notif-${uuidv4().substring(0, 8)}`, app.freelancer_id, notifTitle, notifMsg, 'match');

    res.json({ message: `Application status updated to ${status}` });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

export default router;
