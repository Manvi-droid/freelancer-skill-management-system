import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  UserCheck, 
  Briefcase, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Award,
  Layers,
  Lock,
  Mail,
  Zap
} from 'lucide-react';

export default function LoginPortalModal({ isOpen, onClose }) {
  const { user, login, register, switchDemoRole } = useAuth();
  const [selectedWay, setSelectedWay] = useState('freelancer'); // 'freelancer' | 'provider'
  const [authMode, setAuthMode] = useState('demo'); // 'demo' | 'login' | 'register'
  
  // Custom form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async (roleName) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await switchDemoRole(roleName);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register({
          username,
          email,
          password,
          full_name: fullName,
          role: selectedWay === 'freelancer' ? 'freelancer' : 'client',
          termsAccepted,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Choose Your Access Portal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select whether you are a specialist showcasing verified skills or a provider posting tasks.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            
            {/* Way 1: Freelancer Portal */}
            <div
              onClick={() => { setSelectedWay('freelancer'); setErrorMsg(null); }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedWay === 'freelancer'
                  ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedWay === 'freelancer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  {selectedWay === 'freelancer' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">Freelancer Portal</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Catalog competencies, take technical tests, boost credibility rank, browse jobs, and submit proposals.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Improve Rank & Apply</span>
              </div>
            </div>

            {/* Way 2: Job / Task Provider Portal */}
            <div
              onClick={() => { setSelectedWay('provider'); setErrorMsg(null); }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedWay === 'provider'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedWay === 'provider' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {selectedWay === 'provider' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1">Job / Task Provider</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Publish client tasks, define required skills, review verified candidate match scores, and hire contractors.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Post Tasks & Hire</span>
              </div>
            </div>

          </div>

          {/* Sub-mode switcher (1-Click Demo Access vs Password Login) */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {authMode === 'demo' ? 'Instant 1-Click Access' : authMode === 'login' ? 'Account Sign In' : 'Create New Account'}
            </span>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('demo')}
                className={`font-semibold ${authMode === 'demo' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                1-Click Demo
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`font-semibold ${authMode === 'login' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Password Login
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* 1-Click Demo Profiles for Chosen Portal */}
          {authMode === 'demo' && (
            <div className="space-y-3">
              {selectedWay === 'freelancer' ? (
                <>
                  <button
                    onClick={() => handleDemoLogin('freelancer')}
                    disabled={loading}
                    className="w-full p-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-between transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                        alt="Riya"
                        className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                          Riya Kapoor (Lead Full Stack Specialist)
                        </div>
                        <div className="text-xs text-gray-500">
                          Credibility Score: 7.4/10 · 4 Assessed Competencies · Rate: $75/hr
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">
                      Logs in to the Freelancer Dashboard to take assessments, improve ranking, and apply for open tasks.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleDemoLogin('client')}
                    disabled={loading}
                    className="w-full p-3.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <img
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
                        alt="Apex"
                        className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600">
                          Apex Tech Ventures (Hiring Client / Task Provider)
                        </div>
                        <div className="text-xs text-gray-500">
                          Tech Incubator · 4 Active Jobs Posted · Reviewing Contractor Proposals
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">
                      Logs in to the Job Provider Dashboard to post new projects, evaluate applicants, and accept contracts.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Custom Password Form */}
          {authMode !== 'demo' && (
            <form onSubmit={handleCustomSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm mt-3"
              >
                {loading ? 'Authenticating...' : authMode === 'login' ? `Sign In to ${selectedWay === 'freelancer' ? 'Freelancer' : 'Provider'} Portal` : 'Create Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {authMode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
