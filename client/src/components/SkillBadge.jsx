import React from 'react';
import { CheckCircle2, Award, Clock, AlertTriangle } from 'lucide-react';

export default function SkillBadge({ status, score, endorsementCount, level }) {
  const getStatusBadge = () => {
    switch (status) {
      case 'Assessed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            Assessed {score ? `(${Math.round(score)}%)` : ''}
          </span>
        );
      case 'Endorsed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Endorsed {endorsementCount > 0 ? `+${endorsementCount}` : ''}
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Verification
          </span>
        );
    }
  };

  const getLevelBadge = () => {
    const colors = {
      Beginner: 'bg-slate-100 text-slate-700 border-slate-200',
      Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
      Expert: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${colors[level] || colors.Intermediate}`}>
        {level || 'Intermediate'}
      </span>
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {level && getLevelBadge()}
      {getStatusBadge()}
    </div>
  );
}
