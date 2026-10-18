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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100 glow-purple">
        {/* Background glow orb */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Credly Accredited Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
            Credly / Accredible Verified Digital Credential
          </span>
        </div>

        {/* Hexagonal Holographic Seal */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative group">
            <div className="w-28 h-28 bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-1 hexagon flex items-center justify-center shadow-xl shadow-violet-500/20">
              <div className="w-full h-full bg-slate-950 hexagon flex flex-col items-center justify-center p-3 text-center">
                <Award className="w-9 h-9 text-cyan-400 mb-1" />
                <span className="text-[9px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                  VERIFIED
                </span>
              </div>
            </div>
            {/* Holographic badge ring */}
            <div className="absolute inset-0 border border-cyan-400/40 rounded-full scale-125 pointer-events-none animate-pulse"></div>
          </div>

          <h2 className="text-xl font-black text-white mt-4 text-center tracking-tight">
            {skill.skill_name}
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mt-1">
            Proficiency Tier: {skill.proficiency_level || 'Expert'}
          </span>
        </div>

        {/* Credential Attributes */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 space-y-2.5 my-5 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Awarded To:</span>
            <span className="font-bold text-white">{freelancer?.full_name || 'Riya Kapoor'}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Verification Engine:</span>
            <span className="font-mono text-cyan-300 font-medium">HackerRank Timed Auto-Score (SRS P4)</span>
          </div>

          {skill.assessment_score && (
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Assessment Score:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{skill.assessment_score}% (Passed)</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Peer & Client Endorsements:</span>
            <span className="font-bold text-violet-300 font-mono">+{skill.endorsement_count || 0} Endorsements</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Verification Hash:</span>
            <button
              onClick={copyCredId}
              className="flex items-center gap-1 font-mono text-[11px] text-slate-300 hover:text-white bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>{credentialId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400 ml-1" /> : <Copy className="w-3 h-3 text-slate-400 ml-1" />}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Issued: {new Date().toLocaleDateString()}</span>
          </div>

          <button
            onClick={copyCredId}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            {copied ? 'Copied Verification Link' : 'Share Credential'}
          </button>
        </div>
      </div>
    </div>
  );
}
