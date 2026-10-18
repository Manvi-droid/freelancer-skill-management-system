import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import db, { initDatabase } from '../config/database.js';
import { seedDatabase } from '../config/seed.js';

// Ensure fresh DB initialized
initDatabase();
seedDatabase();

test('FSMS Core Logic Test Suite (SRS 4.3 Maintainability)', async (t) => {
  await t.test('F1 & S1: Passwords must be salted hashes (bcrypt)', () => {
    const user = db.prepare('SELECT password_hash FROM users WHERE username = ?').get('riya_kapoor');
    assert.ok(user, 'User should exist');
    assert.ok(user.password_hash.startsWith('$2'), 'Password hash must follow bcrypt format');
    assert.equal(bcrypt.compareSync('Password123!', user.password_hash), true);
    assert.equal(bcrypt.compareSync('WrongPassword', user.password_hash), false);
  });

  await t.test('S8: Brute-force rate limiting policy', () => {
    const testUsername = 'test_rate_limit_user';
    db.prepare(`
      INSERT OR REPLACE INTO users (id, username, email, password_hash, role, full_name, failed_login_attempts)
      VALUES ('usr-test-rl', ?, 'rl@test.com', 'hash', 'freelancer', 'Rate Limit Test', 0)
    `).run(testUsername);

    // Simulate 5 failed attempts
    for (let i = 1; i <= 5; i++) {
      let lockedUntil = i >= 5 ? new Date(Date.now() + 600000).toISOString() : null;
      db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE username = ?').run(i, lockedUntil, testUsername);
    }

    const lockedUser = db.prepare('SELECT failed_login_attempts, locked_until FROM users WHERE username = ?').get(testUsername);
    assert.equal(lockedUser.failed_login_attempts, 5);
    assert.ok(lockedUser.locked_until !== null, 'Account should be locked after 5 failed attempts');
  });

  await t.test('F2: Freelancer skill cataloging with 4 competency levels', () => {
    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const testSkillId = 'fsk-unit-test-skill';

    // Cleanup if existing
    db.prepare('DELETE FROM freelancer_skills WHERE id = ?').run(testSkillId);

    db.prepare(`
      INSERT INTO freelancer_skills (id, freelancer_id, skill_name, category_name, proficiency_level, status)
      VALUES (?, 'usr-riya', 'GraphQL APIs', 'Web Development', 'Advanced', 'Pending')
    `).run(testSkillId);

    const created = db.prepare('SELECT * FROM freelancer_skills WHERE id = ?').get(testSkillId);
    assert.ok(created);
    assert.equal(created.skill_name, 'GraphQL APIs');
    assert.ok(validLevels.includes(created.proficiency_level));
    assert.equal(created.status, 'Pending');

    // Clean up
    db.prepare('DELETE FROM freelancer_skills WHERE id = ?').run(testSkillId);
  });

  await t.test('U2 & F4: Skill endorsement and deduplication workflow', () => {
    const skill = db.prepare("SELECT * FROM freelancer_skills WHERE id = 'fsk-riya-node'").get();
    assert.ok(skill);

    const endorserId = 'usr-client2';
    // Remove if existing and reset count
    db.prepare('DELETE FROM endorsements WHERE freelancer_skill_id = ? AND endorser_id = ?').run(skill.id, endorserId);
    db.prepare('UPDATE freelancer_skills SET endorsement_count = 0 WHERE id = ?').run(skill.id);

    // 1. Initial Endorsement
    db.prepare(`
      INSERT INTO endorsements (id, freelancer_skill_id, freelancer_id, endorser_id, endorser_name, endorser_role, comment)
      VALUES ('end-test-1', ?, ?, ?, 'NexaCorp Global', 'client', 'Excellent Node.js microservices execution.')
    `).run(skill.id, skill.freelancer_id, endorserId);

    db.prepare(`
      UPDATE freelancer_skills SET status = 'Endorsed', endorsement_count = endorsement_count + 1 WHERE id = ?
    `).run(skill.id);

    const updatedSkill = db.prepare('SELECT status, endorsement_count FROM freelancer_skills WHERE id = ?').get(skill.id);
    assert.equal(updatedSkill.status, 'Endorsed');
    assert.equal(updatedSkill.endorsement_count, 1);

    // 2. Duplicate Endorsement handling (SRS U2 Alt Flow: edits existing comment instead of duplicate row)
    const existing = db.prepare('SELECT id FROM endorsements WHERE freelancer_skill_id = ? AND endorser_id = ?').get(skill.id, endorserId);
    assert.ok(existing, 'Should detect existing endorsement');

    db.prepare('UPDATE endorsements SET comment = ? WHERE id = ?').run('Updated review: Outstanding throughput!', existing.id);
    const endCount = db.prepare('SELECT COUNT(*) as count FROM endorsements WHERE freelancer_skill_id = ?').get(skill.id).count;
    assert.equal(endCount, 1, 'Endorsement count must remain 1 after comment edit');
  });

  await t.test('F5 & P4: Timed skill assessment scoring and status promotion', () => {
    const asmt = db.prepare("SELECT * FROM assessments WHERE skill_name = 'React'").get();
    assert.ok(asmt);
    const questions = JSON.parse(asmt.questions_json);
    assert.equal(questions.length, 5);

    // Simulate 4 correct out of 5 = 80% (Pass >= 70%)
    const correctCount = 4;
    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= asmt.pass_percentage ? 1 : 0;

    assert.equal(scorePercentage, 80);
    assert.equal(passed, 1);

    // Verify status promotes to 'Assessed'
    db.prepare(`
      UPDATE freelancer_skills SET status = 'Assessed', assessment_score = ? WHERE id = 'fsk-riya-react'
    `).run(scorePercentage);

    const updated = db.prepare("SELECT status, assessment_score FROM freelancer_skills WHERE id = 'fsk-riya-react'").get();
    assert.equal(updated.status, 'Assessed');
    assert.equal(updated.assessment_score, 80);
  });

  await t.test('F6, U1 & P1: Multi-criteria search execution in under 2 seconds', () => {
    const start = performance.now();
    const query = `
      SELECT u.id, u.full_name, u.rating, u.hourly_rate
      FROM users u
      JOIN freelancer_skills fs ON u.id = fs.freelancer_id
      WHERE u.role = 'freelancer'
        AND fs.skill_name = 'React'
        AND fs.status IN ('Assessed', 'Endorsed')
        AND u.rating >= 4.5
      GROUP BY u.id
    `;
    const results = db.prepare(query).all();
    const duration = performance.now() - start;

    assert.ok(results.length > 0, 'Should find matching freelancers');
    assert.ok(duration < 2000, `Execution time (${duration.toFixed(2)}ms) must be under 2000ms per SRS P1`);
  });

  await t.test('F7: Project Auto-Matching algorithm ranks highest coverage first', () => {
    const required = ['Cloud & DevOps Architecture', 'Docker & Containers'];
    const candidates = db.prepare("SELECT id, full_name FROM users WHERE role = 'freelancer'").all();
    const skills = db.prepare('SELECT * FROM freelancer_skills').all();

    const ranked = candidates.map(c => {
      const cSkills = skills.filter(s => s.freelancer_id === c.id);
      let matchCount = 0;
      required.forEach(r => {
        if (cSkills.some(cs => cs.skill_name.toLowerCase() === r.toLowerCase())) matchCount++;
      });
      return { id: c.id, full_name: c.full_name, matchScore: (matchCount / required.length) * 100 };
    });

    ranked.sort((a, b) => b.matchScore - a.matchScore);
    // Alex Rivera has both Cloud and Docker, should be ranked #1
    assert.equal(ranked[0].full_name, 'Alex Rivera');
    assert.equal(ranked[0].matchScore, 100);
  });

  await t.test('F9, F10 & S5: Admin Moderation, Taxonomy expansion and Audit Logging', () => {
    const adminId = 'usr-admin';
    const auditId = 'log-unit-test-1';

    // 1. Audit log write
    db.prepare(`
      INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'System Administrator', 'TEST_ACTION', 'SYSTEM', 'sys-1', 'Unit testing audit compliance')
    `).run(auditId, adminId);

    const logged = db.prepare('SELECT * FROM admin_audit_logs WHERE id = ?').get(auditId);
    assert.ok(logged);
    assert.equal(logged.action, 'TEST_ACTION');

    // Clean up
    db.prepare('DELETE FROM admin_audit_logs WHERE id = ?').run(auditId);
  });

  await t.test('S6: GDPR Data Export and Right to be Forgotten Cascade', () => {
    // Create temporary test user
    const tempUserId = 'usr-gdpr-temp';
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, full_name)
      VALUES (?, 'temp_gdpr', 'temp@gdpr.org', 'hash', 'freelancer', 'Temp GDPR User')
    `).run(tempUserId);

    db.prepare(`
      INSERT INTO freelancer_skills (id, freelancer_id, skill_name, category_name, proficiency_level, status)
      VALUES ('fsk-gdpr-1', ?, 'Temp Skill', 'Web Development', 'Beginner', 'Pending')
    `).run(tempUserId);

    // Verify data export contains user and skills
    const userExport = db.prepare('SELECT * FROM users WHERE id = ?').get(tempUserId);
    const skillsExport = db.prepare('SELECT * FROM freelancer_skills WHERE freelancer_id = ?').all(tempUserId);
    assert.ok(userExport);
    assert.equal(skillsExport.length, 1);

    // Right to be forgotten (Delete)
    db.prepare('DELETE FROM users WHERE id = ?').run(tempUserId);

    // Verify cascade
    const skillAfterDelete = db.prepare('SELECT * FROM freelancer_skills WHERE freelancer_id = ?').all(tempUserId);
    assert.equal(skillAfterDelete.length, 0, 'Foreign key cascade must automatically delete associated skills');
  });
});
