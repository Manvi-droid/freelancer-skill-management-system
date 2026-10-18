import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Star, 
  DollarSign, 
  ArrowRight, 
  AlertCircle, 
  Sliders, 
  Layers,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';

export default function ProjectAutoMatch({ onViewFreelancer }) {
  const [projectTitle, setProjectTitle] = useState('Full Stack Cloud Migration');
  const [selectedSkills, setSelectedSkills] = useState([
    { name: 'React', level: 'Advanced' },
    { name: 'Cloud & DevOps Architecture', level: 'Advanced' },
  ]);
  const [maxBudget, setMaxBudget] = useState(75);
  const [mustBeVerified, setMustBeVerified] = useState(true);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSkills = [
    'React',
    'Node.js',
    'Cloud & DevOps Architecture',
    'Docker & Containers',
    'Python',
    'Machine Learning',
    'TypeScript',
    'Figma & UI Systems',
    'User Research & UX',
    'Flutter',
  ];

  const toggleSkill = (skillName) => {
    if (selectedSkills.some(s => s.name === skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s.name !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, { name: skillName, level: 'Advanced' }]);
    }
  };

  const updateSkillLevel = (skillName, newLevel) => {
    setSelectedSkills(
      selectedSkills.map(s => (s.name === skillName ? { ...s, level: newLevel } : s))
    );
  };

  const runAutoMatch = async (e) => {
    if (e) e.preventDefault();
    if (selectedSkills.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/search/auto-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle,
          requiredSkills: selectedSkills,
          maxBudgetPerHour: Number(maxBudget),
          mustBeVerified,
        }),
      });

      const data = await res.json();
      setResults(data);
      setLoading(false);
    } catch (err) {
      console.error('Auto match error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            Algorithmic Recommendation Engine (SRS Requirement F7)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Project Auto-Match & Candidate Ranking
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculates weighted multi-variable match scores across competency depth, Credly verified credentials, and budget constraints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Project Requirements Builder */}
        <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" /> Project Criteria Builder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">Configure required skill levels and budget ceiling</p>
          </div>

          <form onSubmit={runAutoMatch} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Project Scope / Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. Real-Time Analytics Dashboard"
                required
              />
            </div>

            {/* Select Required Skills */}
            <div>
              <label className="block font-bold text-slate-300 mb-2">
                Target Competencies ({selectedSkills.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {availableSkills.map(skill => {
                  const isSelected = selectedSkills.some(s => s.name === skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl border font-bold transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs glow-amber'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {skill}
                    </button>
                  );
                })}
              </div>

              {/* Selected skills level customizer */}
              {selectedSkills.length > 0 && (
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Required Proficiency Tiers:
                  </span>
                  {selectedSkills.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{s.name}</span>
                      <select
                        value={s.level}
                        onChange={(e) => updateSkillLevel(s.name, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[11px] text-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hourly Rate Budget */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-300">Max Hourly Rate</label>
                <span className="font-bold text-amber-400">${maxBudget}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Checkbox for Must be Verified */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={mustBeVerified}
                onChange={(e) => setMustBeVerified(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="verifiedOnly" className="text-slate-300 cursor-pointer">
                Require Verified Status (Credly / Endorsed)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || selectedSkills.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition-all shadow-lg glow-amber flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Computing Match Recommendations...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Execute Smart Match Algorithm (F7)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Ranked Recommendations */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 px-1">
            <span className="font-bold text-white">
              {results ? `${results.rankedFreelancers?.length} Ranked Candidate(s)` : 'Awaiting Match Execution'}
            </span>
            {results && (
              <span className="text-emerald-400">
                Algorithm Execution: {results.responseTimeMs}ms
              </span>
            )}
          </div>

          {!results && !loading && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-mono">Automated Candidate Ranking</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 font-sans leading-relaxed">
                Configure your required skills on the left and execute the algorithm to get an instant ranked recommendation list.
              </p>
              <button
                onClick={() => runAutoMatch()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors shadow-xs"
              >
                Match with Default Requirements
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-16 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="font-semibold text-slate-300">Evaluating candidate competency depth and test percentiles...</p>
            </div>
          )}

          {results && results.rankedFreelancers?.map((candidate, idx) => (
            <div
              key={candidate.id}
              className={`bg-slate-900/90 rounded-3xl border p-6 shadow-xl transition-all ${
                idx === 0
                  ? 'border-amber-500/50 glow-amber'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={candidate.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + candidate.full_name}
                      alt={candidate.full_name}
                      className="w-14 h-14 rounded-2xl border border-slate-700 object-cover"
                    />
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-slate-950 text-amber-400 font-bold text-[10px] flex items-center justify-center border border-amber-500/40">
                      #{idx + 1}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base tracking-tight">{candidate.full_name}</h3>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" /> Optimal Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-400 mt-0.5">{candidate.title}</p>
                  </div>
                </div>

                {/* Match Score Badge & Progress Bar */}
                <div className="sm:text-right min-w-[140px]">
                  <div className="flex items-center sm:justify-end gap-1.5 mb-1">
                    <span className="text-slate-400">Match Relevance:</span>
                    <span className="text-xl font-black text-amber-400">{candidate.matchScore}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        candidate.matchScore >= 80 ? 'bg-emerald-400' : candidate.matchScore >= 50 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${candidate.matchScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Matched Skills Breakdown */}
              <div className="py-3.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Skill Coverage ({candidate.matchedSkillsCount} / {candidate.totalRequiredSkills})
                </span>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkillDetails.map(ms => (
                    <div
                      key={ms.skill_name}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
                    >
                      <span className="font-bold text-white">{ms.skill_name}</span>
                      <span className="text-[11px] text-slate-500">({ms.proficiency_level})</span>
                      {ms.status === 'Assessed' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Assessed {ms.assessment_score}%
                        </span>
                      )}
                      {ms.status === 'Endorsed' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Endorsed +{ms.endorsement_count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Details & Action */}
              <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white flex items-center gap-0.5">
                    <span className="text-emerald-400">${candidate.hourly_rate}</span>/hr
                    <span className={`text-[10px] ml-1.5 ${candidate.budgetFit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({candidate.budgetFit ? 'Within Budget' : 'Exceeds Target'})
                    </span>
                  </span>

                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {candidate.rating}
                  </span>
                </div>

                <button
                  onClick={() => onViewFreelancer(candidate.id)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-white hover:text-slate-950 text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  View Profile & Hire <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
