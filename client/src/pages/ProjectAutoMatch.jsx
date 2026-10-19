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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 font-medium ml-1">Algorithmic Recommendation Engine — SRS F7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Project Auto-Match & Candidate Ranking
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Calculates weighted multi-variable match scores across competency depth, Credly verified credentials, and budget constraints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Project Requirements Builder */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 text-sm">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" /> Project Criteria Builder
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Configure required skill levels and budget ceiling</p>
          </div>

          <form onSubmit={runAutoMatch} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Project Scope / Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Real-Time Analytics Dashboard"
                required
              />
            </div>

            {/* Select Required Skills */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
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
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {skill}
                    </button>
                  );
                })}
              </div>

              {/* Selected skills level customizer */}
              {selectedSkills.length > 0 && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">
                    Required Proficiency Tiers:
                  </span>
                  {selectedSkills.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{s.name}</span>
                      <select
                        value={s.level}
                        onChange={(e) => updateSkillLevel(s.name, e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-0.5 text-xs text-gray-900"
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
                <label className="font-medium text-gray-700">Max Hourly Rate</label>
                <span className="font-medium text-amber-600">${maxBudget}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Checkbox for Must be Verified */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={mustBeVerified}
                onChange={(e) => setMustBeVerified(e.target.checked)}
                className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="verifiedOnly" className="text-gray-700 cursor-pointer">
                Require Verified Status (Credly / Endorsed)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || selectedSkills.length === 0}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Computing Match Recommendations...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Execute Smart Match Algorithm (F7)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Ranked Recommendations */}
        <div className="lg:col-span-7 space-y-4 text-sm">
          <div className="flex items-center justify-between text-gray-500 px-1">
            <span className="font-semibold text-gray-900">
              {results ? `${results.rankedFreelancers?.length} Ranked Candidate(s)` : 'Awaiting Match Execution'}
            </span>
            {results && (
              <span className="text-green-600 font-medium">
                Algorithm Execution: {results.responseTimeMs}ms
              </span>
            )}
          </div>

          {!results && !loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Automated Candidate Ranking</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                Configure your required skills on the left and execute the algorithm to get an instant ranked recommendation list.
              </p>
              <button
                onClick={() => runAutoMatch()}
                className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors border border-gray-200"
              >
                Match with Default Requirements
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="font-medium text-gray-600">Evaluating candidate competency depth and test percentiles...</p>
            </div>
          )}

          {results && results.rankedFreelancers?.map((candidate, idx) => (
            <div
              key={candidate.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                idx === 0
                  ? 'border-amber-300 shadow-md'
                  : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={candidate.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + candidate.full_name}
                      alt={candidate.full_name}
                      className="w-14 h-14 rounded-xl border border-gray-200 object-cover shadow-sm"
                    />
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-white text-amber-600 font-bold text-xs flex items-center justify-center border border-amber-200 shadow-sm">
                      #{idx + 1}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-base tracking-tight">{candidate.full_name}</h3>
                      {idx === 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" /> Optimal Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{candidate.title}</p>
                  </div>
                </div>

                {/* Match Score Badge & Progress Bar */}
                <div className="sm:text-right min-w-[140px]">
                  <div className="flex items-center sm:justify-end gap-1.5 mb-1">
                    <span className="text-gray-500">Match:</span>
                    <span className="text-xl font-bold text-amber-600">{candidate.matchScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        candidate.matchScore >= 80 ? 'bg-green-500' : candidate.matchScore >= 50 ? 'bg-amber-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${candidate.matchScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Matched Skills Breakdown */}
              <div className="py-3.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-2">
                  Skill Coverage ({candidate.matchedSkillsCount} / {candidate.totalRequiredSkills})
                </span>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkillDetails.map(ms => (
                    <div
                      key={ms.skill_name}
                      className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs flex items-center gap-2"
                    >
                      <span className="font-medium text-gray-900">{ms.skill_name}</span>
                      <span className="text-gray-400">({ms.proficiency_level})</span>
                      {ms.status === 'Assessed' && (
                        <span className="text-xs font-medium px-1.5 rounded bg-green-100 text-green-700 flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Assessed {ms.assessment_score}%
                        </span>
                      )}
                      {ms.status === 'Endorsed' && (
                        <span className="text-xs font-medium px-1.5 rounded bg-blue-100 text-blue-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Endorsed +{ms.endorsement_count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Details & Action */}
              <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900 flex items-center gap-0.5">
                    <span className="text-green-600">${candidate.hourly_rate}</span>/hr
                    <span className={`text-xs ml-1.5 ${candidate.budgetFit ? 'text-green-600' : 'text-red-500'}`}>
                      ({candidate.budgetFit ? 'Within Budget' : 'Exceeds Target'})
                    </span>
                  </span>

                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {candidate.rating}
                  </span>
                </div>

                <button
                  onClick={() => onViewFreelancer(candidate.id)}
                  className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 font-medium transition-colors flex items-center gap-1.5 border border-gray-200 hover:border-blue-600 shadow-sm"
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
