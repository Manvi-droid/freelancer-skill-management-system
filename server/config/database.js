import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for SQLite database
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fsms.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance (meets SRS P6 throughput)
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    -- Users Table (Freelancers, Clients, Admins)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('freelancer', 'client', 'admin')),
      full_name TEXT NOT NULL,
      title TEXT,
      bio TEXT,
      location TEXT DEFAULT 'Remote',
      hourly_rate REAL DEFAULT 45.0,
      avatar_url TEXT,
      phone TEXT,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 0,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Skill Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Standard Skill Taxonomy
    CREATE TABLE IF NOT EXISTS skills_taxonomy (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      UNIQUE(category_id, name)
    );

    -- Freelancer Skills
    CREATE TABLE IF NOT EXISTS freelancer_skills (
      id TEXT PRIMARY KEY,
      freelancer_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      category_name TEXT NOT NULL,
      proficiency_level TEXT NOT NULL CHECK(proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Endorsed', 'Assessed', 'Flagged')),
      assessment_score REAL,
      endorsement_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(freelancer_id, skill_name)
    );

    -- Supporting Evidence & Portfolio Items (SRS F3, S7)
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      freelancer_skill_id TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      storage_type TEXT DEFAULT 'local' CHECK(storage_type IN ('local', 's3')),
      status TEXT NOT NULL DEFAULT 'Uploaded' CHECK(status IN ('Uploaded', 'Verified', 'Flagged')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (freelancer_skill_id) REFERENCES freelancer_skills (id) ON DELETE CASCADE,
      FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Endorsements (SRS F4, U2)
    CREATE TABLE IF NOT EXISTS endorsements (
      id TEXT PRIMARY KEY,
      freelancer_skill_id TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      endorser_id TEXT NOT NULL,
      endorser_name TEXT NOT NULL,
      endorser_role TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (freelancer_skill_id) REFERENCES freelancer_skills (id) ON DELETE CASCADE,
      FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (endorser_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(freelancer_skill_id, endorser_id)
    );

    -- Assessments / Tests Bank (SRS F5, P4)
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      skill_name TEXT UNIQUE NOT NULL,
      category_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      time_limit_seconds INTEGER DEFAULT 300,
      pass_percentage REAL DEFAULT 70.0,
      questions_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Assessment Results (SRS F5, P4)
    CREATE TABLE IF NOT EXISTS assessment_results (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      score_percentage REAL NOT NULL,
      passed INTEGER NOT NULL CHECK(passed IN (0, 1)),
      answers_summary_json TEXT,
      time_taken_seconds INTEGER,
      taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
      FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Notifications (SRS F8, P2)
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('endorsement', 'assessment', 'match', 'admin', 'system')),
      is_read INTEGER DEFAULT 0 CHECK(is_read IN (0, 1)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Admin Audit Logs (SRS S5)
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Jobs / Tasks posted by Job Providers (Clients)
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_name TEXT NOT NULL,
      budget_type TEXT DEFAULT 'hourly' CHECK(budget_type IN ('hourly', 'fixed')),
      budget_amount REAL NOT NULL,
      required_skills_json TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'completed', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Applications submitted by Freelancers for Jobs/Tasks
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      freelancer_id TEXT NOT NULL,
      cover_note TEXT,
      proposed_rate REAL,
      status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'reviewing', 'accepted', 'rejected')),
      match_score REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
      FOREIGN KEY (freelancer_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(job_id, freelancer_id)
    );
  `);
  console.log('✅ SQLite Database initialized with strict referential integrity.');
}

export default db;
