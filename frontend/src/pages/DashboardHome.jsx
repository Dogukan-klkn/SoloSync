import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Play, Briefcase, FileText, AlertCircle, Clock,
  TrendingUp, ChevronRight, Zap, Star, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useProjects, useAllProjectTasks } from '../hooks/useProjects';
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

const STATUS_LABELS = { Pending: 'Beklemede', InProgress: 'Devam Ediyor', InRevision: 'Revizyon', Completed: 'Tamamlandı' };
const STATUS_BAR    = { Pending: 'bg-amber-400', InProgress: 'bg-brand-500', InRevision: 'bg-purple-400', Completed: 'bg-green-500' };
const STATUS_BADGE  = { Pending: 'bg-amber-50 text-amber-700', InProgress: 'bg-blue-50 text-blue-700', InRevision: 'bg-purple-50 text-purple-700', Completed: 'bg-green-50 text-green-700' };
const INV_STATUS    = { Draft: 'bg-gray-100 text-gray-600', Sent: 'bg-blue-100 text-blue-700', Paid: 'bg-green-100 text-green-700', Overdue: 'bg-red-100 text-red-700', ClientApproved: 'bg-emerald-100 text-emerald-700', RevisionRequested: 'bg-orange-100 text-orange-700' };
const INV_LABELS    = { Draft: 'Taslak', Sent: 'Gönderildi', Paid: 'Ödendi', Overdue: 'Gecikmiş', ClientApproved: 'Onaylandı', RevisionRequested: 'Revizyon' };
const TASK_STATUS   = { Todo: 'Yapılacak', InProgress: 'Devam Ediyor', Done: 'Tamamlandı' };
const TASK_COL_STYLE = {
  Todo:       { header: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400', count: 'bg-gray-200 text-gray-700' },
  InProgress: { header: 'bg-blue-50 text-blue-700',  dot: 'bg-blue-500', count: 'bg-blue-100 text-blue-700' },
  Done:       { header: 'bg-green-50 text-green-700', dot: 'bg-green-500', count: 'bg-green-100 text-green-700' },
};

// ─── KPI Kart ────────────────────────────────────────────────
function KpiCard({ icon: Icon, iconBg, iconColor, value, label, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${onClick ? 'cursor-pointer hover:border-brand-200 transition-colors' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────
export default function DashboardHome() {
  const navigate = useNavigate();
  const { data: projects = [] }    = useProjects();
  const { data: allInvoices = [] } = useInvoices();
  const { data: allTasks = [] }    = useAllProjectTasks();
  const { data: running }          = useRunningEntry();
  const { from, to }               = useMemo(todayISO, []);
  const { data: todaySummary }     = useTimeSummary({ from, to });

  // ─── KPI hesaplamaları
  const activeProjects  = projects.filter(p => p.status === 'InProgress').length;
  const pendingRevenue  = allInvoices.filter(i => i.status === 'Sent').reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  const paidThisMonth   = useMemo(() => {
    const now = new Date();
    return allInvoices
      .filter(i => i.status === 'Paid' && i.paidAt && new Date(i.paidAt).getMonth() === now.getMonth() && new Date(i.paidAt).getFullYear() === now.getFullYear())
      .reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  }, [allInvoices]);
  const overdueCount    = allInvoices.filter(i => i.status === 'Overdue').length;
  const totalProjects   = projects.length;

  // ─── Son 5 fatura
  const recentInvoices = useMemo(() => [...allInvoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [allInvoices]);

  // ─── Son aktivite (son 5 güncellenen proje veya fatura)
  const recentActivity = useMemo(() => {
    const items = [
      ...projects.map(p => ({ type: 'project', label: p.name, sub: STATUS_LABELS[p.status] || p.status, date: new Date(p.updatedAt || p.createdAt), id: p.id })),
      ...allInvoices.map(i => ({ type: 'invoice', label: `#${i.invoiceNumber}`, sub: INV_LABELS[i.status] || i.status, date: new Date(i.updatedAt || i.createdAt), id: i.id })),
    ];
    return items.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [projects, allInvoices]);

  // ─── Takılan işler (Pending durumundaki görevler)
  const blockedTasks = useMemo(() => allTasks.filter(t => t.status === 'Todo').slice(0, 4), [allTasks]);

  // ─── Haftalık kazanç grafiği (son 6 hafta)
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i * 7 - start.getDay() + 1); start.setHours(0, 0, 0, 0);
      const end   = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
      const total = allInvoices
        .filter(inv => inv.status === 'Paid' && inv.paidAt && new Date(inv.paidAt) >= start && new Date(inv.paidAt) <= end)
        .reduce((s, inv) => s + Number(inv.totalAmount || 0), 0);
      weeks.push({ label: `H${6 - i}`, total });
    }
    return weeks;
  }, [allInvoices]);

  // ─── Aylık kazanç (son 3 ay)
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(); const m = d.getMonth();
      const total = allInvoices
        .filter(inv => inv.status === 'Paid' && inv.paidAt && new Date(inv.paidAt).getMonth() === m && new Date(inv.paidAt).getFullYear() === y)
        .reduce((s, inv) => s + Number(inv.totalAmount || 0), 0);
      months.push({ label: d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }), total });
    }
    return months;
  }, [allInvoices]);

  // ─── Task Board grupları
  const taskGroups = useMemo(() => {
    const groups = { Todo: [], InProgress: [], Done: [] };
    allTasks.forEach(t => {
      if (groups[t.status]) groups[t.status].push(t);
    });
    return groups;
  }, [allTasks]);

  // ─── SoloSync Önerileri
  const suggestions = useMemo(() => {
    const list = [];
    if (overdueCount > 0) list.push({ icon: AlertCircle, color: 'text-red-500', text: `${overdueCount} gecikmiş fatura var — hemen takip et` });
    const pendingTasks = allTasks.filter(t => t.status === 'Todo').length;
    if (pendingTasks > 5) list.push({ icon: Zap, color: 'text-amber-500', text: `${pendingTasks} bekleyen görev var — önceliklendirmeyi gözden geçir` });
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    if (completedProjects > 0 && allInvoices.filter(i => i.status === 'Draft').length > 0)
      list.push({ icon: FileText, color: 'text-blue-500', text: 'Taslak faturalarını göndermeyi unutma' });
    if (list.length === 0) list.push({ icon: Star, color: 'text-green-500', text: 'Harika! Tüm işler yolunda gözüküyor' });
    return list.slice(0, 3);
  }, [overdueCount, allTasks, projects, allInvoices]);

  return (
    <div className="space-y-6">
      {/* ── Başlık + Aksiyonlar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/dashboard/invoices')}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            <FileText size={15} /> Yeni Fatura
          </button>
          <button onClick={() => navigate('/dashboard/projects')}
            className="flex items-center gap-2 bg-brand-600 text-white rounded-xl px-3 py-2 text-sm font-medium hover:bg-brand-700 transition-colors">
            <Plus size={15} /> Yeni Proje
          </button>
        </div>
      </div>

      {/* ── KPI Kartları ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Briefcase}    iconBg="bg-blue-50"   iconColor="text-blue-600"   value={activeProjects} label="Aktif Projeler"         onClick={() => navigate('/dashboard/projects')} />
        <KpiCard icon={FileText}     iconBg="bg-amber-50"  iconColor="text-amber-600"  value={formatCurrency(pendingRevenue)} label="Bekleyen Gelir" onClick={() => navigate('/dashboard/invoices')} />
        <KpiCard icon={TrendingUp}   iconBg="bg-green-50"  iconColor="text-green-600"  value={formatCurrency(paidThisMonth)}  label="Bu Ay Kazanılan" />
        <KpiCard icon={Clock}        iconBg="bg-brand-50"  iconColor="text-brand-600"  value={formatDuration(todaySummary?.totalSeconds)} label="Bugünkü Çalışma" onClick={() => navigate('/dashboard/time-tracker')} />
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

        {/* Haftalık Kazanç */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Haftalık Kazanç</h2>
          <p className="text-xs text-gray-400 mb-4">Son 6 hafta (ödenen faturalar)</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
              <Tooltip formatter={(v) => formatCurrency(v)} labelStyle={{ fontSize: 11 }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Aylık Kazanç */}
          <div className="mt-4 border-t border-gray-50 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Aylık Kazanç</p>
            <div className="space-y-1.5">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{m.label}</span>
                  <span className="text-xs font-semibold text-gray-800">{formatCurrency(m.total)}</span>
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
          {/* Son Aktivite */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Son Aktivite</h2>
            <div className="space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">Aktivite yok.</p>
              ) : recentActivity.map((item, i) => (
                <div key={i} onClick={() => navigate(item.type === 'project' ? `/dashboard/projects/${item.id}` : `/dashboard/invoices/${item.id}`)}
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

          {/* SoloSync Önerileri */}
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

      {/* ── Task Board + Takılan İşler + Zaman Takibi ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Board */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Task Board</h2>
            <button onClick={() => navigate('/dashboard/projects')} className="text-xs text-brand-600 hover:underline flex items-center gap-1">Projeler <ChevronRight size={12} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Todo', 'InProgress', 'Done'].map(col => {
              const st = TASK_COL_STYLE[col];
              const tasks = taskGroups[col] || [];
              return (
                <div key={col}>
                  <div className={`flex items-center justify-between px-2 py-1.5 rounded-lg mb-2 ${st.header}`}>
                    <span className="text-xs font-semibold">{TASK_STATUS[col]}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${st.count}`}>{tasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasks.slice(0, 4).map(t => (
                      <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
                        <p className="text-xs font-medium text-gray-800 leading-snug mb-1.5">{t.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 truncate">{t.projectName}</p>
                          {t.tags?.[0] && (
                            <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-medium shrink-0 ml-1">{t.tags[0]}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="border-2 border-dashed border-gray-100 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-300">Boş</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Takılan İşler + Zaman Takibi */}
        <div className="space-y-4">
          {/* Takılan İşler */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Takılan İşler</h2>
              {blockedTasks.length > 0 && <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">{blockedTasks.length}</span>}
            </div>
            {blockedTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Takılan iş yok 🎉</p>
            ) : (
              <div className="space-y-2">
                {blockedTasks.map(t => (
                  <div key={t.id} className="flex items-start gap-2 bg-red-50 rounded-lg p-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-800">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.projectName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <button onClick={() => navigate('/dashboard/time-tracker')}
                  className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-gray-600 rounded-lg py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Play size={12} /> Süre Başlat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
