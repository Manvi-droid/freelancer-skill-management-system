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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 font-medium ml-1">Talent Market — Use Case U1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Verified Skill Search & Discovery
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Filter independent contractors by Credly verified competencies, peer endorsements, and test percentiles.</p>
        </div>

        {/* Benchmark badge for SRS P1 */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm shadow-sm">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Search Latency: <strong className="text-green-600">{responseTimeMs}ms</strong></span>
          <span className="text-gray-400 text-xs">(SRS P1 &lt;2000ms)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" /> Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Search Keywords / Skill</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="React, TypeScript, Python..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Skill Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Competency Level */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Competency Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 text-sm"
            >
              {levels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Verification Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 text-sm"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-gray-700 text-sm">Minimum Rating</label>
              <span className="font-medium text-amber-600 text-sm">{minRating > 0 ? `${minRating} ★` : 'Any'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Max Hourly Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-gray-700 text-sm">Hourly Rate Ceiling</label>
              <span className="font-medium text-green-600 text-sm">${maxRate}/hr</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={maxRate}
              onChange={(e) => setMaxRate(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-medium text-gray-700 mb-1 text-sm">Sort Candidates By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 text-sm"
            >
              <option value="rating">Top Rated (Highest First)</option>
              <option value="skills_count">Most Verified Badges</option>
              <option value="rate_asc">Rate: Low to High</option>
              <option value="rate_desc">Rate: High to Low</option>
            </select>
          </div>
        </div>

        {/* Right Results Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 px-1">
            <span>Found <strong className="text-gray-900">{freelancers.length}</strong> verified specialist(s)</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">Querying talent index...</div>
          ) : freelancers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
              <p className="text-base font-semibold text-gray-900 mb-2">No matching specialists found</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
                {emptyMessage || 'Try relaxing filter criteria or lowering the minimum rating threshold.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancers.map(freelancer => (
                <div
                  key={freelancer.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all p-6 shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Rate */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={freelancer.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + freelancer.full_name}
                            alt={freelancer.full_name}
                            className="w-14 h-14 rounded-xl border border-gray-200 object-cover shadow-sm"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 text-base tracking-tight group-hover:text-blue-600 transition-colors">
                            {freelancer.full_name}
                          </h3>
                          <p className="text-xs text-blue-600 font-medium">{freelancer.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" /> {freelancer.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-gray-900 flex items-center justify-end">
                          <span className="text-green-600">${freelancer.hourly_rate}</span>
                          <span className="text-xs text-gray-400 font-normal ml-0.5">/hr</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold justify-end mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{freelancer.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {freelancer.bio}
                    </p>

                    {/* Skills pills */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
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
                          <span className="text-xs text-gray-400 self-center">
                            +{freelancer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-400 text-xs">
                      {freelancer.assessed_skills_count || 0} Assessed • {freelancer.endorsed_skills_count || 0} Endorsed
                    </span>
                    <button
                      onClick={() => onViewFreelancer(freelancer.id)}
                      className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-700 font-medium transition-all flex items-center gap-1.5 border border-gray-200 hover:border-blue-600 shadow-sm text-sm"
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
