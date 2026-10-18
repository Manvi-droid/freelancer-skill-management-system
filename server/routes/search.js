import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Search & Filter Freelancers (SRS Use Case U1, F6, P1)
router.get('/freelancers', (req, res) => {
  const startTime = Date.now();
  try {
    const {
      q = '',
      category = '',
      level = '',
      status = '',
      minRating = 0,
      maxRate = 9999,
      sortBy = 'rating', // 'rating', 'rate_asc', 'rate_desc', 'skills_count'
    } = req.query;

    let query = `
      SELECT u.id, u.username, u.full_name, u.title, u.bio, u.location, u.hourly_rate, u.avatar_url, u.rating, u.reviews_count,
        COUNT(DISTINCT fs.id) as total_skills,
        SUM(CASE WHEN fs.status = 'Assessed' THEN 1 ELSE 0 END) as assessed_skills_count,
        SUM(CASE WHEN fs.status = 'Endorsed' THEN 1 ELSE 0 END) as endorsed_skills_count
      FROM users u
      LEFT JOIN freelancer_skills fs ON u.id = fs.freelancer_id
      WHERE u.role = 'freelancer'
    `;

    const params = [];

    // Filter by text search query (name, title, bio, or skill)
    if (q && q.trim()) {
      query += ` AND (
        u.full_name LIKE ? OR 
        u.title LIKE ? OR 
        u.bio LIKE ? OR 
        EXISTS (SELECT 1 FROM freelancer_skills fs2 WHERE fs2.freelancer_id = u.id AND fs2.skill_name LIKE ?)
      )`;
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filter by category
    if (category && category !== 'All') {
      query += ` AND EXISTS (SELECT 1 FROM freelancer_skills fs3 WHERE fs3.freelancer_id = u.id AND fs3.category_name = ?)`;
      params.push(category);
    }

    // Filter by proficiency level
    if (level && level !== 'All') {
      query += ` AND EXISTS (SELECT 1 FROM freelancer_skills fs4 WHERE fs4.freelancer_id = u.id AND fs4.proficiency_level = ?)`;
      params.push(level);
    }

    // Filter by verification status ('Endorsed', 'Assessed')
    if (status && status !== 'All') {
      query += ` AND EXISTS (SELECT 1 FROM freelancer_skills fs5 WHERE fs5.freelancer_id = u.id AND fs5.status = ?)`;
      params.push(status);
    }

    // Filter by minimum rating
    if (Number(minRating) > 0) {
      query += ` AND u.rating >= ?`;
      params.push(Number(minRating));
    }

    // Filter by hourly rate
    if (Number(maxRate) > 0) {
      query += ` AND u.hourly_rate <= ?`;
      params.push(Number(maxRate));
    }

    query += ` GROUP BY u.id`;

    // Sorting (SRS U1 Alternative Flow: if no filters, sorted by rating)
    if (sortBy === 'rate_asc') {
      query += ` ORDER BY u.hourly_rate ASC`;
    } else if (sortBy === 'rate_desc') {
      query += ` ORDER BY u.hourly_rate DESC`;
    } else if (sortBy === 'skills_count') {
      query += ` ORDER BY assessed_skills_count DESC, total_skills DESC`;
    } else {
      query += ` ORDER BY u.rating DESC, assessed_skills_count DESC`;
    }

    const freelancers = db.prepare(query).all(...params);

    // Fetch skills for each freelancer
    const allSkills = db.prepare(`
      SELECT fs.*,
        (SELECT COUNT(*) FROM endorsements WHERE freelancer_skill_id = fs.id) as endorsement_count
      FROM freelancer_skills fs
    `).all();

    const results = freelancers.map(f => ({
      ...f,
      skills: allSkills.filter(s => s.freelancer_id === f.id),
    }));

    const responseTimeMs = Date.now() - startTime;

    res.json({
      totalCount: results.length,
      responseTimeMs, // Verifies performance requirement P1 (<2000ms)
      freelancers: results,
      emptyMessage: results.length === 0 ? 'No freelancers match all selected filters. Try broadening your search or adjusting the minimum rating.' : null,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to execute freelancer search.' });
  }
});

// Automated Project Requirement Matching & Ranking (SRS F7)
router.post('/auto-match', (req, res) => {
  const startTime = Date.now();
  try {
    const {
      projectTitle = 'Software Modernization Project',
      requiredSkills = [], // Array of skill names or { skill_name, minLevel }
      maxBudgetPerHour = 100,
      mustBeVerified = false,
    } = req.body;

    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ error: 'Please specify at least one required skill for auto-matching.' });
    }

    const freelancers = db.prepare(`
      SELECT id, username, full_name, title, bio, location, hourly_rate, avatar_url, rating, reviews_count
      FROM users
      WHERE role = 'freelancer'
    `).all();

    const allSkills = db.prepare('SELECT * FROM freelancer_skills').all();

    const levelWeights = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    };

    // Calculate match score for each candidate freelancer
    const scoredCandidates = freelancers.map(candidate => {
      const candidateSkills = allSkills.filter(s => s.freelancer_id === candidate.id);
      let matchedSkillsCount = 0;
      let skillMatchScore = 0;
      const matchedSkillDetails = [];

      requiredSkills.forEach(reqSkill => {
        const reqName = typeof reqSkill === 'string' ? reqSkill : reqSkill.name;
        const reqMinLevel = typeof reqSkill === 'object' && reqSkill.level ? reqSkill.level : 'Intermediate';

        const found = candidateSkills.find(cs => cs.skill_name.toLowerCase() === reqName.toLowerCase());

        if (found) {
          matchedSkillsCount++;
          let points = 20;

          // Proficiency level check
          const candidateLevelVal = levelWeights[found.proficiency_level] || 1;
          const requiredLevelVal = levelWeights[reqMinLevel] || 2;
          if (candidateLevelVal >= requiredLevelVal) {
            points += 15;
          }

          // Verification bonus
          if (found.status === 'Assessed') {
            points += 20;
            if (found.assessment_score) {
              points += Math.round((found.assessment_score / 100) * 10);
            }
          } else if (found.status === 'Endorsed') {
            points += 12;
          }

          skillMatchScore += points;
          matchedSkillDetails.push({
            skill_name: found.skill_name,
            proficiency_level: found.proficiency_level,
            status: found.status,
            assessment_score: found.assessment_score,
            endorsement_count: found.endorsement_count,
          });
        }
      });

      // Max possible skill score normalized to 70%
      const rawSkillCoverage = matchedSkillsCount / requiredSkills.length;
      const normalizedSkillScore = rawSkillCoverage * 70;

      // Rating score normalized to 15%
      const ratingScore = (candidate.rating / 5.0) * 15;

      // Budget score normalized to 15%
      let budgetScore = 15;
      if (candidate.hourly_rate > maxBudgetPerHour) {
        const excessRatio = (candidate.hourly_rate - maxBudgetPerHour) / maxBudgetPerHour;
        budgetScore = Math.max(0, 15 - excessRatio * 20);
      }

      const totalMatchPercentage = Math.min(100, Math.round(normalizedSkillScore + ratingScore + budgetScore));

      return {
        ...candidate,
        matchScore: totalMatchPercentage,
        matchedSkillsCount,
        totalRequiredSkills: requiredSkills.length,
        matchedSkillDetails,
        allSkills: candidateSkills,
        budgetFit: candidate.hourly_rate <= maxBudgetPerHour,
      };
    });

    // Filter by verification if requested
    let filtered = scoredCandidates;
    if (mustBeVerified) {
      filtered = filtered.filter(c => c.matchedSkillDetails.some(s => s.status === 'Assessed' || s.status === 'Endorsed'));
    }

    // Sort by Match Score descending (SRS F7 ranked list)
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    const responseTimeMs = Date.now() - startTime;

    res.json({
      projectTitle,
      requiredSkills,
      maxBudgetPerHour,
      matchCount: filtered.length,
      responseTimeMs,
      rankedFreelancers: filtered,
    });
  } catch (error) {
    console.error('Auto match error:', error);
    res.status(500).json({ error: 'Failed to compute project auto-match recommendations.' });
  }
});

export default router;
