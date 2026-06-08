import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Play, Briefcase, FileText, AlertCircle, Clock,
  TrendingUp, ChevronRight, Zap, Star, ArrowRight, CheckCircle2,
  ChevronDown, Layers,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useProjects } from '../hooks/useProjects';
import { useProjectTasks } from '../hooks/useProjectTasks';
import { useInvoices } from '../hooks/useInvoices';
import { useTimeSummary, useRunningEntry } from '../hooks/useTimeEntries';

// ─── Yardımcılar ─────────────────────────────────────────────
function formatCurrency(v) {
  return `₺${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`;
}
function formatDuration(seconds) {
  if (!seconds) return '0sa';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
}
function todayISO() {
  const d = new Date();
  return {
    from: new Date(d.setHours(0, 0, 0, 0)).toISOString(),
    to:   new Date(d.setHours(23, 59, 59, 999)).toISOString(),
  };
}

// Ödenen fatura için son ödeme tarihini bul
// Invoice içindeki payments dizisinden en son paymentDate'i döner
function getLastPaymentDate(invoice) {
  if (!invoice.payments || invoice.payments.length === 0) {
    // Payments yoksa createdAt'i fallback olarak kullan
    return invoice.createdAt ? new Date(invoice.createdAt) : null;
  }
  return invoice.payments
    .map(p => new Date(p.paymentDate))
    .reduce((latest, d) => d > latest ? d : latest, new Date(0));
}

const STATUS_LABELS = { Pending: 'Beklemede', InProgress: 'Devam Ediyor', InRevision: 'Revizyon', Completed: 'Tamamlandı' };
const STATUS_BAR    = { Pending: 'bg-amber-400', InProgress: 'bg-brand-500', InRevision: 'bg-purple-400', Completed: 'bg-green-500' };
const INV_STATUS    = { Draft: 'bg-gray-100 text-gray-600', Sent: 'bg-blue-100 text-blue-700', Paid: 'bg-green-100 text-green-700', Overdue: 'bg-red-100 text-red-700', ClientApproved: 'bg-emerald-100 text-emerald-700', RevisionRequested: 'bg-orange-100 text-orange-700' };
const INV_LABELS    = { Draft: 'Taslak', Sent: 'Gönderildi', Paid: 'Ödendi', Overdue: 'Gecikmiş', ClientApproved: 'Onaylandı', RevisionRequested: 'Revizyon' };

const TASK_COL_STYLE = {
  Todo:       { header: 'bg-gray-100 text-gray-700',  dot: 'bg-gray-400',  count: 'bg-gray-200 text-gray-700',  label: 'Yapılacak' },
  InProgress: { header: 'bg-blue-50 text-blue-700',   dot: 'bg-blue-500',  count: 'bg-blue-100 text-blue-700',  label: 'Devam Ediyor' },
  Done:       { header: 'bg-green-50 text-green-700', dot: 'bg-green-500', count: 'bg-green-100 text-green-700', label: 'Tamamlandı' },
};

