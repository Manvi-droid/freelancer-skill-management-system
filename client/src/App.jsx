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
import GdprModal from './components/GdprModal';
import LoginPortalModal from './components/LoginPortalModal';

import LoginPage from './pages/LoginPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [isGdprOpen, setIsGdprOpen] = useState(false);
  const [isLoginPortalOpen, setIsLoginPortalOpen] = useState(false);

  // Sync active dashboard when role changes
  useEffect(() => {
    if (user?.role === 'client' && (activeTab === 'dashboard' || activeTab === 'skills' || activeTab === 'assessments')) {
      setActiveTab('provider-dashboard');
    } else if (user?.role === 'freelancer' && activeTab === 'provider-dashboard') {
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

          {/* Job/Task Provider (Client) Specific Dashboard */}
          {activeTab === 'provider-dashboard' && (
            <ClientProviderDashboard
              onNavigateToAutoMatch={() => handleSetActiveTab('automatch')}
              onNavigateToSearch={() => handleSetActiveTab('search')}
            />
          )}

          {/* Freelancer Jobs Marketplace & Proposal Tracker */}
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

          {/* Talent Directory (Contra / Toptal style) */}
          {activeTab === 'search' && (
            <SearchFreelancers onViewFreelancer={handleViewFreelancer} />
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
              onBack={() => handleSetActiveTab(user?.role === 'client' ? 'search' : 'jobs')}
            />
          )}

          {/* Admin Moderation Desk */}
          {activeTab === 'admin' && (
            <AdminDashboard />
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
