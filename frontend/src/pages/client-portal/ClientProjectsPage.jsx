import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProjects } from '../../hooks/useClientPortal';
import { FolderOpen, ChevronRight, CalendarDays, Flag } from 'lucide-react';

const STATUS_TABS = [
  { key: 'all',       label: 'Tümü' },
  { key: 'active',    label: 'Aktif' },
  { key: 'completed', label: 'Tamamlanan' },
];

const statusLabel = {
  Pending:    { text: 'Beklemede',    cls: 'bg-slate-100 text-slate-600' },
  InProgress: { text: 'Devam ediyor', cls: 'bg-blue-100 text-blue-700' },
  InRevision: { text: 'Revizyon',     cls: 'bg-amber-100 text-amber-700' },
  Completed:  { text: 'Tamamlandı',  cls: 'bg-green-100 text-green-700' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const ClientProjectsPage = () => {
  const { data: projects = [], isLoading } = useMyProjects();
  const [tab, setTab] = useState('all');

  const filtered = projects.filter(p => {
    if (tab === 'active') return p.status !== 'Completed';
    if (tab === 'completed') return p.status === 'Completed';
    return true;
  });

  if (isLoading) {
    return <div className="text-center py-20 text-slate-400">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Projelerim</h1>
        <p className="text-slate-500 mt-1">Freelancer'ınız tarafından sizin için yürütülen projeler</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.key !== 'all' && (
              <span className="ml-1.5 text-xs text-slate-400">
                ({t.key === 'active'
                  ? projects.filter(p => p.status !== 'Completed').length
                  : projects.filter(p => p.status === 'Completed').length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <FolderOpen className="w-12 h-12 text-slate-300" />
          <p className="text-slate-500">Bu kategoride proje bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const st = statusLabel[p.status] ?? statusLabel.Pending;
            const progress = p.milestoneCount > 0
              ? Math.round((p.completedMilestoneCount / p.milestoneCount) * 100)
              : 0;
            return (
              <Link
                key={p.id}
                to={`/client-portal/projects/${p.id}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${st.cls}`}>
                    {st.text}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">İlerleme</span>
                    <span className="text-xs font-medium text-slate-700">{progress}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-violet-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      {p.milestoneCount ?? 0} km taşı
                    </span>
                    {p.endDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(p.endDate)}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProjectsPage;
