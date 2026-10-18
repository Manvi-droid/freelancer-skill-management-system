import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import CredlyBadgeModal from '../components/CredlyBadgeModal';
import { 
  Star, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  Edit3,
  ShieldCheck, 
  ArrowRight,
  Layers,
  Award,
  Search,
  Sparkles,
  FileText,
  X,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function FreelancerDashboard({ 
  onNavigateTab, 
  onViewPublicProfile 
}) {
  const { user, token, refreshUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedCredlySkill, setSelectedCredlySkill] = useState(null);

  // Profile edit states
  const [editFullName, setEditFullName] = useState(user?.full_name || '');
  const [editTitle, setEditTitle] = useState(user?.title || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editHourlyRate, setEditHourlyRate] = useState(user?.hourly_rate || 55);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/skills/my-skills', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setSkills(data.skills || []);
        const totalEv = (data.skills || []).reduce((acc, s) => acc + (s.evidence?.length || 0), 0);
        setEvidenceCount(totalEv);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (user) {
      setEditFullName(user.full_name || '');
      setEditTitle(user.title || '');
      setEditBio(user.bio || '');
      setEditLocation(user.location || '');
      setEditHourlyRate(user.hourly_rate || 55);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: editFullName,
          title: editTitle,
          bio: editBio,
          location: editLocation,
          hourly_rate: Number(editHourlyRate),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setShowEditProfileModal(false);
      refreshUser();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const verifiedSkillsCount = skills.filter(s => s.status === 'Assessed' || s.status === 'Endorsed').length;
  const totalEndorsements = skills.reduce((acc, s) => acc + (s.endorsement_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Alert Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-mono ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Welcome & Minimalist Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400 font-bold block mb-1">
            Freelancer Mission Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quick status metrics and instant navigation to dedicated task areas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewPublicProfile(user?.id || 'usr-riya')}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            View Public Profile (U2)
          </button>
        </div>
      </div>

      {/* Profile Overview Card (Page 8 Wireframe Prototype) + Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Profile Card (SRS Wireframe Page 8 layout) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-md flex-shrink-0">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-black text-xl text-white font-mono">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'RK'}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{user?.full_name || 'Riya kapoor'}</h2>
                <p className="text-xs font-mono font-semibold text-cyan-400">{user?.title || 'Full stacu Dev'}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {user?.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <DollarSign className="w-3 h-3" /> ${user?.hourly_rate || 55}/hr
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEditProfileModal(true)}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4 text-violet-400" />
            </button>
          </div>

          {/* Wireframe Score Box (Matches wireframe bottom-left: "score. 7.4") */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-2 text-center shadow-inner font-mono">
              <span className="text-[10px] tracking-widest text-slate-500 uppercase block">score.</span>
              <span className="text-xl font-black text-white">{user?.rating ? (user.rating * 1.5).toFixed(1) : '7.4'}</span>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="flex items-center gap-1 text-amber-400 justify-end">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-black text-white">{user?.rating || 4.9}</span>
                <span className="text-slate-500 text-[10px]">/5.0</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{user?.reviews_count || 14} verified reviews</div>
            </div>
          </div>
        </div>

        {/* 4 Minimalist Metric Counters */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cataloged Skills</span>
            <span className="text-3xl font-black text-white my-1">{skills.length}</span>
            <span className="text-[10px] text-violet-400 font-semibold">Active in matrix</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Credly Badges</span>
            <span className="text-3xl font-black text-emerald-400 my-1">{verifiedSkillsCount}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">Verified Proof</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vault Evidence</span>
            <span className="text-3xl font-black text-cyan-400 my-1">{evidenceCount}</span>
            <span className="text-[10px] text-slate-400">Certificates & PDFs</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Endorsements</span>
            <span className="text-3xl font-black text-amber-400 my-1">+{totalEndorsements}</span>
            <span className="text-[10px] text-amber-400 font-semibold">Peer verified</span>
          </div>
        </div>
      </div>

      {/* SPECIFIC AREAS FOR SPECIFIC TASKS (4 Quick Task Navigation Cards) */}
      <div className="mb-10">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-violet-400" />
            Specific Task Workspaces
          </h2>
          <p className="text-xs text-slate-400">
            Click any task module to jump directly to that dedicated workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Task 1: Skills & Vault */}
          <div 
            onClick={() => onNavigateTab('skills')}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/60 transition-all cursor-pointer shadow-xl group hover:glow-purple flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 border border-violet-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-violet-300 transition-colors">
                Skills & Vault
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Add technical skills, inspect Credly verified credentials, and upload portfolio proofs to your secure vault.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-violet-400">
              <span>Open Vault</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Task 2: Assessment Arena */}
          <div 
            onClick={() => onNavigateTab('assessments')}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer shadow-xl group hover:glow-emerald flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                Assessment Arena
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Take timed HackerRank-style competency quizzes to earn verified badges with automated scoring.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
              <span>Take Test</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Task 3: Talent Search */}
          <div 
            onClick={() => onNavigateTab('search')}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer shadow-xl group hover:glow-cyan flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                Talent Market
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Filter and browse peer freelancers by competency level, hourly rate, or endorsement records.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
              <span>Browse Market</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Task 4: Auto-Match */}
          <div 
            onClick={() => onNavigateTab('automatch')}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer shadow-xl group hover:glow-amber flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                Auto-Match (F7)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Input project requirements to execute algorithmic candidate matching and relevance scoring.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-amber-400">
              <span>Match Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Concise Skills Summary (Minimalist Preview) */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Active Skills Summary
            </h3>
            <p className="text-xs text-slate-400">Recent competencies cataloged on your profile</p>
          </div>

          <button
            onClick={() => onNavigateTab('skills')}
            className="text-xs font-mono font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Manage All in Skills Hub <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {skills.slice(0, 4).map(skill => (
            <div
              key={skill.id}
              onClick={() => setSelectedCredlySkill(skill)}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-white text-xs block">{skill.skill_name}</span>
                <span className="text-[10px] font-mono text-slate-500 block mb-2">{skill.category_name}</span>
              </div>
              <SkillBadge
                status={skill.status}
                score={skill.assessment_score}
                endorsementCount={skill.endorsement_count}
                level={skill.proficiency_level}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Credly Badge Modal */}
      <CredlyBadgeModal
        isOpen={Boolean(selectedCredlySkill)}
        onClose={() => setSelectedCredlySkill(null)}
        skill={selectedCredlySkill}
        freelancer={user}
      />

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base font-mono">Edit Freelancer Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Hourly Rate ($USD)</label>
                  <input
                    type="number"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
