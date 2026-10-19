import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import CredlyBadgeModal from '../components/CredlyBadgeModal';
import { 
  ArrowRight, 
  Clock, 
  Award, 
  ShieldCheck, 
  Star,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  ExternalLink,
  Plus,
  Play,
  UploadCloud,
  Users
} from 'lucide-react';

export default function FreelancerDashboard({ onNavigateTab, onViewPublicProfile }) {
  const { user, token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'assessments' | 'evidence'
  const [selectedCredlySkill, setSelectedCredlySkill] = useState(null);

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch('/api/skills/my-skills', { headers }).then(r => r.json()),
      fetch('/api/assessments').then(r => r.json()),
    ])
      .then(([skillData, asmtData]) => {
        setSkills(skillData.skills || []);
        setAssessments(asmtData.assessments || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, [token]);

  // Calculations
  const assessedSkills = skills.filter(s => s.status === 'Assessed');
  const endorsedSkills = skills.filter(s => s.status === 'Endorsed');
  const allEvidence = skills.flatMap(s => (s.evidence || []).map(e => ({ ...e, skill_name: s.skill_name })));
  const credibilityScore = user ? ((user.rating || 4.5) * 1.5).toFixed(1) : '7.4';
  const featuredSkill = skills.find(s => s.status === 'Assessed') || skills[0];

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-8 animate-in fade-in duration-200">
      
      {/* ─── 3-Column Layout: Main Workspace + Right Credibility Rail ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ══════════════ LEFT/CENTER WORKSPACE (8 cols) ══════════════ */}
        <div className="lg:col-span-8 space-y-6">

          {/* Hero Featured Skill Card */}
          {featuredSkill && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 group hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/60 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-2xs">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Primary Competency Focus
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 font-medium">{featuredSkill.category_name}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    {featuredSkill.skill_name}
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {featuredSkill.proficiency_level}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">
                    Verified through standard technical evaluations and documented client endorsements.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button
                  onClick={() => onNavigateTab('assessments')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Evaluate Skills
                </button>
                <button
                  onClick={() => onNavigateTab('skills')}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white text-gray-700 text-xs font-semibold transition-all hover:border-gray-300"
                >
                  Manage Vault
                </button>
              </div>
            </div>
          )}

          {/* Tabbed Switcher: Competencies | Assessments | Evidence Vault */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <div className="flex items-center gap-6 text-sm font-medium">
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`pb-2 transition-all relative ${
                    activeTab === 'skills'
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>My Competencies ({skills.length})</span>
                  {activeTab === 'skills' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('assessments')}
                  className={`pb-2 transition-all relative ${
                    activeTab === 'assessments'
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Assessment Arena ({assessments.length})</span>
                  {activeTab === 'assessments' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`pb-2 transition-all relative ${
                    activeTab === 'evidence'
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>Verified Evidence ({allEvidence.length})</span>
                  {activeTab === 'evidence' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </div>

              <button
                onClick={() => onNavigateTab('skills')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            {/* TAB 1: SKILLS LIST */}
            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-2 py-12 text-center text-xs text-gray-400">Loading competencies...</div>
                ) : skills.length === 0 ? (
                  <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500">No skills added yet.</p>
                  </div>
                ) : (
                  skills.map(skill => (
                    <div
                      key={skill.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {skill.category_name}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                            {skill.proficiency_level}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                          {skill.skill_name}
                        </h3>

                        <div className="mt-3">
                          <SkillBadge
                            status={skill.status}
                            score={skill.assessment_score}
                            endorsementCount={skill.endorsement_count}
                            level={skill.proficiency_level}
                            onClick={() => setSelectedCredlySkill(skill)}
                          />
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {skill.evidence?.length || 0} document(s) verified
                        </span>
                        <button
                          onClick={() => onNavigateTab('assessments')}
                          className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                          title="Evaluate this skill"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: ASSESSMENTS LIST */}
            {activeTab === 'assessments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessments.map(asmt => (
                  <div
                    key={asmt.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {asmt.category_name}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {asmt.questionCount} Questions
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                        {asmt.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {asmt.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {Math.round(asmt.time_limit_seconds / 60)} Mins
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">Pass: {asmt.pass_percentage}%</span>
                      </div>

                      <button
                        onClick={() => onNavigateTab('assessments')}
                        className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 font-semibold transition-all flex items-center gap-1"
                      >
                        Start <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: EVIDENCE VAULT */}
            {activeTab === 'evidence' && (
              <div className="space-y-3">
                {allEvidence.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <UploadCloud className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No verification evidence uploaded yet.</p>
                  </div>
                ) : (
                  allEvidence.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="text-blue-600 font-medium">{item.skill_name}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════ RIGHT CREDIBILITY & STATS RAIL (4 cols) ══════════════ */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Skill Credibility Score Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Credibility Index
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tier 3 Specialist
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-gray-900 tracking-tight">{credibilityScore}</span>
              <span className="text-sm font-semibold text-gray-400">/ 10</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Assessment Accuracy</span>
                <span className="font-bold text-gray-800">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500">Verified Credentials</span>
                <span className="font-bold text-gray-800">{assessedSkills.length} Assessed</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (assessedSkills.length / (skills.length || 1)) * 100)}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500">Client Endorsements</span>
                <span className="font-bold text-gray-800">{endorsedSkills.length} Verified</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (endorsedSkills.length / (skills.length || 1)) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              onClick={() => onNavigateTab('skills')}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-semibold text-gray-500">Certifications</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-3xl font-black text-gray-900">{assessedSkills.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">✓ Credly Verified</div>
            </div>

            <div 
              onClick={() => onNavigateTab('skills')}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-xs font-semibold text-gray-500">Endorsements</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-3xl font-black text-gray-900">{endorsedSkills.length}</div>
              <div className="text-[10px] text-purple-600 font-medium mt-1">Peer Validated</div>
            </div>
          </div>

          {/* Action Quick Links */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Quick Workspace Actions
            </span>

            <button
              onClick={() => onNavigateTab('assessments')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-xs font-semibold flex items-center justify-between transition-colors border border-gray-100"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Take Timed Assessment (F5)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('skills')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-xs font-semibold flex items-center justify-between transition-colors border border-gray-100"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Upload Evidence & Badges (F3)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('automatch')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-xs font-semibold flex items-center justify-between transition-colors border border-gray-100"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Run Smart Match Algorithm (F7)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>

            <button
              onClick={() => onViewPublicProfile(user?.id)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-xs font-semibold flex items-center justify-between transition-colors border border-gray-100"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Preview Public Profile (U1)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

        </div>

      </div>

      {/* Credly Badge Modal */}
      <CredlyBadgeModal
        isOpen={Boolean(selectedCredlySkill)}
        onClose={() => setSelectedCredlySkill(null)}
        skill={selectedCredlySkill}
        freelancer={user}
      />
    </div>
  );
}
