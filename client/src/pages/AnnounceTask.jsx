import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Megaphone, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  DollarSign, 
  AlertCircle,
  X
} from 'lucide-react';

export default function AnnounceTask({ onTaskAnnounced, onNavigateToAutoMatch }) {
  const { token } = useAuth();
  
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
  const [notificationMsg, setNotificationMsg] = useState(null);

  const availableSkills = [
    'React', 'Node.js', 'Cloud & DevOps Architecture', 'Docker & Containers',
    'Python', 'Machine Learning', 'TypeScript', 'Figma & UI Systems',
    'User Research & UX', 'Flutter'
  ];

  const handleAddSkillToJob = () => {
    if (!selectedSkills.some(s => s.skill_name === newSkillInput)) {
      setSelectedSkills([...selectedSkills, { skill_name: newSkillInput, proficiency_level: newSkillLevel }]);
    }
  };

  const handleRemoveSkillFromJob = (skillName) => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_name !== skillName));
  };

  const handleAnnounceTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setNotificationMsg(null);

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
      if (!res.ok) throw new Error(data.error || 'Failed to announce task');

      setNotificationMsg({
        type: 'success',
        text: `Task "${title}" has been successfully announced to the workforce! Candidates can now apply.`,
      });

      setTitle('');
      setDescription('');
      if (onTaskAnnounced) onTaskAnnounced();
    } catch (err) {
      setNotificationMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 animate-in fade-in duration-200">
      
      {/* Alert Banner */}
      {notificationMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-medium ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Job Provider Portal
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-medium">Task Availability Broadcast</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Megaphone className="w-7 h-7 text-indigo-600" />
          Announce a Task Availability
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Define your project scope, set budget parameters, and announce task requirements to the verified workforce.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-7 sm:p-8">
        <form onSubmit={handleAnnounceTask} className="space-y-6 text-xs">
          
          {/* Title */}
          <div>
            <label className="block text-gray-800 font-bold mb-1.5">
              Task / Project Title
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Cloud Architecture & Security Hardening"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Category & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-800 font-bold mb-1.5">Category</label>
              <select
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-bold mb-1.5">Budget Type</label>
              <select
                value={budgetType}
                onChange={e => setBudgetType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="hourly">Hourly Rate ($/hr)</option>
                <option value="fixed">Fixed Project Price ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-bold mb-1.5">
                Budget Amount ({budgetType === 'hourly' ? '$/hr' : '$ Total'})
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={e => setBudgetAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Required Competencies Builder */}
          <div>
            <label className="block text-gray-800 font-bold mb-1.5">
              Required Skills & Competency Tiers
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              <select
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="flex-1 min-w-[160px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableSkills.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value)}
                className="w-36 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>

              <button
                type="button"
                onClick={handleAddSkillToJob}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Requirement
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 min-h-[48px] items-center">
              {selectedSkills.length === 0 ? (
                <span className="text-gray-400 text-[11px]">No skill requirements selected yet.</span>
              ) : (
                selectedSkills.map(s => (
                  <span
                    key={s.skill_name}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs flex items-center gap-2 font-medium shadow-2xs"
                  >
                    <span>{s.skill_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200/60 font-bold text-indigo-900">
                      {s.proficiency_level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillFromJob(s.skill_name)}
                      className="text-indigo-400 hover:text-red-500 text-sm font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Deliverables & Scope */}
          <div>
            <label className="block text-gray-800 font-bold mb-1.5">
              Deliverables & Scope Description
            </label>
            <textarea
              rows="4"
              placeholder="Outline project objectives, specific technical stack details, and expected delivery milestones..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              required
            ></textarea>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-[11px] text-gray-400">
              When announced, this task will immediately be matched with verified specialists.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <Megaphone className="w-4 h-4" />
                {submitting ? 'Broadcasting...' : 'Announce Task to Workforce'}
              </button>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}
