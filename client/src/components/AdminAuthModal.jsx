import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  X, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth();
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const identifierToUse = adminIdentifier.trim() || 'admin@fsms.org';
    const passwordToUse = adminPassword || 'Admin123!';

    try {
      const data = await login(identifierToUse, passwordToUse);
      if (data.user?.role !== 'admin') {
        throw new Error('This account does not possess System Administrator privileges.');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator authentication credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 text-amber-300">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="text-lg font-bold">Admin Portal Authentication</h2>
          <p className="text-xs text-purple-200 mt-1">
            Restricted compliance and moderation console. Enter your master administrator credentials.
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
              <span>Admin Username or Email</span>
              <span className="text-[10px] text-gray-400 font-normal">Default: admin@fsms.org</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="admin@fsms.org"
                value={adminIdentifier}
                onChange={e => setAdminIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
              <span>Admin Master Password</span>
              <span className="text-[10px] text-gray-400 font-normal">Default: Admin123!</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Admin123!"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              {loading ? 'Verifying Credentials...' : 'Authenticate & Enter Admin Console'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center pt-1">
            Access protected under IEEE 830 S5 Security Audit Logging standards.
          </p>
        </form>

      </div>
    </div>
  );
}
