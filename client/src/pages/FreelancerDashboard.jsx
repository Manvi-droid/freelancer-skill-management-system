import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import { 
  Plus, 
  UploadCloud, 
  Trash2, 
  FileText, 
  Award, 
  CheckCircle2, 
  Clock, 
  Star, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  Edit3,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export default function FreelancerDashboard({ onTakeAssessment, onViewPublicProfile }) {
  const { user, token, refreshUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Web Development');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  const [editFullName, setEditFullName] = useState(user?.full_name || '');
  const [editTitle, setEditTitle] = useState(user?.title || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editHourlyRate, setEditHourlyRate] = useState(user?.hourly_rate || 55);

  // Evidence upload form
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceNotes, setEvidenceNotes] = useState('');

  // Fetch current skills
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

  useEffect(() => {
    if (user) {
      setEditFullName(user.full_name || '');
      setEditTitle(user.title || '');
      setEditBio(user.bio || '');
      setEditLocation(user.location || '');
      setEditHourlyRate(user.hourly_rate || 55);
    }
  }, [user]);

  // Add new skill (SRS F2: simplified interaction takes <= 3 clicks)
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

  // Delete skill
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

  // Update profile info
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

  // Upload evidence (SRS F3, S7, AWS S3 Free Tier)
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

  // Delete evidence
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

  // All evidence items across skills
  const allEvidence = skills.flatMap(s => (s.evidence || []).map(e => ({ ...e, skill_name: s.skill_name })));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Alert banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SRS Wireframe Layout Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-4 rounded-2xl border border-indigo-100 shadow-xs">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 mb-1">
            SRS Wireframe Prototype Implementation (Page 8)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Freelancer Dashboard</h1>
          <p className="text-xs text-slate-600">Manage your verified competencies, evidence portfolio, and endorsement statuses.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewPublicProfile(user?.id || 'usr-riya')}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Public Profile (U2)
          </button>
          <button
            onClick={onTakeAssessment}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            Take Skill Assessment (F5)
          </button>
        </div>
      </div>

      {/* Main Two-Column Grid matching SRS Wireframe Page 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Wireframe Freelancer Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border-2 border-slate-800/80 shadow-md p-6 relative overflow-hidden text-center sm:text-left">
            {/* Top Wireframe Badge */}
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-dashed border-slate-200">
              Freelancer Card Module
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              {/* Circular Initials Avatar matching Wireframe "RK" */}
              <div className="w-20 h-20 rounded-full border-2 border-slate-900 bg-amber-100 text-slate-900 font-extrabold text-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'RK'}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.full_name || 'Riya kapoor'}</h2>
                <p className="text-sm font-medium text-indigo-600">{user?.title || 'Full stacu Dev'}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {user?.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> ${user?.hourly_rate || 55}/hr
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Button (Matches wireframe [Edit profile]) */}
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="w-full mt-2 py-2 px-4 rounded-xl border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit profile
            </button>

            {/* Wireframe Score Box (Matches bottom-left wireframe: "score. 7.4") */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
              <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-center">
                <span className="text-[11px] font-mono text-slate-500 block">score</span>
                <span className="text-xl font-black text-slate-900">{user?.rating ? (user.rating * 1.5).toFixed(1) : '7.4'}</span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-500 justify-end">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{user?.rating || 4.9}</span>
                  <span className="text-xs text-slate-400">/5.0</span>
                </div>
                <div className="text-[11px] text-slate-500">{user?.reviews_count || 14} verified reviews</div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4 text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
              {user?.bio || 'Full Stack Engineer cataloging verified skills and evidence.'}
            </div>
          </div>

          {/* Quick Platform Quality / Verification Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verification Status Overview
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Total Skills Cataloged:</span>
                <span className="font-bold text-slate-800">{skills.length}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Assessed by Test (F5):</span>
                <span className="font-bold text-emerald-600">
                  {skills.filter(s => s.status === 'Assessed').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Endorsed by Peers/Clients:</span>
                <span className="font-bold text-blue-600">
                  {skills.filter(s => s.status === 'Endorsed').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Uploaded Evidence Files:</span>
                <span className="font-bold text-slate-800">{allEvidence.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Skills list matching wireframe boxes & Evidence upload box */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Skills Section with [+ Add] button (Matches wireframe) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Skills
                  <span className="text-xs font-normal text-slate-500">({skills.length} cataloged)</span>
                </h2>
                <p className="text-xs text-slate-500">Self-reported talents, verified endorsements, and test assessments</p>
              </div>

              {/* + Add Button matching wireframe */}
              <button
                onClick={() => setShowAddSkillModal(true)}
                className="px-3 py-1.5 rounded-xl border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add
              </button>
            </div>

            {/* List of Skills matching wireframe layout */}
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading skills...</div>
            ) : skills.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500">No skills added yet.</p>
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Click here to add your first skill
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-xl border-2 border-slate-900/80 bg-white hover:border-indigo-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{skill.skill_name}</span>
                        <span className="text-[11px] text-slate-400">({skill.category_name})</span>
                      </div>
                      <div className="text-xs text-slate-500 capitalize mt-0.5 font-medium">
                        Level: <span className="text-slate-800 font-semibold">{skill.proficiency_level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <SkillBadge
                        status={skill.status}
                        score={skill.assessment_score}
                        endorsementCount={skill.endorsement_count}
                        level={skill.proficiency_level}
                      />

                      {/* Delete skill */}
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

          {/* Wireframe Drag Evidence or Browse Files Dropzone Box */}
          <div className="bg-white rounded-2xl border-2 border-slate-900/80 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  Supporting Evidence & Portfolio (F3, S7)
                </h3>
                <p className="text-xs text-slate-500">
                  Upload certificates, project samples, or code audits. Files are stored on <span className="font-semibold text-indigo-600">AWS S3 Free Tier</span> or local storage.
                </p>
              </div>
            </div>

            {/* Dropzone Form matching wireframe box */}
            <form onSubmit={handleUploadEvidence} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link to Skill</label>
                  <select
                    value={selectedSkillForEvidence || ''}
                    onChange={(e) => setSelectedSkillForEvidence(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.skill_name} ({s.proficiency_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Evidence Title</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS Certified Developer Certificate"
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Wireframe dashed upload box: "drag evidence or browse files: certificates, portfolio" */}
              <div className="border-2 border-dashed border-slate-400 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer relative">
                <input
                  type="file"
                  id="evidenceInput"
                  onChange={(e) => setEvidenceFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.zip"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {evidenceFile ? `Selected: ${evidenceFile.name}` : 'drag evidence or browse files'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    certificates, portfolio, work samples (PDF, PNG, JPG, max 10MB)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={uploadLoading || !evidenceFile}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {uploadLoading ? (
                    'Uploading to AWS Free Tier S3...'
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Upload Evidence Document
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* List of currently uploaded evidence */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Uploaded Evidence Documents ({allEvidence.length})
              </h4>

              {allEvidence.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No evidence uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allEvidence.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-indigo-600">{item.skill_name}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded font-medium ${
                              item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
                          className="p-1 rounded text-slate-400 hover:text-indigo-600"
                          title="View evidence"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteEvidence(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
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

      {/* Modal: Add Skill (SRS F2: <= 3 clicks) */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Skill to Profile</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Docker, Python, Figma"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Self-Reported Competency Level (SRS F2)</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setNewSkillLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                        newSkillLevel === lvl
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Profile */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Edit Freelancer Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Rate ($USD)</label>
                  <input
                    type="number"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 font-medium"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
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
