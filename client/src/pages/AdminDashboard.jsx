import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  Award, 
  CheckCircle2, 
  FileCheck, 
  FolderPlus, 
  ListFilter, 
  ExternalLink, 
  Clock, 
  History,
  AlertTriangle,
  Check,
  X,
  Plus,
  Terminal,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState('metrics'); // 'metrics', 'moderation', 'taxonomy', 'audit'
  const [metricsData, setMetricsData] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Taxonomy forms
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newSkillCatId, setNewSkillCatId] = useState('cat-web');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  // Moderation action form
  const [moderationNotes, setModerationNotes] = useState('');

  const fetchAdminData = () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/admin/metrics', { headers }).then(r => r.json()),
      fetch('/api/admin/moderation-queue', { headers }).then(r => r.json()),
      fetch('/api/admin/audit-logs', { headers }).then(r => r.json()),
    ])
      .then(([metrics, queue, logs]) => {
        setMetricsData(metrics);
        setModerationQueue(queue.moderationItems || []);
        setAuditLogs(logs.logs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Admin fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Handle Moderation Action (SRS F9, S5)
  const handleModerate = async (evidenceId, status) => {
    try {
      const res = await fetch(`/api/admin/moderation/${evidenceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          notes: moderationNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Moderation failed');

      setMessage({ type: 'success', text: data.message });
      setModerationNotes('');
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Add Category (SRS Adaptability 4.3)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      setNewCatName('');
      setNewCatDesc('');
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Add Skill to Taxonomy (SRS Adaptability 4.3)
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: newSkillCatId,
          name: newSkillName.trim(),
          description: newSkillDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      setNewSkillName('');
      setNewSkillDesc('');
      fetchAdminData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Alert Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-mono ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header (Linear / Stripe Style) */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-2">
            Linear / Stripe Style Moderation Desk (SRS F9, F10 & S5)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            Platform Governance & Moderation Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Credential verification, taxonomy management, immutable audit logging, and platform-wide analytics.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveAdminTab('metrics')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeAdminTab === 'metrics' ? 'bg-slate-800 text-white shadow-xs glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics & KPIs (F10)
          </button>
          <button
            onClick={() => setActiveAdminTab('moderation')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'moderation' ? 'bg-slate-800 text-white shadow-xs glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verification Queue (F9)
            {moderationQueue.filter(q => q.status === 'Uploaded').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {moderationQueue.filter(q => q.status === 'Uploaded').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveAdminTab('taxonomy')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeAdminTab === 'taxonomy' ? 'bg-slate-800 text-white shadow-xs glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Taxonomy (4.3)
          </button>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeAdminTab === 'audit' ? 'bg-slate-800 text-white shadow-xs glow-purple' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Log (S5)
          </button>
        </div>
      </div>

      {/* TAB 1: METRICS & ANALYTICS (SRS F10) */}
      {activeAdminTab === 'metrics' && metricsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Freelancer Profiles</span>
              <span className="text-3xl font-black text-white mt-1 block">{metricsData.metrics?.totalFreelancers}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Active specialists</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Cataloged Skills</span>
              <span className="text-3xl font-black text-cyan-400 mt-1 block">{metricsData.metrics?.totalSkills}</span>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                {metricsData.metrics?.verificationRate}% Verified Rate
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Peer Endorsements</span>
              <span className="text-3xl font-black text-violet-400 mt-1 block">{metricsData.metrics?.totalEndorsements}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Documented recommendations</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Assessment Pass Rate</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 block">{metricsData.metrics?.assessmentPassRate}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {metricsData.metrics?.passedAssessments} passed / {metricsData.metrics?.totalAssessmentsTaken} tests
              </span>
            </div>
          </div>

          {/* Category & Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="font-bold text-sm text-white mb-4">Skills by Category</h3>
              <div className="space-y-2.5">
                {metricsData.categoryBreakdown?.map(cat => (
                  <div key={cat.category_name} className="flex items-center justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-300 font-sans">{cat.category_name}</span>
                    <span className="font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      {cat.count} skills
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="font-bold text-sm text-white mb-4">Verification Status Distribution</h3>
              <div className="space-y-2.5">
                {metricsData.statusBreakdown?.map(st => (
                  <div key={st.status} className="flex items-center justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-300 font-sans">{st.status}</span>
                    <span className="font-bold text-white px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                      {st.count} ({Math.round((st.count / (metricsData.metrics?.totalSkills || 1)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION QUEUE (SRS F9) */}
      {activeAdminTab === 'moderation' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Evidence & Credential Moderation Queue</h2>
              <p className="text-xs text-slate-400">Review uploaded certificates and work samples before awarding verified status.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {moderationQueue.length} Uploaded Items
            </span>
          </div>

          {moderationQueue.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center font-mono italic">No items pending in moderation queue.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {moderationQueue.map(item => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        item.status === 'Flagged' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                      <span>Freelancer: <strong className="text-white">{item.freelancer_name}</strong></span>
                      <span>•</span>
                      <span>Skill: <strong className="text-cyan-400">{item.skill_name}</strong></span>
                      <span>•</span>
                      <span>Storage: <strong className="text-violet-400 uppercase">{item.storage_type}</strong></span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5 font-sans">Notes: {item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      View File <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>

                    <button
                      onClick={() => handleModerate(item.id, 'Verified')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>

                    <button
                      onClick={() => handleModerate(item.id, 'Flagged')}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Flag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TAXONOMY BUILDER (SRS Adaptability 4.3) */}
      {activeAdminTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Add Category Form */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" /> Add Skill Category
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Extensible taxonomy without code modifications (SRS 4.3)</p>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded & IoT Systems"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Summary of skills under this category"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Add Standard Skill Form */}
          <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Add Skill to Taxonomy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Register standardized competency definitions</p>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Category</label>
                <select
                  value={newSkillCatId}
                  onChange={(e) => setNewSkillCatId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="cat-web">Web Development</option>
                  <option value="cat-cloud">Cloud & DevOps</option>
                  <option value="cat-ai">AI & Data Science</option>
                  <option value="cat-mobile">Mobile App Development</option>
                  <option value="cat-design">UI/UX Design</option>
                  <option value="cat-security">Cybersecurity & Backend</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kubernetes, Rust, GraphQL"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Skill Description</label>
                <textarea
                  rows="2"
                  placeholder="Core criteria of this competency"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md transition-colors"
              >
                Register Skill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER (SRS S5) */}
      {activeAdminTab === 'audit' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-violet-400" />
                Administrative Audit Trail (SRS S5)
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Timestamped immutable records of all moderation and administrative interventions.
              </p>
            </div>
            <span className="text-slate-500 font-mono">Entries: {auditLogs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-widest font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Admin</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{log.admin_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{log.target_type}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
