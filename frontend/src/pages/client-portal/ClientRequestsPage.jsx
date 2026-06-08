import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllMyRequests } from '../../hooks/useClientPortal';
import { Send, Clock, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react';

const STATUS_TABS = [
  { key: '', label: 'Tümü' },
  { key: 'Pending', label: 'İncelemede' },
  { key: 'Approved', label: 'Onaylandı' },
  { key: 'Rejected', label: 'Reddedildi' },
];

const STATUS_MAP = {
  Pending:  { label: 'İncelemede', cls: 'bg-amber-100 text-amber-700',   icon: Clock,         dot: 'bg-amber-400'  },
  Approved: { label: 'Onaylandı',  cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, dot: 'bg-emerald-500' },
  Rejected: { label: 'Reddedildi', cls: 'bg-red-100 text-red-600',       icon: XCircle,       dot: 'bg-red-400'    },
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ClientRequestsPage() {
  const [activeTab, setActiveTab] = useState('');
  const { data: allRequests = [], projects, isLoading } = useAllMyRequests();

  const filtered = activeTab
    ? allRequests.filter((r) => r.status === activeTab)
    : allRequests;

  const pending  = allRequests.filter((r) => r.status === 'Pending').length;
  const approved = allRequests.filter((r) => r.status === 'Approved').length;
  const rejected = allRequests.filter((r) => r.status === 'Rejected').length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">İsteklerim</h1>
        <p className="text-slate-500 mt-1">
          Tüm projelerinizde freelancer&apos;ınıza gönderdiğiniz istekler
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'İncelemede', value: pending,  color: 'text-amber-600',   bg: 'bg-amber-50'   },
          { label: 'Onaylandı',  value: approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Reddedildi', value: rejected, color: 'text-red-600',     bg: 'bg-red-50'     },
        ].map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Yeni istek — proje seç */}
      {projects.length > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-violet-900">Yeni istek göndermek ister misiniz?</p>
            <p className="text-xs text-violet-600 mt-0.5">İstekler proje bazlı gönderilir — ilgili proje detayına gidin.</p>
          </div>
          <Link
            to={projects.length === 1 ? `/client-portal/projects/${projects[0].id}?tab=requests` : '/client-portal/projects'}
            className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {projects.length === 1 ? 'İstek Gönder' : 'Proje Seç'}
          </Link>
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key || 'all'}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">
            {activeTab ? STATUS_MAP[activeTab]?.label ?? 'İstekler' : 'Tüm İstekler'}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {filtered.length} istek
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-violet-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-slate-400 text-sm">
            {projects.length === 0
              ? 'Henüz size atanmış proje yok.'
              : activeTab === 'Pending'
                ? 'İncelemede bekleyen istek yok.'
                : 'Bu filtrede istek bulunamadı.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {filtered.map((r) => {
              const s = STATUS_MAP[r.status] ?? STATUS_MAP.Pending;
              const Icon = s.icon;
              return (
                <li key={r.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.originalMessage}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
                            {s.label}
                          </span>
                          <Icon size={14} className={
                            r.status === 'Approved' ? 'text-emerald-500'
                              : r.status === 'Rejected' ? 'text-red-400'
                              : 'text-amber-500'
                          } />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {r.projectName} · {formatDate(r.requestedAt)}
                      </p>
                      <Link
                        to={`/client-portal/projects/${r.projectId}`}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-violet-600 hover:text-violet-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Projeye Git
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