// ─── KPI Kart ────────────────────────────────────────────────
function KpiCard({ icon: Icon, iconBg, iconColor, value, label, onClick, highlight }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-colors ${
        highlight ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'
      } ${onClick ? 'cursor-pointer hover:border-brand-200' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// ─── Task Board — Proje Seçimli ───────────────────────────────
function TaskBoard({ projects }) {
  const activeProjects = projects.filter(p => p.status === 'InProgress' || p.status === 'Pending');
  const [selectedId, setSelectedId] = useState(() => activeProjects[0]?.id ?? null);
  const navigate = useNavigate();

  // Seçilen proje değiştiğinde güncelle (ilk yüklemede otomatik seçim)
  const effectiveId = selectedId ?? activeProjects[0]?.id ?? null;
  const selectedProject = projects.find(p => p.id === effectiveId);

  const { data: tasks = [], isLoading } = useProjectTasks(effectiveId);

  const taskGroups = useMemo(() => {
    const groups = { Todo: [], InProgress: [], Done: [] };
    tasks.forEach(t => {
      const key = t.status === 'Review' ? 'InProgress' : t.status;
      if (groups[key]) groups[key].push(t);
    });
    return groups;
  }, [tasks]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      {/* Başlık + Proje Seçici */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-brand-500" />
          <h2 className="font-semibold text-gray-900">Task Board</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Proje Dropdown */}
          {activeProjects.length > 0 ? (
            <div className="relative">
              <select
                value={effectiveId ?? ''}
                onChange={e => setSelectedId(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {activeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <span className="text-xs text-gray-400">Aktif proje yok</span>
          )}
          {effectiveId && (
            <button
              onClick={() => navigate(`/dashboard/projects/${effectiveId}/kanban`)}
              className="text-xs text-brand-600 hover:underline flex items-center gap-0.5"
            >
              Kanban <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Proje özeti */}
      {selectedProject && (
        <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{selectedProject.customerName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${selectedProject.progressPercentage ?? 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 shrink-0">{selectedProject.progressPercentage ?? 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Kolonlar */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-gray-400 text-sm">Yükleniyor...</div>
      ) : !effectiveId ? (
        <div className="text-center py-8 text-gray-400 text-sm">Proje seçin</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {['Todo', 'InProgress', 'Done'].map(col => {
            const st = TASK_COL_STYLE[col];
            const colTasks = taskGroups[col] || [];
            return (
              <div key={col}>
                <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg mb-2 ${st.header}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className="text-xs font-semibold">{st.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${st.count}`}>{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.slice(0, 5).map(t => (
                    <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 hover:border-brand-200 hover:bg-brand-50/20 transition-colors cursor-default">
                      <p className="text-xs font-medium text-gray-800 leading-snug mb-1.5 line-clamp-2">{t.title}</p>
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        {t.tags?.[0] && (
                          <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-medium">
                            {t.tags[0].label ?? t.tags[0]}
                          </span>
                        )}
                        {col === 'Done' && (
                          <CheckCircle2 size={12} className="text-green-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-300">Boş</p>
                    </div>
                  )}
                  {colTasks.length > 5 && (
                    <p className="text-center text-xs text-gray-400">+{colTasks.length - 5} daha</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────
export default function DashboardHome() {
  const navigate = useNavigate();
  const { data: projects = [] }    = useProjects();
  const { data: allInvoices = [] } = useInvoices();
  const { data: running }          = useRunningEntry();
  const { from, to }               = useMemo(todayISO, []);
  const { data: todaySummary }     = useTimeSummary({ from, to });

  // ─── KPI hesaplamaları
  const activeProjects  = projects.filter(p => p.status === 'InProgress').length;

  // Bekleyen gelir: Sent + Overdue + ClientApproved (henüz ödenmemiş)
  const pendingRevenue = useMemo(() =>
    allInvoices
      .filter(i => i.status === 'Sent' || i.status === 'Overdue' || i.status === 'ClientApproved')
      .reduce((s, i) => s + Number(i.totalAmount || 0), 0),
    [allInvoices]
  );

  // Bu ay kazanılan: status=Paid VE son ödeme bu ay olan faturalar
  const paidThisMonth = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();
    return allInvoices
      .filter(i => i.status === 'Paid')
      .filter(i => {
        const payDate = getLastPaymentDate(i);
        if (!payDate) return false;
        return payDate.getMonth() === thisMonth && payDate.getFullYear() === thisYear;
      })
      .reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  }, [allInvoices]);

  const overdueCount  = allInvoices.filter(i => i.status === 'Overdue').length;

  // ─── Son 5 fatura
  const recentInvoices = useMemo(() =>
    [...allInvoices]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5),
    [allInvoices]
  );

  // ─── Son aktivite
  const recentActivity = useMemo(() => {
    const items = [
      ...projects.map(p => ({ type: 'project', label: p.name, sub: STATUS_LABELS[p.status] || p.status, date: new Date(p.updatedAt || p.createdAt), id: p.id })),
      ...allInvoices.map(i => ({ type: 'invoice', label: `#${i.invoiceNumber}`, sub: INV_LABELS[i.status] || i.status, date: new Date(i.updatedAt || i.createdAt), id: i.id })),
    ];
    return items.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [projects, allInvoices]);

  // ─── Haftalık kazanç (son 6 hafta, Paid faturalar — payments dizisinden tarih)
  const weeklyData = useMemo(() => {
    const weeks = [];
    const paidInvoices = allInvoices.filter(i => i.status === 'Paid');
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7 - start.getDay() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const total = paidInvoices
        .filter(inv => {
          const d = getLastPaymentDate(inv);
          return d && d >= start && d <= end;
        })
        .reduce((s, inv) => s + Number(inv.totalAmount || 0), 0);

      weeks.push({ label: `H${6 - i}`, total });
    }
    return weeks;
  }, [allInvoices]);

  // ─── Aylık kazanç (son 3 ay)
  const monthlyData = useMemo(() => {
    const months = [];
    const paidInvoices = allInvoices.filter(i => i.status === 'Paid');
    for (let i = 2; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const total = paidInvoices
        .filter(inv => {
          const pd = getLastPaymentDate(inv);
          return pd && pd.getMonth() === m && pd.getFullYear() === y;
        })
        .reduce((s, inv) => s + Number(inv.totalAmount || 0), 0);
      months.push({ label: d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }), total });
    }
    return months;
  }, [allInvoices]);

  // ─── SoloSync Önerileri
  const suggestions = useMemo(() => {
    const list = [];
    if (overdueCount > 0) list.push({ icon: AlertCircle, color: 'text-red-500', text: `${overdueCount} gecikmiş fatura var — hemen takip et` });
    const draftCount = allInvoices.filter(i => i.status === 'Draft').length;
    if (draftCount > 0) list.push({ icon: FileText, color: 'text-blue-500', text: `${draftCount} taslak fatura gönderilmeyi bekliyor` });
    const pendingCount = allInvoices.filter(i => i.status === 'Sent' || i.status === 'ClientApproved').length;
    if (pendingCount > 0) list.push({ icon: Zap, color: 'text-amber-500', text: `${pendingCount} fatura ödeme bekliyor` });
    if (list.length === 0) list.push({ icon: Star, color: 'text-green-500', text: 'Harika! Tüm işler yolunda gözüküyor 🎉' });
    return list.slice(0, 3);
  }, [overdueCount, allInvoices]);

  return (
    <div className="space-y-6">
      {/* ── Başlık + Aksiyonlar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard/invoices')}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <FileText size={15} /> Yeni Fatura
          </button>
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="flex items-center gap-2 bg-brand-600 text-white rounded-xl px-3 py-2 text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus size={15} /> Yeni Proje
          </button>
        </div>
      </div>

      {/* ── KPI Kartları ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Briefcase} iconBg="bg-blue-50" iconColor="text-blue-600"
          value={activeProjects} label="Aktif Projeler"
          onClick={() => navigate('/dashboard/projects')}
        />
        <KpiCard
          icon={FileText} iconBg="bg-amber-50" iconColor="text-amber-600"
          value={formatCurrency(pendingRevenue)} label="Bekleyen Gelir"
          highlight={pendingRevenue > 0}
          onClick={() => navigate('/dashboard/invoices')}
        />
        <KpiCard
          icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600"
          value={formatCurrency(paidThisMonth)} label="Bu Ay Kazanılan"
        />
        <KpiCard
          icon={Clock} iconBg="bg-brand-50" iconColor="text-brand-600"
          value={formatDuration(todaySummary?.totalSeconds)} label="Bugünkü Çalışma"
          onClick={() => navigate('/dashboard/time-tracker')}
        />
      </div>

      {/* ── Orta Satır: Aktif Projeler + Haftalık Kazanç ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Aktif Projeler */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Aktif Projeler</h2>
            <button onClick={() => navigate('/dashboard/projects')} className="text-xs text-brand-600 hover:underline flex items-center gap-1">Tümü <ChevronRight size={12} /></button>
          </div>
          {projects.filter(p => p.status === 'InProgress').length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aktif proje yok.</p>
          ) : (
            <div className="space-y-3">
              {projects.filter(p => p.status === 'InProgress').slice(0, 4).map(p => (
                <div key={p.id} onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                  className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600">{p.name}</p>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">{p.progressPercentage ?? 0}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1.5">{p.customerName}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${STATUS_BAR[p.status] || 'bg-gray-300'}`} style={{ width: `${p.progressPercentage ?? 0}%` }} />
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Haftalık + Aylık Kazanç */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Haftalık Kazanç</h2>
          <p className="text-xs text-gray-400 mb-4">Son 6 hafta · ödenen faturalar</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip
                formatter={v => [formatCurrency(v), 'Kazanç']}
                labelStyle={{ fontSize: 11 }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {weeklyData.every(w => w.total === 0) && (
            <p className="text-center text-xs text-gray-300 mt-1 mb-2">Henüz ödeme kaydı yok</p>
          )}

          <div className="mt-4 border-t border-gray-50 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Aylık Kazanç</p>
            <div className="space-y-1.5">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{m.label}</span>
                  <span className={`text-xs font-semibold ${m.total > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {formatCurrency(m.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alt Satır: Son Faturalar + Son Aktivite ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Son Faturalar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Son Faturalar</h2>
            <button onClick={() => navigate('/dashboard/invoices')} className="text-xs text-brand-600 hover:underline flex items-center gap-1">Tümü <ChevronRight size={12} /></button>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Fatura yok.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentInvoices.map(inv => (
                <div key={inv.id} onClick={() => navigate(`/dashboard/invoices/${inv.id}`)}
                  className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">{inv.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INV_STATUS[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {INV_LABELS[inv.status] || inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son Aktivite + SoloSync Önerileri */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Son Aktivite</h2>
            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Aktivite yok.</p>
              ) : recentActivity.map((item, i) => (
                <div key={i}
                  onClick={() => navigate(item.type === 'project' ? `/dashboard/projects/${item.id}` : `/dashboard/invoices/${item.id}`)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 -mx-1 px-1 py-1 rounded-lg transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.type === 'project' ? 'bg-brand-400' : 'bg-green-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">SoloSync Önerileri</h2>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <s.icon size={14} className={`${s.color} mt-0.5 shrink-0`} />
                  <p className="text-xs text-gray-600">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Task Board + Zaman Takibi ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Board — Proje Bazlı */}
        <div className="lg:col-span-2">
          <TaskBoard projects={projects} />
        </div>

        {/* Zaman Takibi Bugün */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Zaman Takibi</h2>
            <button onClick={() => navigate('/dashboard/time-tracker')} className="text-xs text-brand-600 hover:underline">Detay</button>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-brand-600 mb-1">
              {formatDuration(todaySummary?.totalSeconds)}
            </div>
            <p className="text-xs text-gray-400 mb-3">Bugün çalışılan süre</p>
            {running ? (
              <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium bg-green-50 rounded-lg px-3 py-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {running.taskTitle || 'Kronometre çalışıyor'}
              </div>
            ) : (
              <button
                onClick={() => navigate('/dashboard/time-tracker')}
                className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-gray-600 rounded-lg py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <Play size={12} /> Süre Başlat
              </button>
            )}
          </div>

          {/* Hızlı istatistik */}
          <div className="mt-4 border-t border-gray-50 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Toplam fatura</span>
              <span className="text-xs font-semibold text-gray-800">{allInvoices.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Ödendi</span>
              <span className="text-xs font-semibold text-green-600">{allInvoices.filter(i => i.status === 'Paid').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Beklemede</span>
              <span className="text-xs font-semibold text-amber-600">{allInvoices.filter(i => i.status === 'Sent' || i.status === 'ClientApproved').length}</span>
            </div>
            {overdueCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-red-500 font-medium">Gecikmiş</span>
                <span className="text-xs font-semibold text-red-600">{overdueCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
