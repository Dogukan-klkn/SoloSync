import { useNavigate } from 'react-router-dom';
import { Plus, Play, Briefcase, FileText, AlertCircle, Clock } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useInvoices } from '../hooks/useInvoices';
import { useTimeSummary } from '../hooks/useTimeEntries';

function formatCurrency(v) {
  return `₺${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`;
}

function formatDuration(seconds) {
  if (!seconds) return '0sa';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
}

const STATUS_LABELS = {
  Pending: 'Beklemede', InProgress: 'Devam Ediyor',
  InRevision: 'Revizyon', Completed: 'Tamamlandı',
};
const STATUS_DOT = {
  Pending: 'bg-gray-400', InProgress: 'bg-blue-500',
  InRevision: 'bg-yellow-500', Completed: 'bg-green-500',
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { data: allInvoices = [] } = useInvoices();
  const today = new Date();
  const from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const to = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  const { data: summary } = useTimeSummary({ from, to });

  const activeProjects = projects.filter(p => p.status === 'InProgress').length;
  const pendingRevenue = allInvoices.filter(i => i.status === 'Sent').reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  const overdueCount = allInvoices.filter(i => i.status === 'Overdue').length;
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Karşılama */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hoş geldiniz 👋</h1>
        <p className="text-gray-500 text-sm mt-1">İşte bugünkü özet.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate('/dashboard/projects')}
            className="flex items-center gap-2 bg-brand-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors">
            <Plus size={16} /> Yeni Proje
          </button>
          <button onClick={() => navigate('/dashboard/time-tracker')}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Play size={16} /> Süre Başlat
          </button>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <FileText size={20} className="text-green-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(pendingRevenue)}</div>
          <div className="text-xs text-gray-500 mt-1">Bu Ayki Bekleyen Gelir</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Briefcase size={20} className="text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{activeProjects}</div>
          <div className="text-xs text-gray-500 mt-1">Aktif Projeler</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{overdueCount}</div>
          <div className="text-xs text-gray-500 mt-1">Gecikmiş Faturalar</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
            <Clock size={20} className="text-brand-600" />
          </div>
          <div className="text-xl font-bold text-gray-900">{formatDuration(summary?.totalSeconds)}</div>
          <div className="text-xs text-gray-500 mt-1">Bugünkü Çalışma</div>
        </div>
      </div>

      {/* Son Projeler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Son Projeler</h2>
          <button onClick={() => navigate('/dashboard/projects')}
            className="text-sm text-brand-600 hover:underline">Tümünü gör</button>
        </div>
        {recentProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Henüz proje yok.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map(p => (
              <div key={p.id}
                onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm cursor-pointer hover:border-brand-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status] || 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-500">{STATUS_LABELS[p.status] || p.status}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.customerName}</p>
                {p.budget && (
                  <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                    Bütçe: {formatCurrency(p.budget)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
