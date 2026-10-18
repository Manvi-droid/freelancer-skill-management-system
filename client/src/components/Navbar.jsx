import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Bell, 
  UserCheck, 
  Download, 
  Check, 
  Zap, 
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenGdpr }) {
  const { user, token, switchDemoRole, unreadNotifications, setUnreadNotifications } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: UserCheck, color: 'text-violet-400' },
    { id: 'skills', label: 'Skills & Vault', icon: Layers, color: 'text-violet-400' },
    { id: 'assessments', label: 'Assessments', icon: Award, color: 'text-emerald-400' },
    { id: 'search', label: 'Talent Market', icon: Search, color: 'text-cyan-400' },
    { id: 'automatch', label: 'Auto-Match', icon: Sparkles, color: 'text-amber-400' },
    { id: 'admin', label: 'Admin Desk', icon: ShieldAlert, color: 'text-purple-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 border border-violet-400/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
                FSMS <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">v1.1</span>
              </div>
              <div className="text-[9px] font-mono text-slate-500 tracking-wider uppercase hidden sm:block">
                Freelancer Skill Management System
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Linear / Stripe Style) */}
          <nav className="hidden lg:flex items-center gap-1 font-medium font-mono text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Persona Switcher, Notification Bell, GDPR, User Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Minimalist Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                title="Switch Demo Role"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="hidden sm:inline capitalize">{user?.role || 'freelancer'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800 mb-1">
                    Select Persona
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole('freelancer');
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 ${
                      user?.role === 'freelancer' ? 'text-violet-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>Riya (Freelancer)</span>
                    {user?.role === 'freelancer' && <Check className="w-3 h-3 text-violet-400" />}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('client');
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 ${
                      user?.role === 'client' ? 'text-cyan-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>Apex Tech (Client)</span>
                    {user?.role === 'client' && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 ${
                      user?.role === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>System Admin</span>
                    {user?.role === 'admin' && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-3 z-50 text-slate-100 animate-in fade-in zoom-in-95 duration-100 font-mono">
                  <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase tracking-wider">Notifications</span>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notificationsList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 font-mono">No notifications yet.</div>
                    ) : (
                      notificationsList.map(n => (
                        <div key={n.id} className={`p-3 text-xs ${n.is_read ? 'bg-transparent' : 'bg-violet-950/20'}`}>
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-1 text-[11px] font-sans leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* GDPR Modal Button */}
            <button
              onClick={onOpenGdpr}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="GDPR Data Export & Privacy"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" />
              <span>GDPR</span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=RK'}
                alt={user?.full_name}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950 px-2 py-2 overflow-x-auto text-[11px] font-mono">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap ${
              activeTab === item.id ? 'bg-violet-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
