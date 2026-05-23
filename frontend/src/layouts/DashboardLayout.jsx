// src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import {
  LayoutDashboard, FolderKanban,
  Users, Settings, Menu, X, LogOut, ChevronRight, Timer, FileText, Send
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',                label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/dashboard/projects',       label: 'Projeler',      icon: FolderKanban },
  { to: '/dashboard/clients',        label: 'Müşteriler',    icon: Users, roles: ['Freelancer'] },
  { to: '/dashboard/time-tracker',   label: 'Zaman Takibi',  icon: Timer, roles: ['Freelancer'] },
  { to: '/dashboard/invoices',       label: 'Faturalar',     icon: FileText, roles: ['Freelancer'] },
  { to: '/dashboard/requests',       label: 'İstekler',       icon: Send, roles: ['Freelancer'] },
  { to: '/dashboard/settings',       label: 'Ayarlar',       icon: Settings },
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Client rolü mü? Sadece Freelancer'a açık menü öğeleri filtrele
  const userRole    = user?.role ?? '';
  const visibleNavs = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm">
            FS
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap overflow-hidden">
              FreelancerSaaS
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {visibleNavs.map(({ to, label, icon: Icon }) => {
            // Nested route'lar için startsWith kullan
            const active = to === '/dashboard'
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  active
                    ? 'bg-brand-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
                {sidebarOpen && active && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-700 p-3">
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <p className="text-white text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-slate-400 text-xs truncate">{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 flex items-center px-6 py-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-900 transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="font-semibold text-slate-800 text-lg">
            {NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? 'Dashboard'}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.fullName?.[0] ?? 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
