import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get list of available assessments (SRS F5)
router.get('/', (req, res) => {
  try {
    const assessments = db.prepare('SELECT id, skill_name, category_name, title, description, time_limit_seconds, pass_percentage, questions_json FROM assessments ORDER BY skill_name ASC').all();

    const formatted = assessments.map(a => {
      const questions = JSON.parse(a.questions_json);
      return {
        id: a.id,
        skill_name: a.skill_name,
        category_name: a.category_name,
        title: a.title,
        description: a.description,
        time_limit_seconds: a.time_limit_seconds,
        pass_percentage: a.pass_percentage,
        questionCount: questions.length,
      };
    });

    res.json({ assessments: formatted });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to retrieve assessments.' });
  }
});

// Get test details & questions for taking an assessment (stripping correct answers to prevent inspection)
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment test not found.' });
    }

    const rawQuestions = JSON.parse(assessment.questions_json);
    // Sanitize questions: omit correctAnswerIndex and explanation for test-taker
    const sanitizedQuestions = rawQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    res.json({
      assessment: {
        id: assessment.id,
        skill_name: assessment.skill_name,
        category_name: assessment.category_name,
        title: assessment.title,
        description: assessment.description,
        time_limit_seconds: assessment.time_limit_seconds,
        pass_percentage: assessment.pass_percentage,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error('Error fetching assessment questions:', error);
    res.status(500).json({ error: 'Failed to start assessment.' });
  }
});

// Submit test answers, score immediately, and update skill status (SRS F5, P4: auto-submit and score within 5 seconds)
router.post('/:id/submit', authenticateToken, requireRole('freelancer'), (req, res) => {
  const startTime = Date.now();
  try {
    const { answers = {}, timeTakenSeconds = 0 } = req.body;
    const freelancerId = req.user.id;

    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const questions = JSON.parse(assessment.questions_json);
    let correctCount = 0;
    const reviewDetails = [];

    questions.forEach(q => {
      const userAnswerIndex = answers[q.id];
      const isCorrect = userAnswerIndex !== undefined && Number(userAnswerIndex) === q.correctAnswerIndex;
      if (isCorrect) correctCount++;

      reviewDetails.push({
        id: q.id,
        question: q.question,
        selectedOption: userAnswerIndex !== undefined ? q.options[userAnswerIndex] : 'Not Answered',
        correctOption: q.options[q.correctAnswerIndex],
        isCorrect,
        explanation: q.explanation,
      });
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= assessment.pass_percentage ? 1 : 0;

    // Record assessment result in DB
    const resultId = `asmt-res-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO assessment_results (id, assessment_id, freelancer_id, skill_name, score_percentage, passed, answers_summary_json, time_taken_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      resultId,
      assessment.id,
      freelancerId,
      assessment.skill_name,
      scorePercentage,
      passed,
      JSON.stringify({ correctCount, totalQuestions: questions.length, reviewDetails }),
      timeTakenSeconds
    );

    // If passed, find or create the freelancer_skill and upgrade status to "Assessed"
    let skillUpdated = false;
    const existingSkill = db.prepare('SELECT id, status, assessment_score FROM freelancer_skills WHERE freelancer_id = ? AND LOWER(skill_name) = LOWER(?)').get(freelancerId, assessment.skill_name);

    if (existingSkill) {
      if (passed) {
        db.prepare(`
          UPDATE freelancer_skills 
          SET status = 'Assessed', assessment_score = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(scorePercentage, existingSkill.id);
        skillUpdated = true;
      }
    } else {
      // If freelancer hadn't added this skill yet, automatically add it with "Assessed" badge!
      if (passed) {
        const newSkillId = `fsk-${uuidv4().substring(0, 8)}`;
        db.prepare(`
          INSERT INTO freelancer_skills (id, freelancer_id, skill_name, category_name, proficiency_level, status, assessment_score)
          VALUES (?, ?, ?, ?, 'Advanced', 'Assessed', ?)
        `).run(newSkillId, freelancerId, assessment.skill_name, assessment.category_name, scorePercentage);
        skillUpdated = true;
      }
    }

    // Trigger in-app notification (SRS F8)
    const notifTitle = passed ? `Skill Assessment Passed! 🎉` : `Skill Assessment Completed`;
    const notifMsg = passed
      ? `Congratulations! You scored ${scorePercentage}% on the ${assessment.skill_name} assessment. Your verified badge is live!`
      : `You scored ${scorePercentage}% on ${assessment.skill_name}. (Passing score: ${assessment.pass_percentage}%). You may re-take anytime.`;

    const notifId = `notif-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, 'assessment')
    `).run(notifId, freelancerId, notifTitle, notifMsg);

    const executionTimeMs = Date.now() - startTime;

    res.json({
      message: passed ? 'Assessment Passed! Verified badge awarded.' : 'Assessment Completed.',
      result: {
        scorePercentage,
        passed: Boolean(passed),
        correctCount,
        totalQuestions: questions.length,
        timeTakenSeconds,
        passPercentage: assessment.pass_percentage,
        executionTimeMs, // Verifies performance requirement P4 (<5000ms)
        reviewDetails,
      },
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Failed to evaluate assessment submission.' });
  }
});

// Get freelancer's assessment history
router.get('/history/my', authenticateToken, requireRole('freelancer'), (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM assessment_results WHERE freelancer_id = ? ORDER BY taken_at DESC
    `).all(req.user.id);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment history.' });
  }
});

export default router;
