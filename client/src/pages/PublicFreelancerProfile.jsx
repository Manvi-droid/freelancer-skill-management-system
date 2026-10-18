import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import CredlyBadgeModal from '../components/CredlyBadgeModal';
import { 
  CheckCircle2, 
  Award, 
  Star, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  X, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
  Lock,
  ThumbsUp
} from 'lucide-react';

export default function PublicFreelancerProfile({ freelancerId, onBack }) {
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endorsingSkill, setEndorsingSkill] = useState(null);
  const [endorsementComment, setEndorsementComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);
  const [skillEndorsements, setSkillEndorsements] = useState({});
  const [selectedCredlySkill, setSelectedCredlySkill] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    fetch(`/api/profiles/freelancers/${freelancerId}`)
      .then(res => res.json())
      .then(data => {
        setProfileData(data);
        setLoading(false);
        // Also fetch endorsements for each skill
        data.skills?.forEach(skill => {
          fetch(`/api/endorsements/skill/${skill.id}`)
            .then(r => r.json())
            .then(resData => {
              setSkillEndorsements(prev => ({
                ...prev,
                [skill.id]: resData.endorsements || [],
              }));
            });
        });
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (freelancerId) {
      fetchProfile();
    }
  }, [freelancerId]);

  // Handle Endorse Skill (SRS Use Case U2)
  const handleEndorseSubmit = async (e) => {
    e.preventDefault();
    if (!endorsingSkill) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/endorsements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          freelancer_skill_id: endorsingSkill.id,
          comment: endorsementComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit endorsement');

      setNotificationMsg({
        type: 'success',
        text: data.message,
      });

      setEndorsingSkill(null);
      setEndorsementComment('');
      setSubmitting(false);
      fetchProfile();
    } catch (err) {
      setNotificationMsg({ type: 'error', text: err.message });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading specialist profile...</div>;
  }

  if (!profileData || !profileData.freelancer) {
    return (
      <div className="py-20 text-center text-slate-200">
        <p className="text-sm font-bold mb-3 font-mono">Freelancer profile not found</p>
        <button onClick={onBack} className="text-xs text-cyan-400 font-mono hover:underline">
          Return to Talent Market
        </button>
      </div>
    );
  }

  const { freelancer, skills = [] } = profileData;
  const isOwnProfile = user?.id === freelancer.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Talent Market
      </button>

      {/* Alert Notification */}
      {notificationMsg && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-xs font-mono ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Main Profile Header Card (Toptal & Contra Style) */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={freelancer.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + freelancer.full_name}
                alt={freelancer.full_name}
                className="w-24 h-24 rounded-3xl border-2 border-slate-700 object-cover shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{freelancer.full_name}</h1>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  TOP 1% VERIFIED
                </span>
              </div>
              <p className="text-sm font-mono font-semibold text-cyan-400 mt-1">{freelancer.title}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 font-mono mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {freelancer.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {freelancer.rating} ({freelancer.reviews_count} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right font-mono">
            <div className="text-3xl font-black text-white flex items-center justify-center sm:justify-end gap-0.5">
              <span className="text-emerald-400">${freelancer.hourly_rate}</span>
              <span className="text-xs text-slate-500 font-normal">/hr</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Available for new contracts</div>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">Specialist Summary</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{freelancer.bio}</p>
        </div>
      </div>

      {/* Cataloged Skills & LinkedIn-Style Endorsements Section (SRS Use Case U2) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Verified Competencies & Credentials
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Peer recommendations and Credly-accredited digital badges.
          </p>
        </div>

        <div className="space-y-4">
          {skills.map(skill => {
            const endorsements = skillEndorsements[skill.id] || [];

            return (
              <div
                key={skill.id}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-bold text-white tracking-tight">{skill.skill_name}</span>
                      <span className="text-xs font-mono text-slate-500">({skill.category_name})</span>
                    </div>
                    <div className="mt-2">
                      <SkillBadge
                        status={skill.status}
                        score={skill.assessment_score}
                        endorsementCount={skill.endorsement_count}
                        level={skill.proficiency_level}
                        onClick={() => setSelectedCredlySkill(skill)}
                      />
                    </div>
                  </div>

                  {/* Endorse Skill Button (SRS U2) */}
                  {!isOwnProfile && (
                    <button
                      onClick={() => setEndorsingSkill(skill)}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto glow-purple"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Endorse Competency (U2)
                    </button>
                  )}
                </div>

                {/* Evidence Documents associated with this skill */}
                {skill.evidence && skill.evidence.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                      Verified Artifacts & Certificates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {skill.evidence.map(ev => (
                        <a
                          key={ev.id}
                          href={ev.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 text-xs font-mono font-medium text-slate-200 flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>{ev.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* LinkedIn-Style Endorsement List & Testimonial Quotes */}
                {endorsements.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                      Client & Colleague Endorsements ({endorsements.length}):
                    </span>
                    <div className="space-y-2.5">
                      {endorsements.map(end => (
                        <div key={end.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-white flex items-center gap-2">
                              {end.endorser_name}{' '}
                              <span className="text-[10px] text-cyan-400 font-semibold uppercase px-2 py-0.2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                {end.endorser_role}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(end.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300 italic font-sans leading-relaxed">
                            "{end.comment || 'Verified skill proficiency and high technical craftsmanship.'}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Credly Badge Modal */}
      <CredlyBadgeModal
        isOpen={Boolean(selectedCredlySkill)}
        onClose={() => setSelectedCredlySkill(null)}
        skill={selectedCredlySkill}
        freelancer={freelancer}
      />

      {/* Endorse Modal (SRS Use Case U2) */}
      {endorsingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  Endorse {freelancer.full_name} for {endorsingSkill.skill_name}
                </h3>
                <p className="text-[11px] font-mono text-cyan-400 mt-0.5">SRS Use Case U2 (Section 3.3.2)</p>
              </div>
              <button onClick={() => setEndorsingSkill(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEndorseSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Proficiency Testimonial (Optional - SRS U2)
                </label>
                <textarea
                  rows="3"
                  value={endorsementComment}
                  onChange={(e) => setEndorsementComment(e.target.value)}
                  placeholder="e.g. Exceptional architecture skills, delivered flawless performance under load."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:ring-1 focus:ring-violet-500"
                ></textarea>
                <span className="text-[10px] text-slate-500 block mt-1">
                  If you already endorsed this skill, submitting updates your previous comment (SRS U2 Alt Flow).
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEndorsingSkill(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Confirm Endorsement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
