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
  ChevronRight
} from 'lucide-react';

export default function ProjectAutoMatch({ onViewFreelancer }) {
  const [projectTitle, setProjectTitle] = useState('Full Stack Cloud Migration');
  const [selectedSkills, setSelectedSkills] = useState([
    { name: 'React', level: 'Advanced' },
    { name: 'AWS Cloud Architecture', level: 'Advanced' },
  ]);
  const [maxBudget, setMaxBudget] = useState(75);
  const [mustBeVerified, setMustBeVerified] = useState(true);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSkills = [
    'React',
    'Node.js',
    'AWS Cloud Architecture',
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mb-1">
            SRS Requirement F7 (Section 3.2)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Automated Project Matching Engine
          </h1>
          <p className="text-xs text-slate-600">
            Algorithmic recommendation engine that weights skill overlap, competency level, verified assessment scores, and budget fit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Project Requirements Builder */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border-2 border-slate-900/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" /> Define Project Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Specify required skill proficiencies and constraints</p>
          </div>

          <form onSubmit={runAutoMatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Name / Scope</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Real-Time Analytics Dashboard"
                required
              />
            </div>

            {/* Select Required Skills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Required Skills ({selectedSkills.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {availableSkills.map(skill => {
                  const isSelected = selectedSkills.some(s => s.name === skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {skill}
                    </button>
                  );
                })}
              </div>

              {/* Selected skills level customizer */}
              {selectedSkills.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Target Competency Levels:
                  </span>
                  {selectedSkills.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <select
                        value={s.level}
                        onChange={(e) => updateSkillLevel(s.name, e.target.value)}
                        className="text-[11px] bg-white border border-slate-300 rounded-lg px-2 py-0.5 font-medium"
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
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-bold text-slate-700">Max Hourly Budget</label>
                <span className="font-bold text-indigo-600">${maxBudget}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Checkbox for Must be Verified */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={mustBeVerified}
                onChange={(e) => setMustBeVerified(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <label htmlFor="verifiedOnly" className="text-xs text-slate-700 font-medium cursor-pointer">
                Require Verified Status (Assessed by Test or Endorsed)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || selectedSkills.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Computing Match Recommendations...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Run Smart Match Algorithm (F7)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Ranked Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">
              {results ? `${results.rankedFreelancers?.length} Ranked Candidate(s)` : 'Awaiting Match Execution'}
            </span>
            {results && (
              <span className="font-mono text-emerald-600">
                Algorithm Execution: {results.responseTimeMs}ms
              </span>
            )}
          </div>

          {!results && !loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Automated Candidate Ranking</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                Configure your required skills on the left and click "Run Smart Match Algorithm" to get a ranked, weighted list of optimal freelancer candidates.
              </p>
              <button
                onClick={() => runAutoMatch()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 transition-colors shadow-xs"
              >
                Match with Default Requirements
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-700">Evaluating candidate competencies and test scores...</p>
            </div>
          )}

          {results && results.rankedFreelancers?.map((candidate, idx) => (
            <div
              key={candidate.id}
              className={`bg-white rounded-2xl border-2 p-5 shadow-xs transition-all ${
                idx === 0
                  ? 'border-indigo-600 ring-2 ring-indigo-100'
                  : 'border-slate-800/80 hover:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={candidate.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + candidate.full_name}
                      alt={candidate.full_name}
                      className="w-12 h-12 rounded-full border-2 border-slate-800 object-cover"
                    />
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                      #{idx + 1}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{candidate.full_name}</h3>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" /> Best Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-indigo-600">{candidate.title}</p>
                  </div>
                </div>

                {/* Match Score Badge & Progress Bar */}
                <div className="sm:text-right min-w-[130px]">
                  <div className="flex items-center sm:justify-end gap-1.5 mb-1">
                    <span className="text-xs text-slate-500 font-medium">Relevance:</span>
                    <span className="text-lg font-black text-indigo-600">{candidate.matchScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        candidate.matchScore >= 80 ? 'bg-emerald-500' : candidate.matchScore >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${candidate.matchScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Matched Skills Breakdown */}
              <div className="py-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Skill Match Coverage ({candidate.matchedSkillsCount} / {candidate.totalRequiredSkills})
                </span>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkillDetails.map(ms => (
                    <div
                      key={ms.skill_name}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                    >
                      <span className="font-bold text-slate-800">{ms.skill_name}</span>
                      <span className="text-[11px] text-slate-500 font-medium">({ms.proficiency_level})</span>
                      {ms.status === 'Assessed' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Assessed {ms.assessment_score}%
                        </span>
                      )}
                      {ms.status === 'Endorsed' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Endorsed +{ms.endorsement_count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Details & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800 flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    {candidate.hourly_rate}/hr
                    <span className={`text-[10px] ml-1 font-medium ${candidate.budgetFit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ({candidate.budgetFit ? 'Within Budget' : 'Exceeds Target'})
                    </span>
                  </span>

                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {candidate.rating}
                  </span>
                </div>

                <button
                  onClick={() => onViewFreelancer(candidate.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                >
                  View Profile & Hire <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
