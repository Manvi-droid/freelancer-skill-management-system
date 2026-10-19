import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  UserCheck, 
  Briefcase, 
  ShieldCheck, 
  Award,
  Sparkles,
  Lock,
  Mail,
  ChevronRight
} from 'lucide-react';

export default function LoginPortalModal({ isOpen, onClose }) {
  const { user, login, register } = useAuth();
  const [selectedWay, setSelectedWay] = useState('freelancer'); // 'freelancer' | 'provider'
  const [isRegister, setIsRegister] = useState(false);
  
  // Custom form state (empty by default, placeholders show default credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (!isRegister) {
        // Fallback to default credentials if submitted directly
        const defaultEmail = selectedWay === 'freelancer' ? 'riya.kapoor@example.com' : 'recruiting@apexventures.io';
        const emailToUse = email.trim() || defaultEmail;
        const passToUse = password || 'Password123!';
        await login(emailToUse, passToUse);
      } else {
        await register({
          username,
          email,
          password,
          full_name: fullName,
          role: selectedWay === 'freelancer' ? 'freelancer' : 'client',
          termsAccepted: true,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const defaultEmailHint = selectedWay === 'freelancer' ? 'riya.kapoor@example.com' : 'recruiting@apexventures.io';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Switch Portal / Sign In
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select your role portal and sign in with your credentials.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Login Ways Selector */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            
            {/* Way 1: Freelancer Portal */}
            <div
              onClick={() => { setSelectedWay('freelancer'); setErrorMsg(null); }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedWay === 'freelancer'
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <UserCheck className={`w-4 h-4 ${selectedWay === 'freelancer' ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900 text-xs">Freelancer</h3>
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-2">
                Catalog skills, take tests, browse jobs, and apply.
              </p>
            </div>

            {/* Way 2: Job / Task Provider Portal */}
            <div
              onClick={() => { setSelectedWay('provider'); setErrorMsg(null); }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedWay === 'provider'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className={`w-4 h-4 ${selectedWay === 'provider' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <h3 className="font-bold text-gray-900 text-xs">Job Provider</h3>
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-2">
                Publish tasks, review proposals, and hire contractors.
              </p>
            </div>

          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3.5 text-xs">
            {isRegister && (
              <>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Lin"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="e.g. maya_dev"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
                <span>Email / Username</span>
                <span className="text-[10px] text-gray-400 font-normal">Default: {defaultEmailHint}</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder={defaultEmailHint}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-gray-400 font-normal">Default: Password123!</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Password123!"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-white font-semibold text-xs transition-colors shadow-xs mt-2 ${
                selectedWay === 'freelancer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register Account' : `Sign In to ${selectedWay === 'freelancer' ? 'Freelancer' : 'Provider'} Portal`}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-blue-600 hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
