import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FreelancerDashboard from './pages/FreelancerDashboard';
import SkillsEvidenceHub from './pages/SkillsEvidenceHub';
import SearchFreelancers from './pages/SearchFreelancers';
import ProjectAutoMatch from './pages/ProjectAutoMatch';
import SkillAssessment from './pages/SkillAssessment';
import PublicFreelancerProfile from './pages/PublicFreelancerProfile';
import AdminDashboard from './pages/AdminDashboard';
import FreelancerJobsMarket from './pages/FreelancerJobsMarket';
import ClientProviderDashboard from './pages/ClientProviderDashboard';
import AnnounceTask from './pages/AnnounceTask';
import GdprModal from './components/GdprModal';
import LoginPortalModal from './components/LoginPortalModal';
import AdminAuthModal from './components/AdminAuthModal';
import LoginPage from './pages/LoginPage';
import { ShieldAlert, Lock, KeyRound } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [isGdprOpen, setIsGdprOpen] = useState(false);
  const [isLoginPortalOpen, setIsLoginPortalOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // Sync active dashboard when role changes
  useEffect(() => {
    if (user?.role === 'client' && (activeTab === 'dashboard' || activeTab === 'skills' || activeTab === 'assessments' || activeTab === 'jobs')) {
      setActiveTab('provider-dashboard');
    } else if (user?.role === 'freelancer' && (activeTab === 'provider-dashboard' || activeTab === 'announce-task')) {
      setActiveTab('dashboard');
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500">Loading FSMS...</p>
        </div>
      </div>
    );
  }

  // If user is not signed in, show the dedicated 2-way LoginPage
  if (!user) {
    return <LoginPage />;
  }

  const handleViewFreelancer = (id) => {
    setSelectedFreelancerId(id);
    setActiveTab('profile');
  };

  const handleSetActiveTab = (tab) => {
    setSelectedFreelancerId(null);
    if (tab === 'admin' && user?.role !== 'admin') {
      setIsAdminAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    /* Full-screen flex layout */
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      {/* Left sidebar + top bar — both rendered by Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenGdpr={() => setIsGdprOpen(true)}
        onOpenLoginModal={() => setIsLoginPortalOpen(true)}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
      />

      {/* Main content area: offset for left sidebar (80px) + top bar (56px) */}
      <div className="ml-20 pt-14 min-h-screen">
        <main className="min-h-[calc(100vh-56px)]">
          
          {/* Freelancer Specific Dashboard */}
          {activeTab === 'dashboard' && (
            <FreelancerDashboard
              onNavigateTab={handleSetActiveTab}
              onViewPublicProfile={handleViewFreelancer}
            />
          )}

          {/* Job/Task Provider: My Tasks & Related Activity */}
          {activeTab === 'provider-dashboard' && (
            <ClientProviderDashboard
              onNavigateToAutoMatch={() => handleSetActiveTab('automatch')}
              onNavigateToSearch={() => handleSetActiveTab('workforce')}
            />
          )}

          {/* Job/Task Provider: Announce a Task */}
          {activeTab === 'announce-task' && (
            <AnnounceTask
              onTaskAnnounced={() => handleSetActiveTab('provider-dashboard')}
              onNavigateToAutoMatch={() => handleSetActiveTab('automatch')}
            />
          )}

          {/* Available Workforce & Talent Directory (For Clients & Freelancers) */}
          {(activeTab === 'workforce' || activeTab === 'search') && (
            <SearchFreelancers onViewFreelancer={handleViewFreelancer} />
          )}

          {/* Freelancer Only: Available Tasks Marketplace & Proposal Submission */}
          {activeTab === 'jobs' && (
            <FreelancerJobsMarket
              onNavigateToAssessments={() => handleSetActiveTab('assessments')}
            />
          )}

          {/* Skills & Evidence Vault */}
          {activeTab === 'skills' && (
            <SkillsEvidenceHub
              onTakeAssessment={() => handleSetActiveTab('assessments')}
            />
          )}

          {/* Algorithmic Project Auto-Match (SRS F7) */}
          {activeTab === 'automatch' && (
            <ProjectAutoMatch onViewFreelancer={handleViewFreelancer} />
          )}

          {/* HackerRank / Codility Style Timed Assessment Arena */}
          {activeTab === 'assessments' && (
            <SkillAssessment onFinishAssessment={() => handleSetActiveTab('dashboard')} />
          )}

          {/* Public Freelancer Profile */}
          {activeTab === 'profile' && (
            <PublicFreelancerProfile
              freelancerId={selectedFreelancerId || user?.id || 'usr-riya'}
              onBack={() => handleSetActiveTab(user?.role === 'client' ? 'workforce' : 'jobs')}
            />
          )}

          {/* Admin Moderation Desk - Strictly Authenticated */}
          {activeTab === 'admin' && (
            user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Administrative Authentication Required</h2>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  This console is restricted to platform compliance leads and administrators. Please authenticate with your master administrator credentials.
                </p>
                <button
                  onClick={() => setIsAdminAuthOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Authenticate as Administrator
                </button>
              </div>
            )
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 tracking-tight">FSMS</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">Freelancer Skill Management System (SRS v1.1)</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Author: Manvi Sharma (24BCE1566)</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">IEEE 830 Architecture</span>
              <span>•</span>
              <button onClick={() => setIsLoginPortalOpen(true)} className="text-blue-600 hover:underline font-medium">
                Switch Role / Login
              </button>
              <span>•</span>
              <button onClick={() => setIsGdprOpen(true)} className="text-blue-600 hover:underline">
                GDPR Article 20
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* GDPR Data Portability & Privacy Modal (SRS S6) */}
      <GdprModal isOpen={isGdprOpen} onClose={() => setIsGdprOpen(false)} />

      {/* 2-Way Login & Portal Selector Modal */}
      <LoginPortalModal 
        isOpen={isLoginPortalOpen} 
        onClose={() => setIsLoginPortalOpen(false)} 
      />

      {/* Secure Admin Authentication Gate Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => setActiveTab('admin')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
