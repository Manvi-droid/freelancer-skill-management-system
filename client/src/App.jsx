import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FreelancerDashboard from './pages/FreelancerDashboard';
import SkillsEvidenceHub from './pages/SkillsEvidenceHub';
import SearchFreelancers from './pages/SearchFreelancers';
import ProjectAutoMatch from './pages/ProjectAutoMatch';
import SkillAssessment from './pages/SkillAssessment';
import PublicFreelancerProfile from './pages/PublicFreelancerProfile';
import AdminDashboard from './pages/AdminDashboard';
import GdprModal from './components/GdprModal';
import { Zap } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [isGdprOpen, setIsGdprOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white font-mono">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto glow-purple"></div>
          <p className="text-xs text-slate-400">Loading FSMS Workspace...</p>
        </div>
      </div>
    );
  }

  const handleViewFreelancer = (id) => {
    setSelectedFreelancerId(id);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans grid-mesh selection:bg-violet-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedFreelancerId(null);
          setActiveTab(tab);
        }}
        onOpenGdpr={() => setIsGdprOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <FreelancerDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewPublicProfile={(id) => handleViewFreelancer(id)}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsEvidenceHub
            onTakeAssessment={() => setActiveTab('assessments')}
          />
        )}

        {activeTab === 'search' && (
          <SearchFreelancers onViewFreelancer={handleViewFreelancer} />
        )}

        {activeTab === 'automatch' && (
          <ProjectAutoMatch onViewFreelancer={handleViewFreelancer} />
        )}

        {activeTab === 'assessments' && (
          <SkillAssessment onFinishAssessment={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'profile' && (
          <PublicFreelancerProfile
            freelancerId={selectedFreelancerId || 'usr-riya'}
            onBack={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* GDPR Data Portability & Privacy Modal (SRS S6) */}
      <GdprModal
        isOpen={isGdprOpen}
        onClose={() => setIsGdprOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-white font-bold">Freelancer Skill Management System (FSMS)</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">SRS v1.1 Implementation</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Author: Manvi Sharma</span>
            <span>•</span>
            <span className="text-emerald-400">IEEE 830 Standard Architecture</span>
            <span>•</span>
            <button onClick={() => setIsGdprOpen(true)} className="hover:text-violet-300 underline">
              GDPR Article 20
            </button>
          </div>
        </div>
      </footer>
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
