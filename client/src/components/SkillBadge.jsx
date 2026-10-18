import React from 'react';
import { Award, CheckCircle2, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function SkillBadge({ status, score, endorsementCount, level, onClick }) {
  const getLevelTier = (lvl) => {
    switch (lvl) {
      case 'Expert':
        return { label: 'Lvl 4 Master', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' };
      case 'Advanced':
        return { label: 'Lvl 3 Adept', color: 'border-violet-500/40 bg-violet-500/10 text-violet-300' };
      case 'Intermediate':
        return { label: 'Lvl 2 Skilled', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' };
      default:
        return { label: 'Lvl 1 Novice', color: 'border-slate-500/40 bg-slate-500/10 text-slate-300' };
    }
  };

  const tier = getLevelTier(level);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* RPG Level Tag */}
      {level && (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${tier.color}`}>
          {tier.label}
        </span>
      )}

      {/* Verification Status (Credly / HackerRank / LinkedIn Style) */}
      {status === 'Assessed' && (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer shadow-xs glow-emerald"
          title="Click to view Credly Verifiable Credential"
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>Assessed {score ? `(${Math.round(score)}%)` : ''}</span>
        </button>
      )}

      {status === 'Endorsed' && (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:border-violet-400 transition-all cursor-pointer shadow-xs glow-purple"
          title="Click to view Endorsements"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
          <span>Endorsed {endorsementCount > 0 ? `+${endorsementCount}` : ''}</span>
        </button>
      )}

      {status === 'Pending' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-amber-300/80 bg-amber-500/10 border border-amber-500/20">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Unverified</span>
        </span>
      )}

      {status === 'Flagged' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>Under Review</span>
        </span>
      )}
    </div>
  );
}
