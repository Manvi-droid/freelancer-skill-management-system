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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 text-slate-100 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-base">GDPR Privacy & Data Center</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3.5 rounded-2xl ${
            statusMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <div className="text-slate-400 font-sans leading-relaxed">
          <p>
            In compliance with <strong>GDPR Article 20 (Data Portability)</strong> and <strong>Article 17 (Right to be Forgotten)</strong>, you retain full ownership of your cataloged skills, verification records, and personal profile data.
          </p>
        </div>

        {/* Section 1: Export Data */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2.5">
          <h4 className="font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-violet-400" />
            Export My Data (JSON)
          </h4>
          <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
            Download a portable, machine-readable JSON archive containing all your skills, evidence records, endorsements received, assessment scores, and notification logs.
          </p>
          <button
            onClick={handleExportData}
            disabled={downloading}
            className="mt-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-colors flex items-center gap-2 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Preparing Archive...' : 'Download My Data Archive'}
          </button>
        </div>

        {/* Section 2: Delete Account */}
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-2.5">
          <h4 className="font-bold text-rose-300 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            Delete Account & Permanent Purge
          </h4>
          <p className="text-rose-300/80 font-sans text-[11px] leading-relaxed">
            Permanently delete your account and all associated skills, uploaded evidence files, and endorsement history. This operation is immediate and irreversible.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-1 px-4 py-2 rounded-xl border border-rose-500/40 bg-slate-900 text-rose-400 hover:bg-rose-500/20 font-bold transition-colors"
            >
              Request Account Deletion
            </button>
          ) : (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-rose-300 block">
                Are you absolutely sure? All data will be purged immediately.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-xs"
                >
                  {deleting ? 'Purging records...' : 'Yes, Permanently Purge My Data'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
