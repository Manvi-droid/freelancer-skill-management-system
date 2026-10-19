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

  const adminTabs = [
    { id: 'metrics', label: 'Analytics & KPIs' },
    { id: 'moderation', label: 'Verification Queue', badge: moderationQueue.filter(q => q.status === 'Uploaded').length },
    { id: 'taxonomy', label: 'Taxonomy' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Alert Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 font-medium ml-1">Moderation Desk — SRS F9, F10 & S5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            Platform Governance & Moderation Control
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Credential verification, taxonomy management, immutable audit logging, and platform-wide analytics.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-sm">
          {adminTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeAdminTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: METRICS & ANALYTICS (SRS F10) */}
      {activeAdminTab === 'metrics' && metricsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Freelancer Profiles</span>
              <span className="text-3xl font-bold text-gray-900 mt-1 block">{metricsData.metrics?.totalFreelancers}</span>
              <span className="text-xs text-gray-400 mt-1 block">Active specialists</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Total Skills</span>
              <span className="text-3xl font-bold text-blue-600 mt-1 block">{metricsData.metrics?.totalSkills}</span>
              <span className="text-xs text-green-600 font-medium mt-1 block">
                {metricsData.metrics?.verificationRate}% Verified
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Peer Endorsements</span>
              <span className="text-3xl font-bold text-purple-600 mt-1 block">{metricsData.metrics?.totalEndorsements}</span>
              <span className="text-xs text-gray-400 mt-1 block">Documented recommendations</span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Assessment Pass Rate</span>
              <span className="text-3xl font-bold text-green-600 mt-1 block">{metricsData.metrics?.assessmentPassRate}%</span>
              <span className="text-xs text-gray-400 mt-1 block">
                {metricsData.metrics?.passedAssessments} passed / {metricsData.metrics?.totalAssessmentsTaken} tests
              </span>
            </div>
          </div>

          {/* Category & Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Skills by Category</h3>
              <div className="space-y-2.5">
                {metricsData.categoryBreakdown?.map(cat => (
                  <div key={cat.category_name} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{cat.category_name}</span>
                    <span className="font-medium text-blue-600 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                      {cat.count} skills
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Verification Status Distribution</h3>
              <div className="space-y-2.5">
                {metricsData.statusBreakdown?.map(st => (
                  <div key={st.status} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">{st.status}</span>
                    <span className="font-medium text-gray-700 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Evidence & Credential Moderation Queue</h2>
              <p className="text-sm text-gray-500">Review uploaded certificates and work samples before awarding verified status.</p>
            </div>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {moderationQueue.length} Uploaded Items
            </span>
          </div>

          {moderationQueue.length === 0 ? (
            <p className="text-sm text-gray-400 py-12 text-center italic">No items pending in moderation queue.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {moderationQueue.map(item => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-semibold text-gray-900">{item.title}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        item.status === 'Verified' ? 'bg-green-100 text-green-700 border border-green-200' :
                        item.status === 'Flagged' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 mt-1">
                      <span>Freelancer: <strong className="text-gray-900">{item.freelancer_name}</strong></span>
                      <span>•</span>
                      <span>Skill: <strong className="text-blue-600">{item.skill_name}</strong></span>
                      <span>•</span>
                      <span>Storage: <strong className="text-purple-600 uppercase">{item.storage_type}</strong></span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">Notes: {item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-1.5 transition-colors text-sm"
                    >
                      View File <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </a>

                    <button
                      onClick={() => handleModerate(item.id, 'Verified')}
                      className="px-3.5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors flex items-center gap-1 shadow-sm text-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>

                    <button
                      onClick={() => handleModerate(item.id, 'Flagged')}
                      className="px-3.5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-1 shadow-sm text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-600" /> Add Skill Category
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Extensible taxonomy without code modifications (SRS 4.3)</p>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded & IoT Systems"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Summary of skills under this category"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Add Standard Skill Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-600" /> Add Skill to Taxonomy
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Register standardized competency definitions</p>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Target Category</label>
                <select
                  value={newSkillCatId}
                  onChange={(e) => setNewSkillCatId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kubernetes, Rust, GraphQL"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Skill Description</label>
                <textarea
                  rows="2"
                  placeholder="Core criteria of this competency"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-sm transition-colors"
              >
                Register Skill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER (SRS S5) */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Administrative Audit Trail (SRS S5)
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Timestamped immutable records of all moderation and administrative interventions.
              </p>
            </div>
            <span className="text-gray-400 text-sm">Entries: {auditLogs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-widest font-semibold text-xs">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Admin</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900">{log.admin_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{log.target_type}</td>
                    <td className="py-3 px-3 text-gray-700">{log.details}</td>
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
