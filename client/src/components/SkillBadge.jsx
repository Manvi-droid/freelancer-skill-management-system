import React from 'react';
import { Award, CheckCircle2, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function SkillBadge({ status, score, endorsementCount, level, onClick }) {
  const getLevelTier = (lvl) => {
    switch (lvl) {
      case 'Expert':
        return { label: 'Lvl 4 Master', color: 'border-amber-200 bg-amber-50 text-amber-800' };
      case 'Advanced':
        return { label: 'Lvl 3 Adept', color: 'border-blue-200 bg-blue-50 text-blue-800' };
      case 'Intermediate':
        return { label: 'Lvl 2 Skilled', color: 'border-teal-200 bg-teal-50 text-teal-800' };
      default:
        return { label: 'Lvl 1 Novice', color: 'border-gray-200 bg-gray-50 text-gray-700' };
    }
  };

  const tier = getLevelTier(level);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Competency Level Tag */}
      {level && (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${tier.color}`}>
          {tier.label}
        </span>
      )}

      {/* Verification Status (Google Skills / Credly Style) */}
      {status === 'Assessed' && (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
          title="Click to view Credly Verifiable Credential"
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Assessed {score ? `(${Math.round(score)}%)` : ''}</span>
        </button>
      )}

      {status === 'Endorsed' && (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-xs"
          title="Click to view Endorsements"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Endorsed {endorsementCount > 0 ? `+${endorsementCount}` : ''}</span>
        </button>
      )}

      {status === 'Pending' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Unverified</span>
        </span>
      )}

      {status === 'Flagged' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono text-red-800 bg-red-50 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>Under Review</span>
        </span>
      )}
    </div>
  );
}
