import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
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
  Check
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
    return <div className="py-20 text-center text-xs text-slate-400">Loading profile...</div>;
  }

  if (!profileData || !profileData.freelancer) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold text-slate-700">Freelancer profile not found</p>
        <button onClick={onBack} className="mt-3 text-xs text-indigo-600 font-semibold hover:underline">
          Return to Search
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
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Search / List
      </button>

      {/* Alert Notification */}
      {notificationMsg && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-xs ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-900/80 p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img
              src={freelancer.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + freelancer.full_name}
              alt={freelancer.full_name}
              className="w-20 h-20 rounded-full border-2 border-slate-800 object-cover shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{freelancer.full_name}</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Verified Talent
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">{freelancer.title}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {freelancer.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {freelancer.rating} ({freelancer.reviews_count} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-end gap-0.5">
              <DollarSign className="w-5 h-5 text-slate-500" />
              <span>{freelancer.hourly_rate}</span>
              <span className="text-xs text-slate-400 font-normal">/hr</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Available for new contracts</div>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About Specialist</h3>
          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">{freelancer.bio}</p>
        </div>
      </div>

      {/* Cataloged Skills & Endorsement Section (SRS Use Case U2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Verified Competencies & Endorsements
            </h2>
            <p className="text-xs text-slate-500">
              Peers and hiring clients can review credentials and submit recommendations (SRS Use Case U2).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {skills.map(skill => {
            const endorsements = skillEndorsements[skill.id] || [];

            return (
              <div
                key={skill.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{skill.skill_name}</span>
                      <span className="text-xs text-slate-400">({skill.category_name})</span>
                    </div>
                    <div className="mt-1">
                      <SkillBadge
                        status={skill.status}
                        score={skill.assessment_score}
                        endorsementCount={skill.endorsement_count}
                        level={skill.proficiency_level}
                      />
                    </div>
                  </div>

                  {/* Endorse Skill Button (SRS U2) */}
                  {!isOwnProfile && (
                    <button
                      onClick={() => setEndorsingSkill(skill)}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Endorse Skill (U2)
                    </button>
                  )}
                </div>

                {/* Evidence Documents associated with this skill */}
                {skill.evidence && skill.evidence.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">Supporting Proof & Evidence:</span>
                    <div className="flex flex-wrap gap-2">
                      {skill.evidence.map(ev => (
                        <a
                          key={ev.id}
                          href={ev.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-800 flex items-center gap-1.5 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ev.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Endorsement list & comments */}
                {endorsements.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">
                      Client & Peer Recommendations ({endorsements.length}):
                    </span>
                    <div className="space-y-2">
                      {endorsements.map(end => (
                        <div key={end.id} className="p-3 rounded-xl bg-slate-50/70 text-xs border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">
                              {end.endorser_name}{' '}
                              <span className="text-[10px] text-slate-400 font-normal capitalize">
                                ({end.endorser_role})
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(end.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 italic">"{end.comment || 'Verified skill proficiency.'}"</p>
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

      {/* Endorse Modal (SRS Use Case U2) */}
      {endorsingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Endorse {freelancer.full_name} for {endorsingSkill.skill_name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">SRS Use Case U2 (Section 3.3.2)</p>
              </div>
              <button onClick={() => setEndorsingSkill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEndorseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proficiency Review & Comment (Optional - SRS U2 Flow 2)
                </label>
                <textarea
                  rows="3"
                  value={endorsementComment}
                  onChange={(e) => setEndorsementComment(e.target.value)}
                  placeholder="e.g. Demonstrated exceptional knowledge of state architecture and delivered clean code."
                  className="w-full text-xs rounded-xl border border-slate-300 p-3 font-medium focus:ring-2 focus:ring-indigo-500"
                ></textarea>
                <span className="text-[10px] text-slate-400 block mt-1">
                  If previously endorsed, submitting will update your recommendation (SRS U2 Alt Flow).
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEndorsingSkill(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Confirm Endorsement (U2)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
