# Freelancer Skill Management System (FSMS)
**Software Requirements Specification (SRS v1.1) Implementation**  
*Author: Manvi Sharma (24BCE1566)*  
*Engineered for 100% AWS Free Tier Zero-Cost Deployment*

---

## 🎯 Project Overview

The **Freelancer Skill Management System (FSMS)** is a web-based software platform that enables freelancers to catalogue, verify, and showcase their professional skills, and enables hiring clients to search and auto-match talent based on verified competencies.

This system is built with a lightweight component-based COMET architecture (Profile & Skills, Verification, Search & Matching), fitting within the strict **1GB RAM boundary of an AWS EC2 `t2.micro` Free Tier instance** while offering sub-second search latency and automated skill assessment scoring.

---

## 🚀 6 Core SRS Use Cases Solved

### 1. Freelancer Profile & Skill Cataloging with Evidence (SRS F1, F2, F3)
- Implements the wireframe prototype from **Page 8 of the SRS**: Freelancer card (Riya Kapoor / Full Stack Dev), overall score box (`score: 7.4`), location, hourly rate, and bio.
- Allows cataloging skills with 4 standard competency levels: `Beginner`, `Intermediate`, `Advanced`, and `Expert` (achievable in $\le$ 3 clicks per SRS 4.3).
- Supporting evidence & portfolio dropzone supporting certificates, case studies, and work samples (sanitized MIME validation per SRS S7) stored in **AWS S3 Free Tier** or local storage.

### 2. Timed Skill Assessment & Automated Scoring Engine (SRS F5, P4)
- Interactive technical evaluation tests across multiple domains (React.js, AWS Cloud Practitioner, Python, Node.js, UI/UX Design).
- Real-time countdown timer with visual alert.
- **SRS P4 Compliance**: Assessment tests auto-submit and score within 5 seconds of timer expiry.
- Instant scoring ($\ge$ 70% passing threshold), question-by-question review with rationales, and automatic promotion of the skill status to **`Assessed`** with an official badge.

### 3. Peer & Client Skill Endorsement Workflow (SRS F4, Use Case U2, P2)
- Clients and peer freelancers can review profiles and submit endorsements with proficiency comments.
- **Deduplication Logic (SRS U2 Alternative Flow)**: If the endorser has already endorsed that skill, edits their existing recommendation instead of creating duplicate records.
- Automatically increments endorsement counter, updates skill status to **`Endorsed`**, and dispatches in-app notifications (SRS P2).

### 4. Client Multi-Criteria Search & Filtering (SRS F6, Use Case U1, P1)
- Rich filtering panel: keyword search, skill category, competency level, verification status (`All`, `Assessed`, `Endorsed`), minimum rating, and maximum hourly rate slider.
- **SRS P1 Compliance**: Search response time executed in under 20 milliseconds (well below the 2-second SRS P1 threshold).
- Displays cards with rating stars, verified badges, and quick link to view and endorse.

### 5. Algorithmic Project Auto-Matching & Ranked Outcomes (SRS F7)
- Clients input project requirements: required skills, target competency level, budget ceiling, and verification requirements.
- Algorithmic recommendation engine computes a weighted match score based on:
  - Skill coverage & competency level match (50%)
  - Verification badge bonus (`Assessed` +20%, `Endorsed` +12%)
  - Freelancer rating & review count (15%)
  - Hourly rate budget compatibility (15%)
- Returns a ranked list with relevance percentages and skill coverage tags.

### 6. Admin Moderation, Taxonomy & Audit Analytics (SRS F9, F10, S5)
- **KPI Metrics**: Real-time stats on registered talent, cataloged skills, verification rate, and assessment pass rate.
- **Moderation Queue**: Review uploaded evidence files, inspect previews, and Mark as Verified, Flagged, or Rejected.
- **Extensible Taxonomy (SRS 4.3 Adaptability)**: Admins can dynamically register new skill categories and skills without code modifications.
- **Audit Logging (SRS S5)**: Timestamped log recording every admin action, identity, and target.

### 🛡️ Bonus: GDPR Compliance (SRS S6, Section 5.3)
- **Data Portability (Article 20)**: 1-click JSON export of all personal data, cataloged skills, evidence, endorsements, and logs.
- **Right to be Forgotten (Article 17)**: Instant permanent account purge with database cascading deletes.

---

## ⚡ Quickstart (Local Run)

### 1. Install Dependencies
```bash
# Install root backend dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 2. Build Frontend & Run Server
```bash
# Build the React production client
npm run build

# Start the unified FSMS server (serves API & Frontend on port 5000)
npm start
```
Open **`http://localhost:5000`** in your browser!

### 3. Run Automated Unit Test Suite (SRS 4.3 Maintainability)
```bash
npm test
```
*Executes all 10 unit test suites covering salted password hashing, rate limiting, skill management, endorsements, timed assessments, search latency, auto-matching, and GDPR cascades.*

---

## ☁️ AWS Free Tier Deployment

See [`AWS_FREE_TIER_DEPLOYMENT_GUIDE.md`](file:///C:/Users/Manvi/.gemini/antigravity/scratch/freelancer-skill-management-system/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md) for complete instructions.

**Quick Deploy on EC2 `t2.micro`:**
1. Launch an Amazon Linux 2023 `t2.micro` instance in the AWS Console.
2. In **Advanced Details** -> **User Data**, paste [`deploy/aws-ec2-userdata.sh`](file:///C:/Users/Manvi/.gemini/antigravity/scratch/freelancer-skill-management-system/deploy/aws-ec2-userdata.sh).
3. Open `http://<EC2-PUBLIC-IP>` in your browser!

---

## 👥 Demo Personas (Fast 1-Click Role Switcher)

| Persona | Role | Features to Explore |
| :--- | :--- | :--- |
| **Riya Kapoor** | Freelancer | Dashboard (Page 8 Wireframe), Add skills, upload evidence, take skill assessments |
| **Apex Tech Ventures** | Client | Search & filter talent (U1), Auto-match project criteria (F7), Endorse skills (U2) |
| **System Administrator** | Admin | Moderation queue, add taxonomy categories, view audit logs (S5) & platform KPIs |
