import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  ExternalLink, Loader2,
} from 'lucide-react';
import { useAllClientRequests, useReviewClientRequest } from '../hooks/useClientRequests';
import RequestAiHints from '../components/requests/RequestAiHints';

const STATUS_TABS = [
  { key: '', label: 'Tümü' },
  { key: 'Pending', label: 'Beklemede' },
  { key: 'Approved', label: 'Onaylandı' },
  { key: 'Rejected', label: 'Reddedildi' },
];

const STATUS_MAP = {
  Pending:  { label: 'Beklemede',  cls: 'bg-amber-50 text-amber-700',   icon: Clock,         dot: 'bg-amber-400'  },
  Approved: { label: 'Onaylandı',  cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2, dot: 'bg-emerald-500' },
  Rejected: { label: 'Reddedildi', cls: 'bg-red-50 text-red-600',       icon: XCircle,       dot: 'bg-red-400'    },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

export default function RequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [expandedMsg, setExpandedMsg] = useState(null);

  const { data: requests = [], isLoading } = useAllClientRequests(activeTab || undefined);
  const { data: allRequests = [] } = useAllClientRequests();
  const reviewRequest = useReviewClientRequest();

  const pending  = allRequests.filter(r => r.status === 'Pending').length;
  const approved = allRequests.filter(r => r.status === 'Approved').length;
  const rejected = allRequests.filter(r => r.status === 'Rejected').length;

  const handleReview = (id, action) => {
    reviewRequest.mutate({ id, data: { action } });
  };

  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
            <Send size={16} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">İstekler</h1>
            <p className="text-sm text-slate-500">Müşterilerden gelen talep ve revizyon istekleri</p>
          </div>
        </div>
        {pending > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full">
            {pending} bekleyen
          </span>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Beklemede', value: pending,  color: 'text-amber-600',   bg: 'bg-amber-50'   },
          { label: 'Onaylandı', value: approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Reddedildi', value: rejected, color: 'text-red-600',   bg: 'bg-red-50'     },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-white`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtre sekmeleri */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">
            {activeTab ? STATUS_MAP[activeTab]?.label ?? 'İstekler' : 'Tüm İstekler'}
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {requests.length} istek
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-brand-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="px-5 py-16 text-center text-slate-400 text-sm">
            {activeTab === 'Pending'
              ? 'Bekleyen müşteri isteği yok.'
              : 'Bu filtrede istek bulunamadı.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {requests.map(req => {
              const s = STATUS_MAP[req.status] ?? STATUS_MAP.Pending;
              const Icon = s.icon;
              const isPending = req.status === 'Pending';

              return (
                <li key={req.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{req.summarizedTodo}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {req.projectName} · {req.customerName} · {timeAgo(req.requestedAt)}
                          </p>
                          <RequestAiHints request={req} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.cls}`}>
                            {s.label}
                          </span>
                          <Icon size={14} className={
                            req.status === 'Approved' ? 'text-emerald-500'
                              : req.status === 'Rejected' ? 'text-red-400'
                              : 'text-amber-500'
                          } />
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedMsg(expandedMsg === req.id ? null : req.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mt-2"
                      >
                        {expandedMsg === req.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expandedMsg === req.id ? 'Orijinal mesajı gizle' : 'Orijinal mesajı göster'}
                      </button>
                      {expandedMsg === req.id && (
                        <div className="bg-slate-50 rounded-xl p-3 mt-2 text-xs text-slate-600 whitespace-pre-wrap">
                          {req.originalMessage}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 flex-wrap">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleReview(req.id, 'approve')}
                              disabled={reviewRequest.isPending}
                              className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'reject')}
                              disabled={reviewRequest.isPending}
                              className="bg-red-500 text-white rounded-lg px-4 py-1.5 text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/dashboard/projects/${req.projectId}/kanban`)}
                          className="flex items-center gap-1 bg-slate-100 text-slate-700 rounded-lg px-4 py-1.5 text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                          <ExternalLink size={12} />
                          Projeye Git
                        </button>
                      </div>
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
