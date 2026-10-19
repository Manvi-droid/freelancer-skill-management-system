import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Trash2, ShieldCheck, AlertTriangle, X, Check } from 'lucide-react';

export default function GdprModal({ isOpen, onClose }) {
  const { user, token, logout } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleExportData = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/profiles/gdpr/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to export data');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fsms_gdpr_data_${user?.username || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMessage({ type: 'success', text: 'Data package downloaded successfully!' });
      setDownloading(false);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/profiles/gdpr/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      alert(data.message);
      logout();
      onClose();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setDeleting(false);
    }
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

        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pt-1">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900 font-sans">
            GDPR Data Portability & Privacy (SRS S6)
          </h2>
        </div>

        <p className="text-xs text-gray-600 mb-6 leading-relaxed font-sans">
          In full compliance with <strong>GDPR Article 20</strong> (Right to Data Portability) and <strong>Article 17</strong> (Right to be Forgotten), you have full sovereignty over your freelance skills, assessments, endorsements, and portfolio evidence.
        </p>

        {statusMessage && (
          <div
            className={`p-3 rounded-2xl mb-4 text-xs font-sans flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Option 1: Data Export */}
        <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-xs">Download Full Profile Archive</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Machine-readable JSON bundle of all skill data.</p>
          </div>
          <button
            onClick={handleExportData}
            disabled={downloading}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Export JSON'}</span>
          </button>
        </div>

        {/* Option 2: Right to be forgotten */}
        <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 text-xs">
          <h3 className="font-bold text-red-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Right to be Forgotten (Account Purge)
          </h3>
          <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
            Permanently purges your account, evidence files, test scores, and endorsement links with cascade deletion per SRS 5.3.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-3 px-3.5 py-1.5 rounded-full border border-red-300 bg-white text-red-700 font-bold hover:bg-red-50 transition-colors text-xs"
            >
              Initiate Account Purge
            </button>
          ) : (
            <div className="mt-3 p-3 bg-white rounded-xl border border-red-200 space-y-2">
              <p className="font-bold text-red-700 text-[11px]">
                Are you absolutely sure? This action is irreversible.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  {deleting ? 'Purging...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
