import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  X, 
  Check, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Layers,
  Search,
  AlertCircle
} from 'lucide-react';

export default function ClientProviderDashboard({ onNavigateToAutoMatch, onNavigateToSearch }) {
  const { user, token } = useAuth();
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState('Web Development');
  const [budgetType, setBudgetType] = useState('hourly');
  const [budgetAmount, setBudgetAmount] = useState('75');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([
    { skill_name: 'React', proficiency_level: 'Advanced' }
  ]);
  const [newSkillInput, setNewSkillInput] = useState('Node.js');
  const [newSkillLevel, setNewSkillLevel] = useState('Advanced');
  const [submitting, setSubmitting] = useState(false);

  const availableSkills = [
    'React', 'Node.js', 'Cloud & DevOps Architecture', 'Docker & Containers',
    'Python', 'Machine Learning', 'TypeScript', 'Figma & UI Systems',
    'User Research & UX', 'Flutter'
  ];

  const fetchMyJobs = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/jobs/my-posted', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMyJobs(data.jobs || []);
        if (data.jobs?.length > 0 && !expandedJobId) {
          setExpandedJobId(data.jobs[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching client jobs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyJobs();
  }, [token]);

  const handleAddSkillToJob = () => {
    if (!selectedSkills.some(s => s.skill_name === newSkillInput)) {
      setSelectedSkills([...selectedSkills, { skill_name: newSkillInput, proficiency_level: newSkillLevel }]);
    }
  };

  const handleRemoveSkillFromJob = (skillName) => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_name !== skillName));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category_name: categoryName,
          budget_type: budgetType,
          budget_amount: Number(budgetAmount),
          required_skills: selectedSkills,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      setNotificationMsg({ type: 'success', text: 'New job posting published successfully!' });
      setShowPostModal(false);
      setTitle('');
      setDescription('');
      fetchMyJobs();
    } catch (err) {
      setNotificationMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/jobs/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setNotificationMsg({ 
        type: 'success', 
        text: newStatus === 'accepted' ? 'Candidate accepted! Contract awarded and notification sent.' : 'Application updated.' 
      });
      fetchMyJobs();
    } catch (err) {
      setNotificationMsg({ type: 'error', text: err.message });
    }
  };

  const totalApplicants = myJobs.reduce((acc, j) => acc + (j.applicantCount || 0), 0);
  const totalAccepted = myJobs.reduce((acc, j) => acc + (j.applications?.filter(a => a.status === 'accepted').length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 animate-in fade-in duration-200">
      
      {/* Alert Banner */}
      {notificationMsg && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-xs font-medium ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Job Provider Command Center
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-medium">Hiring & Verified Talent Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            Client Task & Provider Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Post project scopes, set competency requirements, review verified applicant proposals, and award contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Post New Job / Task
          </button>
          <button
            onClick={onNavigateToAutoMatch}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Auto-Match (F7)
          </button>
        </div>
      </div>

      {/* Top Provider Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Postings</span>
          <span className="text-3xl font-black text-gray-900 mt-1 block">{myJobs.length}</span>
          <span className="text-xs text-gray-400 mt-0.5">Active client projects</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Applicants</span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">{totalApplicants}</span>
          <span className="text-xs text-indigo-600/80 mt-0.5">Submitted proposals</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Accepted Contractors</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{totalAccepted}</span>
          <span className="text-xs text-emerald-600/80 mt-0.5">Contracts awarded</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Avg Applicant Match</span>
          <span className="text-3xl font-black text-amber-500 mt-1 block">88%</span>
          <span className="text-xs text-gray-400 mt-0.5">Verified competency depth</span>
        </div>
      </div>

      {/* Posted Jobs & Candidate Review Workspace */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Your Posted Jobs & Received Proposals</h2>
          <span className="text-xs text-gray-400">{myJobs.length} posting(s)</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading your posted tasks...</div>
        ) : myJobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-900 mb-1">No Jobs Posted Yet</h3>
            <p className="text-xs text-gray-500 mb-4">Publish your first task to begin receiving applications from verified specialists.</p>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs"
            >
              Post a Project Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myJobs.map(job => {
              const isExpanded = expandedJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Job Header Bar */}
                  <div
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/70 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                          {job.category_name}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-emerald-600 font-bold">
                          ${job.budget_amount} {job.budget_type === 'hourly' ? '/hr' : 'Fixed'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[11px] text-gray-400">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base leading-snug">{job.title}</h3>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.required_skills?.map(s => (
                          <span
                            key={s.skill_name}
                            className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] text-gray-600 font-medium"
                          >
                            {s.skill_name} ({s.proficiency_level})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900 block">
                          {job.applicantCount || 0} Proposal(s)
                        </span>
                        <span className="text-[11px] text-indigo-600 font-medium">
                          {isExpanded ? 'Hide Applicants' : 'Review Applicants'}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Applicants Drawer */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-[#F8F9FA] p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                          Candidate Proposals ({job.applications?.length || 0})
                        </span>
                        <span>Sorted by algorithm match compatibility</span>
                      </div>

                      {job.applications?.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
                          <p className="text-xs text-gray-400">No proposals received for this task yet.</p>
                          <button
                            onClick={onNavigateToAutoMatch}
                            className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Use Auto-Match to instantly discover matching candidates →
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {job.applications?.map(app => (
                            <div
                              key={app.id}
                              className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3.5">
                                <img
                                  src={app.freelancer_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + app.freelancer_name}
                                  alt={app.freelancer_name}
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-xs flex-shrink-0"
                                />

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-bold text-gray-900 text-sm">{app.freelancer_name}</h4>
                                    <span className="text-xs text-indigo-600 font-medium">{app.freelancer_title}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {app.match_score}% Match
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {app.freelancer_rating}
                                    </span>
                                    <span>•</span>
                                    <span>Proposed Rate: <strong className="text-gray-900">${app.proposed_rate}/hr</strong></span>
                                  </div>

                                  {app.cover_note && (
                                    <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 max-w-2xl leading-relaxed">
                                      "{app.cover_note}"
                                    </p>
                                  )}

                                  {/* Verified skill badges of applicant */}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {app.freelancer_skills?.slice(0, 3).map(s => (
                                      <span
                                        key={s.skill_name}
                                        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100"
                                      >
                                        ✓ {s.skill_name} ({s.proficiency_level})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                                {app.status === 'accepted' ? (
                                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Contract Awarded
                                  </span>
                                ) : app.status === 'rejected' ? (
                                  <span className="px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
                                    Declined
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Accept & Hire
                                    </button>
                                    <button
                                      onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                                      className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-medium transition-colors"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Post New Job / Task */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-gray-200 shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Publish Job / Task</h3>
                <p className="text-gray-500 text-xs mt-0.5">Specify deliverables and required verified competency tiers</p>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Cloud Architecture Optimization"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Budget ({budgetType === 'hourly' ? '$/hr' : '$ Fixed'})</label>
                  <input
                    type="number"
                    value={budgetAmount}
                    onChange={e => setBudgetAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Skills Builder */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Required Competencies</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  >
                    {availableSkills.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value)}
                    className="w-32 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddSkillToJob}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map(s => (
                    <span
                      key={s.skill_name}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs flex items-center gap-1.5 font-medium"
                    >
                      {s.skill_name} ({s.proficiency_level})
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillFromJob(s.skill_name)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Deliverables & Scope Description</label>
                <textarea
                  rows="3"
                  placeholder="Detail key objectives, technical stack requirements, and expected timeline..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {submitting ? 'Publishing...' : 'Publish Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
