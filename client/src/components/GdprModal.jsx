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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">GDPR Privacy & Data Center</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <div className="text-xs text-slate-600 space-y-1">
          <p>
            In compliance with <strong>GDPR Article 20 (Data Portability)</strong> and <strong>Article 17 (Right to be Forgotten)</strong>, you retain full ownership of your cataloged skills, verification records, and personal profile data.
          </p>
        </div>

        {/* Section 1: Export Data */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-indigo-600" />
            Export My Data (JSON)
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Download a portable, machine-readable JSON archive containing all your skills, evidence records, endorsements received, assessment scores, and notification logs.
          </p>
          <button
            onClick={handleExportData}
            disabled={downloading}
            className="mt-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Preparing Export...' : 'Download My Data Archive'}
          </button>
        </div>

        {/* Section 2: Delete Account */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
          <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-rose-600" />
            Delete Account & Permanent Purge
          </h4>
          <p className="text-[11px] text-rose-700 leading-relaxed">
            Permanently delete your account and all associated skills, uploaded evidence files, and endorsement history. This operation is immediate and irreversible.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-1 px-4 py-2 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              Request Account Deletion
            </button>
          ) : (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-rose-800 block">
                Are you absolutely sure? All data will be purged immediately.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {deleting ? 'Purging records...' : 'Yes, Permanently Purge My Data'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-white"
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
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
