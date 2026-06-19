import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useMyProfile, useMyProjects } from '../hooks/useClientPortal';
import {
  LayoutDashboard, FolderOpen, FileText,
  Menu, PanelLeftClose, LogOut, ChevronRight, Bell, Send
} from 'lucide-react';
import ProfileMenu from '../components/profile/ProfileMenu';

const NAV_ITEMS = [
  { to: '/client-portal',          label: 'Özet',        icon: LayoutDashboard, exact: true },
  { to: '/client-portal/projects', label: 'Projelerim',  icon: FolderOpen },
  { to: '/client-portal/invoices', label: 'Faturalarım', icon: FileText },
  { to: '/client-portal/requests', label: 'İsteklerim',  icon: Send },
];

const ClientPortalLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: projects = [] } = useMyProjects();

  const totalPendingRequests = projects.reduce(
    (sum, p) => sum + (p.pendingRequestCount ?? 0), 0
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const freelancerName = profile?.freelancerName ?? 'Freelancer';
  const freelancerEmail = profile?.freelancerEmail ?? '';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm text-white">
            S
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <span className="font-bold text-slate-800 text-base">SoloSync</span>
              <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">
                Müşteri
              </span>
            </div>
          )}
        </div>

        {/* Freelancer info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Çalışma alanı</p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {freelancerName?.[0] ?? 'F'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{freelancerName}</p>
                <p className="text-xs text-slate-400 truncate">{freelancerEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {sidebarOpen && (
            <p className="text-xs text-slate-400 uppercase tracking-wider px-2 mb-2 font-medium">Portal</p>
          )}
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/client-portal';
            const isHome = to === '/client-portal' && location.pathname === '/client-portal';
            const isActive = active || isHome;
            const isRequests = to === '/client-portal/requests';

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium flex-1">{label}</span>}
                {sidebarOpen && isRequests && totalPendingRequests > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {totalPendingRequests}
                  </span>
                )}
                {sidebarOpen && isActive && !isRequests && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-100 p-3">
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold truncate text-slate-800">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-400 truncate">{profile?.companyName ?? 'Müşteri'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 flex items-center px-6 py-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-700 transition"
            aria-label={sidebarOpen ? 'Kenar çubuğunu daralt' : 'Kenar çubuğunu genişlet'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button type="button" className="text-slate-400 hover:text-slate-700 transition relative" aria-label="Bildirimler">
            <Bell className="w-5 h-5" />
          </button>
          <ProfileMenu
            variant="client"
            subtitle={profile?.companyName ?? 'Müşteri'}
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientPortalLayout;
