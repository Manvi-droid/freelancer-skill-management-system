import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  X, 
  Check, 
  MapPin, 
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function FreelancerJobsMarket({ onNavigateToAssessments }) {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-applications'
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Apply Modal state
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [proposedRate, setProposedRate] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const categories = [
    'All',
    'Web Development',
    'Cloud & DevOps',
    'AI & Data Science',
    'Mobile App Development',
    'UI/UX Design',
  ];

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`/api/jobs?${params.toString()}`, { headers })
      .then(res => res.json())
      .then(data => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      });
  };

  const fetchMyApplications = () => {
    if (!token) return;
    fetch('/api/jobs/my-applications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMyApplications(data.applications || []);
      })
      .catch(err => console.error('Error fetching my applications:', err));
  };

  useEffect(() => {
    fetchJobs();
    if (activeTab === 'my-applications') {
      fetchMyApplications();
    }
  }, [token, searchQuery, selectedCategory, activeTab]);

  const handleOpenApplyModal = (job) => {
    setSelectedJobForApply(job);
    setProposedRate(job.budget_amount || '');
    setCoverNote(`I have verified skills in ${job.required_skills?.map(s => s.skill_name).join(', ')} and would love to deliver exceptional results on this project.`);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJobForApply) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJobForApply.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposed_rate: Number(proposedRate),
          cover_note: coverNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setNotificationMsg({
        type: 'success',
        text: `Application submitted successfully for "${selectedJobForApply.title}"! (Match score: ${data.matchScore}%)`,
      });

      setSelectedJobForApply(null);
      fetchJobs();
      fetchMyApplications();
    } catch (err) {
      setNotificationMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

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
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Freelancer Marketplace
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-medium">Verified Contract Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-600" />
            Client Tasks & Contract Opportunities
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse open projects, check your verified match compatibility, and submit applications directly to hiring clients.
          </p>
        </div>

        {/* Boost Rank Callout */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-gray-900 block">Want higher match rankings?</span>
            <span className="text-gray-500">Take technical skill tests to certify proficiency and earn Credly badges.</span>
          </div>
          <button
            onClick={onNavigateToAssessments}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex-shrink-0"
          >
            Take Test
          </button>
        </div>
      </div>

      {/* Tab Switcher: Browse Jobs vs My Applications */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'browse'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Available Jobs ({jobs.length})</span>
          {activeTab === 'browse' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('my-applications')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'my-applications'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>My Applications</span>
          {myApplications.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
              {myApplications.length}
            </span>
          )}
          {activeTab === 'my-applications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: BROWSE JOBS */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by keyword, title, or skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-500 font-medium">Category:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-400">Loading open contracts...</div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
              <p className="text-sm font-bold text-gray-900 mb-1">No open jobs match your criteria</p>
              <p className="text-xs text-gray-500">Try broadening your search or choosing a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Client & Category */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={job.client_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + job.client_name}
                          alt={job.client_name}
                          className="w-7 h-7 rounded-lg object-cover border border-gray-200"
                        />
                        <span className="text-xs font-semibold text-gray-700">{job.client_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          {job.category_name}
                        </span>
                        {/* Dynamic Match Score badge */}
                        {job.matchScore !== null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            job.matchScore >= 80 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : job.matchScore >= 50
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            <Sparkles className="w-3 h-3" />
                            {job.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Job Title */}
                    <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {job.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    {/* Required Skills */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Required Competencies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.required_skills?.map(s => (
                          <span
                            key={s.skill_name}
                            className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-700 font-medium"
                          >
                            {s.skill_name} <span className="text-gray-400">({s.proficiency_level})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Budget & Apply Button */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-gray-900 text-sm flex items-center gap-0.5">
                        <span className="text-emerald-600">${job.budget_amount}</span>
                        <span className="text-[11px] font-normal text-gray-400">
                          {job.budget_type === 'hourly' ? '/hr' : ' Fixed'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">{job.applicantCount || 0} applicant(s)</span>
                    </div>

                    {job.hasApplied ? (
                      <span className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Applied ({job.myApplicationStatus})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenApplyModal(job)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        Apply for Task <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SUBMITTED APPLICATIONS */}
      {activeTab === 'my-applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
              <p className="text-sm font-bold text-gray-900 mb-1">You haven't applied for any jobs yet</p>
              <p className="text-xs text-gray-500 mb-4">Browse open contracts and submit proposals using your verified competencies.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Explore Available Jobs
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              {myApplications.map(app => (
                <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-gray-900 text-sm">{app.job_title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {app.status === 'accepted' ? '🎉 Accepted & Contract Awarded' : app.status}
                      </span>
                    </div>

                    <div className="text-gray-400 flex items-center gap-2">
                      <span>Client: <strong className="text-gray-700">{app.client_name}</strong></span>
                      <span>•</span>
                      <span>Proposed Rate: <strong className="text-emerald-600">${app.proposed_rate}/hr</strong></span>
                      <span>•</span>
                      <span>Match Compatibility: <strong className="text-blue-600">{app.match_score}%</strong></span>
                    </div>

                    {app.cover_note && (
                      <p className="text-gray-600 text-[11px] italic mt-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        "{app.cover_note}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-gray-400 flex-shrink-0">
                    <div>Applied {new Date(app.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Apply for Job */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Submit Proposal</h3>
                <p className="text-xs text-blue-600 mt-0.5">{selectedJobForApply.title}</p>
              </div>
              <button 
                onClick={() => setSelectedJobForApply(null)} 
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Your Match Score</span>
                  <span className="text-gray-500">Calculated from verified competencies in your profile</span>
                </div>
                <span className="text-lg font-black text-blue-700">{selectedJobForApply.matchScore}%</span>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Proposed Rate ({selectedJobForApply.budget_type === 'hourly' ? '$/hr' : '$ Fixed'})
                </label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={e => setProposedRate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Proposal Cover Note / Relevant Credentials
                </label>
                <textarea
                  rows="3"
                  value={coverNote}
                  onChange={e => setCoverNote(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why your verified competencies make you the right fit for this task..."
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
