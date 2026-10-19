import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Bell, 
  Download, 
  Check, 
  Award,
  Layers,
  ChevronDown,
  LayoutDashboard,
  Users,
  ShieldCheck,
  TrendingUp,
  User,
  Briefcase,
  ArrowRightLeft,
  Plus,
  LogOut
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenGdpr,
  onOpenLoginModal
}) {
  const { user, token, switchDemoRole, logout, unreadNotifications, setUnreadNotifications } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const isClient = user?.role === 'client';

  // Dynamic Navigation Rail Items based on active portal
  const sideNavItems = isClient ? [
    { id: 'provider-dashboard', label: 'Provider Hub', icon: Briefcase },
    { id: 'jobs', label: 'Task Board', icon: Layers },
    { id: 'search', label: 'Talent Market', icon: Users },
    { id: 'automatch', label: 'Auto-Match', icon: Sparkles },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Desk', icon: ShieldAlert }] : []),
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs & Tasks', icon: Briefcase },
    { id: 'skills', label: 'Skills Vault', icon: Layers },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'search', label: 'Talent Market', icon: Users },
    { id: 'automatch', label: 'Auto-Match', icon: Sparkles },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Desk', icon: ShieldAlert }] : []),
  ];

  const credibilityScore = user ? ((user.rating || 4.5) * 1.5).toFixed(1) : '7.4';

  return (
    <>
      {/* ============================================================ */}
      {/* 1. SLEEK LEFT NAVIGATION RAIL (Original FSMS Identity)        */}
      {/* ============================================================ */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-gray-200 z-30 flex flex-col items-center pt-3 pb-4">
        {/* FSMS Brand Logo Icon */}
        <button
          onClick={() => setActiveTab(isClient ? 'provider-dashboard' : 'dashboard')}
          className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition-all mb-4 group"
          title="FSMS Dashboard"
        >
          <div className="relative flex items-center justify-center">
            {isClient ? <Briefcase className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
        </button>

        {/* Navigation Rail Items */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2 flex-1">
          {sideNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all group ${
                  isActive
                    ? isClient ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs' : 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                  isActive ? (isClient ? 'text-indigo-600' : 'text-blue-600') : 'text-gray-500'
                }`} />
                <span className="text-[10px] leading-tight text-center tracking-tight font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile Anchor */}
        <div className="mt-auto pt-2 border-t border-gray-100 w-full flex flex-col items-center">
          <button
            onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all shadow-xs relative"
            title={`${user?.full_name} (${user?.role})`}
          >
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'U'}`}
              alt={user?.full_name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. TOP UTILITY HEADER BAR                                     */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-20 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 z-20 flex items-center px-6 gap-4">
        {/* Brand Name & App Descriptor */}
        <div 
          onClick={() => setActiveTab(isClient ? 'provider-dashboard' : 'dashboard')}
          className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <span className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
            FSMS
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
              isClient 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {isClient ? 'Task Provider' : 'Freelancer'}
            </span>
          </span>
          <span className="text-xs text-gray-400 hidden md:inline">| Skill Management System</span>
        </div>

        {/* Search Omnibar */}
        <div className="flex-1 max-w-lg mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={isClient ? "Search talent, skills, or candidate applications..." : "Search jobs, skills, or assessments..."}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setActiveTab(isClient ? 'search' : 'jobs');
                }
              }}
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Right Side Status Metrics & 2-Way Login Portal Switcher */}
        <div className="flex items-center gap-2.5 ml-auto flex-shrink-0">
          
          {/* Prominent 2-Way Portal Switcher Button */}
          <button
            onClick={onOpenLoginModal}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
              isClient 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="Switch between Freelancer and Job Provider logins"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal:</span>
            <span>{isClient ? 'Provider Hub' : 'Freelancer'}</span>
          </button>

          {/* Skill Credibility Score Widget (for Freelancers) */}
          {!isClient && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-600 font-medium">Credibility:</span>
              <span className="font-bold text-blue-700">{credibilityScore}/10</span>
            </div>
          )}

          {/* Rate Widget */}
          {!isClient && user?.hourly_rate && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-semibold">
              <span>${user.hourly_rate}/hr</span>
            </div>
          )}

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-gray-300 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="capitalize">{user?.role || 'freelancer'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {personaMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPersonaMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 pb-2 border-b border-gray-100 mb-1">
                    <p className="font-bold text-gray-900 text-xs">{user?.full_name}</p>
                    <p className="text-[11px] text-gray-500">{user?.title}</p>
                  </div>
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Active Role</div>
                  {[
                    { role: 'freelancer', label: 'Freelancer (Riya)', desc: 'Improve ranks, browse jobs, apply' },
                    { role: 'client', label: 'Job Provider (Apex Tech)', desc: 'Post tasks, review proposals, hire' },
                    { role: 'admin', label: 'System Admin', desc: 'Moderation queue & audit log' },
                  ].map(opt => (
                    <button
                      key={opt.role}
                      onClick={() => { 
                        switchDemoRole(opt.role); 
                        setPersonaMenuOpen(false); 
                        setActiveTab(opt.role === 'client' ? 'provider-dashboard' : 'dashboard');
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        user?.role === opt.role ? 'bg-blue-50/60 text-blue-700 font-bold' : 'text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{opt.desc}</div>
                      </div>
                      {user?.role === opt.role && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1 space-y-0.5">
                    <button
                      onClick={() => { onOpenGdpr(); setPersonaMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>GDPR Data Export (Art. 20)</span>
                    </button>
                    <button
                      onClick={() => { logout(); setPersonaMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Login Page</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
            title="Log Out to Login Portals"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-gray-200 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">Notifications</span>
                    {unreadNotifications > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notificationsList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No notifications yet.</div>
                    ) : (
                      notificationsList.map(n => (
                        <div key={n.id} className={`p-3 text-xs ${n.is_read ? '' : 'bg-blue-50/50'}`}>
                          <div className="font-semibold text-gray-900 flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
