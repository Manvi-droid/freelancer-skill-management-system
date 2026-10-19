import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  Briefcase, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Lock, 
  Mail, 
  Check, 
  Layers, 
  TrendingUp,
  Building2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function LoginPage() {
  const { login, register, switchDemoRole } = useAuth();
  
  // Selected portal on mobile / focus tab
  const [activePortalTab, setActivePortalTab] = useState('freelancer'); // 'freelancer' | 'client'
  
  // Custom login forms state
  const [freelancerEmail, setFreelancerEmail] = useState('riya.kapoor@example.com');
  const [freelancerPassword, setFreelancerPassword] = useState('Password123!');
  
  const [clientEmail, setClientEmail] = useState('recruiting@apexventures.io');
  const [clientPassword, setClientPassword] = useState('Password123!');
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handle1ClickLogin = async (roleName) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await switchDemoRole(roleName);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFreelancerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(freelancerEmail, freelancerPassword);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid freelancer credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(clientEmail, clientPassword);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid provider credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        full_name: regFullName,
        role: activePortalTab === 'freelancer' ? 'freelancer' : 'client',
        termsAccepted: true,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base tracking-tight flex items-center gap-2">
              FSMS
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                SRS v1.1
              </span>
            </div>
            <div className="text-xs text-gray-400">Freelancer Skill Management System</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span className="hidden sm:inline">IEEE 830 Architecture</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Skill Framework
          </span>
        </div>
      </header>

      {/* Main Content Area: 2 Separate Login Portals */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        
        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Role-Based Portal Access
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Sign In to Your Workspace
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Choose your account portal below to access your dedicated dashboard. Freelancers can manage & verify skills and apply for tasks; job providers can publish contracts and evaluate candidate match rankings.
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Normal Mode: 2 Distinct Portals Side-by-Side */}
        {!isRegisterMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* ======================================================== */}
            {/* PORTAL 1: FREELANCER LOGIN WAY                           */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 hover:border-blue-300 transition-all p-7 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Specialist Portal
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">I am a Freelancer</h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Catalog technical competencies, take timed skill evaluations, boost your credibility rank, and apply to client contracts.
                </p>

                {/* 1-Click Instant Demo Login Options */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Fast 1-Click Access (Evaluation Mode):
                  </span>

                  <button
                    type="button"
                    onClick={() => handle1ClickLogin('freelancer')}
                    disabled={loading}
                    className="w-full p-3 rounded-xl border border-gray-200 hover:border-blue-400 bg-gray-50/60 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                        alt="Riya"
                        className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600">
                          Riya Kapoor (Lead Full Stack)
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Credibility: 7.4/10 · 4 Certified Skills
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                {/* Password Login Form */}
                <form onSubmit={handleFreelancerSubmit} className="space-y-3 pt-4 border-t border-gray-100 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Or Sign In with Credentials:
                  </span>

                  <div>
                    <input
                      type="email"
                      value={freelancerEmail}
                      onChange={e => setFreelancerEmail(e.target.value)}
                      placeholder="freelancer@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      value={freelancerPassword}
                      onChange={e => setFreelancerPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Authenticating...' : 'Enter Freelancer Dashboard'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Features: Skills Vault, HackerRank Tests, Job Applications</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PORTAL 2: JOB & TASK PROVIDER LOGIN WAY                  */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl border-2 border-indigo-100 hover:border-indigo-300 transition-all p-7 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Provider Portal
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">I am a Job / Task Provider</h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Publish project tasks, define required verified competency levels, evaluate applicant match scores, and award contracts.
                </p>

                {/* 1-Click Instant Demo Login Options */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Fast 1-Click Access (Evaluation Mode):
                  </span>

                  <button
                    type="button"
                    onClick={() => handle1ClickLogin('client')}
                    disabled={loading}
                    className="w-full p-3 rounded-xl border border-gray-200 hover:border-indigo-400 bg-gray-50/60 hover:bg-indigo-50/50 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
                        alt="Apex"
                        className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">
                          Apex Tech Ventures (Hiring Client)
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Tech Incubator · 4 Active Jobs Posted
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>

                {/* Password Login Form */}
                <form onSubmit={handleClientSubmit} className="space-y-3 pt-4 border-t border-gray-100 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Or Sign In with Credentials:
                  </span>

                  <div>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      value={clientPassword}
                      onChange={e => setClientPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Authenticating...' : 'Enter Provider Hub'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Features: Post Tasks, Review Proposals, Accept/Hire, Auto-Match</span>
              </div>
            </div>

          </div>
        ) : (
          /* Registration Form */
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create an Account</h2>
            <p className="text-xs text-gray-500 mb-5">Select your role and start using FSMS.</p>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActivePortalTab('freelancer')}
                  className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                    activePortalTab === 'freelancer'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Freelancer
                </button>
                <button
                  type="button"
                  onClick={() => setActivePortalTab('client')}
                  className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                    activePortalTab === 'client'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Job Provider
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="e.g. jordan_lee"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs mt-2"
              >
                {loading ? 'Creating...' : 'Register Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bottom register trigger */}
        {!isRegisterMode && (
          <div className="text-center mt-8 text-xs text-gray-500">
            <span>New to FSMS? </span>
            <button
              onClick={() => setIsRegisterMode(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              Create a free account as a Freelancer or Job Provider
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 px-6 text-xs text-gray-400 text-center">
        <span>FSMS · Freelancer Skill Management System (SRS v1.1) • IEEE 830 Architecture • Developed by Manvi Sharma</span>
      </footer>

    </div>
  );
}
