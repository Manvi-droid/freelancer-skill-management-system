import React, { useState, useEffect } from 'react';
import SkillBadge from '../components/SkillBadge';
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
  RotateCcw
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
    }, 200);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-1">
            SRS Use Case U1 (Section 3.3.1)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Search & Filter Freelancers</h1>
          <p className="text-xs text-slate-600">Find vetted talent based on verified competencies, peer endorsements, and test scores.</p>
        </div>

        {/* Benchmark badge for SRS P1 (Response time < 2 seconds) */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-mono shadow-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Latency: <strong className="text-emerald-400">{responseTimeMs}ms</strong></span>
          <span className="text-slate-400 text-[10px]">(P1 Target: &lt;2000ms)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" /> Filter Criteria
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keyword / Skill</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, React, AWS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skill Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white font-medium"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Competency Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Competency Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white font-medium"
            >
              {levels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Verification Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white font-medium"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <label className="font-bold text-slate-700">Minimum Rating</label>
              <span className="font-bold text-amber-600">{minRating > 0 ? `${minRating} ★` : 'Any'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Max Hourly Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <label className="font-bold text-slate-700">Max Hourly Rate</label>
              <span className="font-bold text-indigo-600">${maxRate}/hr</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={maxRate}
              onChange={(e) => setMaxRate(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sort Results By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white font-medium"
            >
              <option value="rating">Rating (Highest First)</option>
              <option value="skills_count">Most Verified Skills</option>
              <option value="rate_asc">Rate: Low to High</option>
              <option value="rate_desc">Rate: High to Low</option>
            </select>
          </div>
        </div>

        {/* Right Results Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-800">{freelancers.length}</strong> matching candidate(s)</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Searching database...</div>
          ) : freelancers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">No freelancers match your criteria</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                {emptyMessage || 'Try adjusting the minimum rating or clearing filters to see more profiles.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancers.map(freelancer => (
                <div
                  key={freelancer.id}
                  className="bg-white rounded-2xl border-2 border-slate-900/80 hover:border-indigo-600 transition-all p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Rating */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={freelancer.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + freelancer.full_name}
                          alt={freelancer.full_name}
                          className="w-12 h-12 rounded-full border-2 border-slate-800 object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{freelancer.full_name}</h3>
                          <p className="text-xs font-medium text-indigo-600">{freelancer.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {freelancer.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 flex items-center gap-0.5 justify-end">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                          <span>{freelancer.hourly_rate}</span>
                          <span className="text-[10px] text-slate-400 font-normal">/hr</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-end mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{freelancer.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {freelancer.bio}
                    </p>

                    {/* Skills pills */}
                    <div className="mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Key Competencies ({freelancer.skills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {freelancer.skills?.slice(0, 4).map(s => (
                          <span
                            key={s.id}
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                              s.status === 'Assessed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : s.status === 'Endorsed'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {s.skill_name}
                            {s.status === 'Assessed' && <Award className="w-3 h-3 text-emerald-600" />}
                            {s.status === 'Endorsed' && <CheckCircle className="w-3 h-3 text-blue-600" />}
                          </span>
                        ))}
                        {freelancer.skills?.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{freelancer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button: View Profile & Endorse */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {freelancer.assessed_skills_count || 0} Assessed • {freelancer.endorsed_skills_count || 0} Endorsed
                    </span>
                    <button
                      onClick={() => onViewFreelancer(freelancer.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                    >
                      View & Endorse <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
