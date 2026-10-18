import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  CheckCircle, 
  ShieldAlert, 
  Cloud, 
  Bell, 
  UserCheck, 
  ExternalLink,
  Download,
  Trash2,
  Check
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenGdpr }) {
  const { user, token, switchDemoRole, unreadNotifications, setUnreadNotifications } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);

  // Fetch notifications when opening bell
  useEffect(() => {
    if (notificationsOpen && token) {
      fetch('/api/notifications/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setNotificationsList(data.notifications || []);
          setUnreadNotifications(data.unreadCount || 0);
        })
        .catch(err => console.error('Error fetching notifications:', err));
    }
  }, [notificationsOpen, token]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadNotifications(0);
      setNotificationsList(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: AWS Free Tier & Demo Fast Switch Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-emerald-400">AWS Free Tier Ready</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 hidden md:inline">EC2 t2.micro (1GB RAM) • S3 Storage • Zero-Cost Cloud Design</span>
        </div>

        {/* 1-Click Persona Switcher for Quick Grading/Evaluation */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Active Persona:</span>
          <div className="inline-flex rounded-md shadow-xs bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => switchDemoRole('freelancer')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'freelancer' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Freelancer (Riya)
            </button>
            <button
              onClick={() => switchDemoRole('client')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'client' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Client (Apex Tech)
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                FSMS <span className="text-indigo-600 text-xs px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded font-semibold">v1.1</span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">Freelancer Skill Management System</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Freelancer Hub
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'search'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Search & Filters (U1)
            </button>

            <button
              onClick={() => setActiveTab('automatch')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'automatch'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Smart Auto-Match (F7)
            </button>

            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'assessments'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Assessments (F5)
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              Admin Center (F9)
            </button>

            <button
              onClick={() => setActiveTab('aws')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'aws'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cloud className="w-4 h-4 text-sky-600" />
              AWS Cloud
            </button>
          </nav>

          {/* Right Action Icons: Notification Bell & GDPR Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell (SRS F8, P2) */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notificationsList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No notifications yet.</div>
                    ) : (
                      notificationsList.map(n => (
                        <div key={n.id} className={`p-3 text-xs ${n.is_read ? 'bg-white' : 'bg-indigo-50/50'}`}>
                          <div className="font-semibold text-slate-800 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GDPR Compliance & Data Portability Button (SRS S6) */}
            <button
              onClick={onOpenGdpr}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="GDPR Data Export & Privacy"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>GDPR</span>
            </button>

            {/* Active User Avatar & Role */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=RK'}
                alt={user?.full_name}
                className="w-8 h-8 rounded-full border border-slate-300 object-cover"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user?.full_name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50 px-2 py-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          Hub
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-2 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          Search (U1)
        </button>
        <button
          onClick={() => setActiveTab('automatch')}
          className={`px-2 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'automatch' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          Auto-Match
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-2 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'assessments' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          Assessments
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => setActiveTab('aws')}
          className={`px-2 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'aws' ? 'bg-indigo-600 text-white' : 'text-slate-600'
          }`}
        >
          AWS
        </button>
      </div>
    </header>
  );
}
