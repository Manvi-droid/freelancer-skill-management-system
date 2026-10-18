import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FreelancerDashboard from './pages/FreelancerDashboard';
import SearchFreelancers from './pages/SearchFreelancers';
import ProjectAutoMatch from './pages/ProjectAutoMatch';
import SkillAssessment from './pages/SkillAssessment';
import PublicFreelancerProfile from './pages/PublicFreelancerProfile';
import AdminDashboard from './pages/AdminDashboard';
import AwsCloudCenter from './pages/AwsCloudCenter';
import GdprModal from './components/GdprModal';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [isGdprOpen, setIsGdprOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Initializing FSMS Application & Database...</p>
        </div>
      </div>
    );
  }

  const handleViewFreelancer = (id) => {
    setSelectedFreelancerId(id);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
            onTakeAssessment={() => setActiveTab('assessments')}
            onViewPublicProfile={(id) => handleViewFreelancer(id)}
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

        {activeTab === 'aws' && (
          <AwsCloudCenter />
        )}
      </main>

      {/* GDPR Data Portability & Privacy Modal (SRS S6) */}
      <GdprModal
        isOpen={isGdprOpen}
        onClose={() => setIsGdprOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>Freelancer Skill Management System (FSMS)</span>
            <span>•</span>
            <span className="text-indigo-600 font-semibold">SRS v1.1 Implementation</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Author: Manvi Sharma</span>
            <span>•</span>
            <span>AWS Free Tier Optimized</span>
            <span>•</span>
            <button onClick={() => setIsGdprOpen(true)} className="hover:text-slate-700 underline">
              GDPR Compliance (S6)
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
