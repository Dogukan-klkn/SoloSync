// src/pages/RequestsPage.jsx
import { Send, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

const MOCK_REQUESTS = [
  { id: 1, title: 'Anasayfa tasarım revizyonu', project: 'E-Ticaret Projesi', client: 'Acme A.Ş.', date: '2025-05-20', status: 'pending',  note: 'Logonun daha büyük olmasını istiyoruz.' },
  { id: 2, title: 'Mobil uyumluluk iyileştirmesi', project: 'Kurumsal Web Sitesi', client: 'Beta Ltd.', date: '2025-05-18', status: 'approved', note: '' },
  { id: 3, title: 'Ödeme entegrasyonu hatası', project: 'E-Ticaret Projesi', client: 'Acme A.Ş.', date: '2025-05-15', status: 'rejected', note: 'Kapsam dışı.' },
];

const STATUS_MAP = {
  pending:  { label: 'Beklemede',  cls: 'bg-amber-50 text-amber-700',   icon: Clock,         dot: 'bg-amber-400'  },
  approved: { label: 'Onaylandı', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2, dot: 'bg-emerald-500' },
  rejected: { label: 'Reddedildi', cls: 'bg-red-50 text-red-600',       icon: XCircle,       dot: 'bg-red-400'    },
};

export default function RequestsPage() {
  const pending  = MOCK_REQUESTS.filter(r => r.status === 'pending').length;
  const approved = MOCK_REQUESTS.filter(r => r.status === 'approved').length;
  const rejected = MOCK_REQUESTS.filter(r => r.status === 'rejected').length;

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
        <span className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full">
          Yakında
        </span>
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

      {/* Coming-soon banner */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageSquare size={22} className="text-brand-600" />
        </div>
        <div>
          <p className="font-semibold text-brand-900 mb-0.5">İstekler modülü geliştiriliyor</p>
          <p className="text-sm text-brand-700">
            Müşterilerinizin proje revizyonlarını ve yeni taleplerini buradan yönetebileceksiniz.
            Bu özellik yakında aktif olacak.
          </p>
        </div>
      </div>

      {/* Örnek liste */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Örnek Kayıtlar (Demo)</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{MOCK_REQUESTS.length} istek</span>
        </div>
        <ul className="divide-y divide-slate-50">
          {MOCK_REQUESTS.map(r => {
            const s = STATUS_MAP[r.status];
            const Icon = s.icon;
            return (
              <li key={r.id} className="px-5 py-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-800 truncate">{r.title}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{r.project} · {r.client}</p>
                  {r.note && <p className="text-xs text-slate-500 mt-1 italic">"{r.note}"</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Icon size={14} className={r.status === 'approved' ? 'text-emerald-500' : r.status === 'rejected' ? 'text-red-400' : 'text-amber-500'} />
                  <span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString('tr-TR')}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
