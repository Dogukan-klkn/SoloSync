import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import {
  X, User, Settings, LogOut, HelpCircle, MessageSquare, ChevronRight,
} from 'lucide-react';

const ACCENT = {
  freelancer: {
    avatar: 'bg-brand-500 hover:bg-brand-600 ring-brand-200',
    avatarSolid: 'bg-brand-500',
    active: 'bg-brand-50 text-brand-700',
    icon: 'text-brand-600',
  },
  client: {
    avatar: 'bg-violet-600 hover:bg-violet-700 ring-violet-200',
    avatarSolid: 'bg-violet-600',
    active: 'bg-violet-50 text-violet-700',
    icon: 'text-violet-600',
  },
};

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name[0].toUpperCase();
}

export default function ProfileMenu({ variant = 'freelancer', subtitle }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const accent = ACCENT[variant] ?? ACCENT.freelancer;
  const isClient = variant === 'client';
  const profilePath = isClient ? '/client-portal/profile' : '/dashboard/profile';

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const menuItems = [
    {
      label: 'Profil Ayarları',
      icon: User,
      onClick: () => handleNavigate(profilePath),
    },
    ...(isClient
      ? [{
          label: 'Mesajlar',
          icon: MessageSquare,
          onClick: () => handleNavigate('/client-portal/messages'),
        }]
      : [{
          label: 'Uygulama Ayarları',
          icon: Settings,
          onClick: () => handleNavigate('/dashboard/settings'),
        }]),
    {
      label: 'Yardım',
      icon: HelpCircle,
      onClick: () => {
        setOpen(false);
        window.open('mailto:support@solosync.app', '_blank');
      },
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition shadow-sm ring-2 ring-offset-1 ${accent.avatar}`}
        aria-label="Profil menüsü"
      >
        {user?.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(user?.fullName)
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          />

          <aside className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-start justify-between px-5 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0 ${accent.avatarSolid}`}>
                  {user?.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user?.fullName)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{user?.fullName}</p>
                  <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                  {subtitle && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-3 px-3 space-y-1">
              {menuItems.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition text-left group"
                >
                  <span className={`p-2 rounded-lg bg-slate-100 group-hover:${accent.active} ${accent.icon}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </nav>

            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition text-left"
              >
                <span className="p-2 rounded-lg bg-red-50">
                  <LogOut className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium">Çıkış Yap</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
