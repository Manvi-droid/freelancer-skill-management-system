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
    return <div className="py-20 text-center text-sm text-gray-400">Loading specialist profile...</div>;
  }

  if (!profileData || !profileData.freelancer) {
    return (
      <div className="py-20 text-center text-gray-700">
        <p className="text-base font-semibold mb-3">Freelancer profile not found</p>
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">
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
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Talent Market
      </button>

      {/* Alert Notification */}
      {notificationMsg && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm ${
            notificationMsg.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)}>
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
        {/* Google 4-color accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-blue-500"></div>
          <div className="flex-1 bg-red-500"></div>
          <div className="flex-1 bg-yellow-500"></div>
          <div className="flex-1 bg-green-500"></div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-gray-100 mt-2">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={freelancer.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + freelancer.full_name}
                alt={freelancer.full_name}
                className="w-24 h-24 rounded-2xl border border-gray-200 object-cover shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{freelancer.full_name}</h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  TOP 1% VERIFIED
                </span>
              </div>
              <p className="text-sm font-medium text-blue-600 mt-1">{freelancer.title}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {freelancer.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {freelancer.rating} ({freelancer.reviews_count} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-end gap-0.5">
              <span className="text-green-600">${freelancer.hourly_rate}</span>
              <span className="text-sm text-gray-400 font-normal">/hr</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">Available for new contracts</div>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Specialist Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{freelancer.bio}</p>
        </div>
      </div>

      {/* Cataloged Skills & Endorsements Section (SRS Use Case U2) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Verified Competencies & Credentials
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Peer recommendations and Credly-accredited digital badges.
          </p>
        </div>

        <div className="space-y-4">
          {skills.map(skill => {
            const endorsements = skillEndorsements[skill.id] || [];

            return (
              <div
                key={skill.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-semibold text-gray-900 tracking-tight">{skill.skill_name}</span>
                      <span className="text-sm text-gray-400">({skill.category_name})</span>
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
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Endorse Competency
                    </button>
                  )}
                </div>

                {/* Evidence Documents associated with this skill */}
                {skill.evidence && skill.evidence.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 block mb-2 uppercase tracking-wider">
                      Verified Artifacts & Certificates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {skill.evidence.map(ev => (
                        <a
                          key={ev.id}
                          href={ev.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50 text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                          <span>{ev.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* LinkedIn-Style Endorsement List & Testimonial Quotes */}
                {endorsements.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 block mb-2 uppercase tracking-wider">
                      Client & Colleague Endorsements ({endorsements.length}):
                    </span>
                    <div className="space-y-2.5">
                      {endorsements.map(end => (
                        <div key={end.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-medium text-gray-900 flex items-center gap-2">
                              {end.endorser_name}{' '}
                              <span className="text-xs text-blue-600 font-medium uppercase px-2 py-0.2 rounded-full bg-blue-50 border border-blue-100">
                                {end.endorser_role}
                              </span>
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(end.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 italic leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  Endorse {freelancer.full_name} for {endorsingSkill.skill_name}
                </h3>
                <p className="text-xs text-blue-600 mt-0.5">SRS Use Case U2 (Section 3.3.2)</p>
              </div>
              <button onClick={() => setEndorsingSkill(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEndorseSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Proficiency Testimonial (Optional)
                </label>
                <textarea
                  rows="3"
                  value={endorsementComment}
                  onChange={(e) => setEndorsementComment(e.target.value)}
                  placeholder="e.g. Exceptional architecture skills, delivered flawless performance under load."
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
                <span className="text-xs text-gray-400 block mt-1">
                  If you already endorsed this skill, submitting updates your previous comment.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEndorsingSkill(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm text-sm flex items-center gap-2"
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
