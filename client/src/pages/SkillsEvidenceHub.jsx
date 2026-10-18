import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import CredlyBadgeModal from '../components/CredlyBadgeModal';
import { 
  Plus, 
  UploadCloud, 
  Trash2, 
  FileText, 
  ExternalLink,
  ShieldCheck, 
  Check, 
  X,
  Layers,
  Award,
  Sparkles
} from 'lucide-react';

export default function SkillsEvidenceHub({ onTakeAssessment }) {
  const { user, token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedCredlySkill, setSelectedCredlySkill] = useState(null);

  // Form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Web Development');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Evidence upload form
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');

  const fetchMySkills = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/skills/my-skills', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setSkills(data.skills || []);
        if (data.skills?.length > 0 && !selectedSkillForEvidence) {
          setSelectedSkillForEvidence(data.skills[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching skills:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMySkills();
  }, [token]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await fetch('/api/skills/my-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill_name: newSkillName.trim(),
          category_name: newSkillCategory,
          proficiency_level: newSkillLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add skill');

      setMessage({ type: 'success', text: data.message });
      setNewSkillName('');
      setShowAddSkillModal(false);
      fetchMySkills();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      const res = await fetch(`/api/skills/my-skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchMySkills();
        setMessage({ type: 'success', text: 'Skill removed.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }
    if (!selectedSkillForEvidence) {
      setMessage({ type: 'error', text: 'Please select a skill to link this evidence to.' });
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('freelancer_skill_id', selectedSkillForEvidence);
    formData.append('title', evidenceTitle || evidenceFile.name);
    formData.append('evidenceFile', evidenceFile);
    formData.append('notes', evidenceNotes);

    try {
      const res = await fetch('/api/skills/evidence', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setMessage({ type: 'success', text: data.message });
      setEvidenceFile(null);
      setEvidenceTitle('');
      setEvidenceNotes('');
      setUploadLoading(false);
      fetchMySkills();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setUploadLoading(false);
    }
  };

  const handleDeleteEvidence = async (evId) => {
    try {
      const res = await fetch(`/api/skills/evidence/${evId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchMySkills();
        setMessage({ type: 'success', text: 'Evidence item deleted.' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const allEvidence = skills.flatMap(s => (s.evidence || []).map(e => ({ ...e, skill_name: s.skill_name })));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Alert banner */}
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

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 mb-2">
            Specific Area • Competency Catalog & Credentials Vault
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-violet-400" />
            Skills & Evidence Vault
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Catalog your technical talents, inspect Credly verified badges, and upload supporting project certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddSkillModal(true)}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 glow-purple"
          >
            <Plus className="w-4 h-4" />
            Add New Skill
          </button>
          <button
            onClick={onTakeAssessment}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            Take Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Skills List */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Cataloged Skills ({skills.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Click any badge to view verifiable Credly metadata.</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">Loading skill matrix...</div>
            ) : skills.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400 font-mono">No skills added yet.</p>
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="mt-2 text-xs font-semibold text-violet-400 hover:text-violet-300"
                >
                  Click here to add your first skill
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{skill.skill_name}</span>
                        <span className="text-[11px] font-mono text-slate-500">({skill.category_name})</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        Proficiency: <span className="text-slate-200 font-semibold">{skill.proficiency_level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <SkillBadge
                        status={skill.status}
                        score={skill.assessment_score}
                        endorsementCount={skill.endorsement_count}
                        level={skill.proficiency_level}
                        onClick={() => setSelectedCredlySkill(skill)}
                      />

                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Evidence Vault & Upload */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                Upload Supporting Evidence (F3, S7)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload certificates, PDFs, or portfolios. Stored securely in the verified digital credentials repository.
              </p>
            </div>

            <form onSubmit={handleUploadEvidence} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Skill</label>
                  <select
                    value={selectedSkillForEvidence || ''}
                    onChange={(e) => setSelectedSkillForEvidence(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.skill_name} ({s.proficiency_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Evidence Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Certified Cloud Architect - Associate Certificate"
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-2xl p-6 text-center bg-slate-950/60 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  id="evidenceInput"
                  onChange={(e) => setEvidenceFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.zip"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2 border border-violet-500/20 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    {evidenceFile ? `Selected: ${evidenceFile.name}` : 'Click to browse or drag file here'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, PNG, JPG, ZIP (max 10MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadLoading || !evidenceFile}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadLoading ? 'Uploading Evidence...' : 'Upload Document'}
                </button>
              </div>
            </form>

            {/* List of currently uploaded evidence */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                Uploaded Evidence Documents ({allEvidence.length})
              </h4>

              {allEvidence.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono italic">No evidence uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allEvidence.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition-all flex items-start justify-between gap-2 shadow-xs"
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 flex-shrink-0 border border-violet-500/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden font-mono">
                          <div className="text-xs font-bold text-white truncate" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-cyan-400">{item.skill_name}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold ${
                              item.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View evidence document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteEvidence(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete evidence"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

      {/* Modal: Add Skill */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base font-mono">Catalog New Skill</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Docker, Python, Figma"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:ring-1 focus:ring-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Cybersecurity & Backend">Cybersecurity & Backend</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Competency Level (SRS F2)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setNewSkillLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                        newSkillLevel === lvl
                          ? 'border-violet-500 bg-violet-500/20 text-violet-300 shadow-xs'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
