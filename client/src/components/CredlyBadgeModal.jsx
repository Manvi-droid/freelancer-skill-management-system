import React from 'react';
import { ShieldCheck, Award, CheckCircle2, Copy, Check, ExternalLink, X, Calendar, Lock } from 'lucide-react';

export default function CredlyBadgeModal({ isOpen, onClose, skill, freelancer }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !skill) return null;

  const credentialId = `FSMS-${skill.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}-${new Date().getFullYear()}`;

  const copyCredId = () => {
    navigator.clipboard.writeText(credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-gray-900">
        
        {/* Google 4-color top accent stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1A73E8] via-[#EA4335] via-[#FBBC04] to-[#34A853] absolute top-0 left-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Credly Accredited Header */}
        <div className="flex items-center gap-2 mb-6 pt-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-700 font-bold">
            Credly / Google Skills Verified Digital Credential
          </span>
        </div>

        {/* Hexagonal Holographic Seal */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative group">
            <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-1 hexagon flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-white hexagon flex flex-col items-center justify-center p-3 text-center">
                <Award className="w-9 h-9 text-blue-600 mb-1" />
                <span className="text-[9px] font-mono font-bold tracking-wider text-gray-800 uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
            {/* Holographic badge ring */}
            <div className="absolute inset-0 border border-blue-400/30 rounded-full scale-125 pointer-events-none animate-pulse"></div>
          </div>

          <h2 className="text-xl font-black text-gray-900 mt-4 text-center tracking-tight font-sans">
            {skill.skill_name}
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mt-1">
            Competency Tier: {skill.proficiency_level || 'Expert'}
          </span>
        </div>

        {/* Credential Attributes */}
        <div className="bg-[#F8F9FA] rounded-2xl border border-gray-200 p-4 space-y-2.5 my-5 text-xs font-sans">
          <div className="flex justify-between items-center py-1 border-b border-gray-200">
            <span className="text-gray-500">Awarded To:</span>
            <span className="font-bold text-gray-900">{freelancer?.full_name || 'Riya Kapoor'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-200">
            <span className="text-gray-500">Verification Engine:</span>
            <span className="font-mono text-blue-700 font-medium">HackerRank Timed Auto-Score (SRS P4)</span>
          </div>

          {skill.assessment_score && (
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="text-gray-500">Assessment Score:</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">{skill.assessment_score}% (Passed)</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-gray-200">
            <span className="text-gray-500">Peer & Client Endorsements:</span>
            <span className="font-bold text-purple-700 font-mono">+{skill.endorsement_count || 0} Endorsements</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Verification Hash:</span>
            <button
              onClick={copyCredId}
              className="flex items-center gap-1 font-mono text-[11px] text-gray-700 hover:text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-300 transition-colors"
            >
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>{credentialId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600 ml-1" /> : <Copy className="w-3 h-3 text-gray-400 ml-1" />}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-gray-400 font-mono">
            Signed by FSMS Trust Anchor
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
