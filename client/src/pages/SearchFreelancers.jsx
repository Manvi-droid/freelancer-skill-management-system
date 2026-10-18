import React, { useState, useEffect } from 'react';
import SkillBadge from '../components/SkillBadge';
import CredlyBadgeModal from '../components/CredlyBadgeModal';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  Award, 
  Sparkles, 
  ArrowRight,
  Clock,
  RotateCcw,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function SearchFreelancers({ onViewFreelancer }) {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [maxRate, setMaxRate] = useState(150);
  const [sortBy, setSortBy] = useState('rating');
  const [responseTimeMs, setResponseTimeMs] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState(null);
  const [selectedCredlySkill, setSelectedCredlySkill] = useState(null);
  const [activeFreelancerForCredly, setActiveFreelancerForCredly] = useState(null);

  const categories = [
    'All',
    'Web Development',
    'Cloud & DevOps',
    'AI & Data Science',
    'Mobile App Development',
    'UI/UX Design',
    'Cybersecurity & Backend',
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const statuses = ['All', 'Assessed', 'Endorsed'];

  const executeSearch = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedLevel !== 'All') params.append('level', selectedLevel);
    if (selectedStatus !== 'All') params.append('status', selectedStatus);
    if (minRating > 0) params.append('minRating', minRating);
    if (maxRate < 150) params.append('maxRate', maxRate);
    if (sortBy) params.append('sortBy', sortBy);

    fetch(`/api/search/freelancers?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setFreelancers(data.freelancers || []);
        setResponseTimeMs(data.responseTimeMs || 10);
        setEmptyMessage(data.emptyMessage);
        setLoading(false);
      })
      .catch(err => {
        console.error('Search error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, selectedStatus, minRating, maxRate, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedStatus('All');
    setMinRating(0);
    setMaxRate(150);
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
            Contra & Toptal Style Talent Market (SRS Use Case U1)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-400" />
            Verified Skill Search & Discovery
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Filter elite independent contractors by Credly verified competencies, peer endorsements, and test percentiles.</p>
        </div>

        {/* Benchmark badge for SRS P1 */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-2xl text-xs font-mono shadow-md glow-cyan">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Search Engine Latency: <strong className="text-emerald-400">{responseTimeMs}ms</strong></span>
          <span className="text-slate-500 text-[10px]">(SRS P1 &lt;2000ms)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Linear & Stripe Style) */}
        <div className="lg:col-span-1 space-y-5 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl h-fit font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" /> Multi-Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Search Keywords / Skill</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="React, TypeScript, Python..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Skill Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Competency Level */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Competency Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {levels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Verification Badge Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-300">Minimum Rating</label>
              <span className="font-bold text-amber-400">{minRating > 0 ? `${minRating} ★` : 'Any'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Max Hourly Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-300">Hourly Rate Ceiling</label>
              <span className="font-bold text-emerald-400">${maxRate}/hr</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={maxRate}
              onChange={(e) => setMaxRate(parseInt(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Sort Candidates By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="rating">Top Rated (Highest First)</option>
              <option value="skills_count">Most Verified Badges</option>
              <option value="rate_asc">Rate: Low to High</option>
              <option value="rate_desc">Rate: High to Low</option>
            </select>
          </div>
        </div>

        {/* Right Results Grid (Contra / Toptal Style Cards) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Found <strong className="text-white">{freelancers.length}</strong> verified specialist(s)</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500 font-mono">Querying talent index...</div>
          ) : freelancers.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/90 rounded-3xl border border-slate-800">
              <p className="text-sm font-bold text-white mb-2">No matching specialists found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                {emptyMessage || 'Try relaxing filter criteria or lowering the minimum rating threshold.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-mono font-bold hover:bg-violet-500 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancers.map(freelancer => (
                <div
                  key={freelancer.id}
                  className="bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all p-6 shadow-xl flex flex-col justify-between group hover:glow-cyan"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Rate */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={freelancer.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + freelancer.full_name}
                            alt={freelancer.full_name}
                            className="w-14 h-14 rounded-2xl border border-slate-700 object-cover shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base tracking-tight group-hover:text-cyan-300 transition-colors">
                            {freelancer.full_name}
                          </h3>
                          <p className="text-xs font-mono text-cyan-400">{freelancer.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-600" /> {freelancer.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-base font-black text-white flex items-center justify-end">
                          <span className="text-emerald-400">${freelancer.hourly_rate}</span>
                          <span className="text-[10px] text-slate-500 font-normal ml-0.5">/hr</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold justify-end mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{freelancer.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {freelancer.bio}
                    </p>

                    {/* Skills pills */}
                    <div className="mb-4">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Verified Credentials ({freelancer.skills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {freelancer.skills?.slice(0, 4).map(s => (
                          <SkillBadge
                            key={s.id}
                            status={s.status}
                            score={s.assessment_score}
                            endorsementCount={s.endorsement_count}
                            level={s.proficiency_level}
                            onClick={() => {
                              setSelectedCredlySkill(s);
                              setActiveFreelancerForCredly(freelancer);
                            }}
                          />
                        ))}
                        {freelancer.skills?.length > 4 && (
                          <span className="text-[10px] font-mono text-slate-500 self-center">
                            +{freelancer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button: View Profile & Endorse */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 text-[11px]">
                      {freelancer.assessed_skills_count || 0} Assessed • {freelancer.endorsed_skills_count || 0} Endorsed
                    </span>
                    <button
                      onClick={() => onViewFreelancer(freelancer.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      View & Endorse <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credly Badge Modal */}
      <CredlyBadgeModal
        isOpen={Boolean(selectedCredlySkill)}
        onClose={() => setSelectedCredlySkill(null)}
        skill={selectedCredlySkill}
        freelancer={activeFreelancerForCredly}
      />
    </div>
  );
}
