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
  Plus
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
  const [selectedEvidenceForAction, setSelectedEvidenceForAction] = useState(null);

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
      setSelectedEvidenceForAction(null);
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
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 mb-1">
            SRS Requirement F9, F10 & S5
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            Platform Oversight & Administration Center
          </h1>
          <p className="text-xs text-slate-600">
            Content moderation, extensible skill taxonomy, tamper-evident audit logging, and platform analytics.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
          <button
            onClick={() => setActiveAdminTab('metrics')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeAdminTab === 'metrics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics & KPIs (F10)
          </button>
          <button
            onClick={() => setActiveAdminTab('moderation')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'moderation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Moderation Queue (F9)
            {moderationQueue.filter(q => q.status === 'Uploaded').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {moderationQueue.filter(q => q.status === 'Uploaded').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveAdminTab('taxonomy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeAdminTab === 'taxonomy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Taxonomy Builder (4.3)
          </button>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeAdminTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log (S5)
          </button>
        </div>
      </div>

      {/* TAB 1: METRICS & ANALYTICS (SRS F10) */}
      {activeAdminTab === 'metrics' && metricsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Freelancer Profiles</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{metricsData.metrics?.totalFreelancers}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Active on platform</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Cataloged Skills</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{metricsData.metrics?.totalSkills}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                {metricsData.metrics?.verificationRate}% Verified Rate
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Peer & Client Endorsements</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{metricsData.metrics?.totalEndorsements}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Documented recommendations</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assessments Pass Rate</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{metricsData.metrics?.assessmentPassRate}%</span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {metricsData.metrics?.passedAssessments} passed / {metricsData.metrics?.totalAssessmentsTaken} tests
              </span>
            </div>
          </div>

          {/* Category & Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Skills by Category</h3>
              <div className="space-y-2">
                {metricsData.categoryBreakdown?.map(cat => (
                  <div key={cat.category_name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{cat.category_name}</span>
                    <span className="font-bold text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-50">
                      {cat.count} skills
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Verification Status Distribution</h3>
              <div className="space-y-2">
                {metricsData.statusBreakdown?.map(st => (
                  <div key={st.status} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{st.status}</span>
                    <span className="font-bold text-slate-900 px-2 py-0.5 rounded-full bg-slate-100">
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Evidence Moderation Queue</h2>
              <p className="text-xs text-slate-500">Review uploaded certificates and work samples before awarding verified status.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {moderationQueue.length} Total Uploads
            </span>
          </div>

          {moderationQueue.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center italic">No evidence in moderation queue.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {moderationQueue.map(item => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Flagged' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Freelancer: <strong className="text-slate-800">{item.freelancer_name}</strong></span>
                      <span>•</span>
                      <span>Skill: <strong className="text-indigo-600">{item.skill_name}</strong></span>
                      <span>•</span>
                      <span>Storage: <strong className="uppercase">{item.storage_type}</strong></span>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-600 italic">Notes: {item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      View File <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleModerate(item.id, 'Verified')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>

                    <button
                      onClick={() => handleModerate(item.id, 'Flagged')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-600" /> Add Skill Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Adaptable taxonomy without code modification (SRS 4.3)</p>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded & IoT Systems"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Summary of skills under this category"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2 font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Add Standard Skill Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" /> Add Skill to Taxonomy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Register standardized competencies</p>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Category</label>
                <select
                  value={newSkillCatId}
                  onChange={(e) => setNewSkillCatId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kubernetes, Rust, GraphQL"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Description</label>
                <textarea
                  rows="2"
                  placeholder="Core criteria of this competency"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2 font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Register Skill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER (SRS S5) */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Administrative Audit Logs (SRS S5)
              </h2>
              <p className="text-xs text-slate-500">
                Timestamped immutable records of all moderation and administrative interventions.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total Entries: {auditLogs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{log.admin_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.target_type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
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
