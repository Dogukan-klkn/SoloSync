import { Link } from 'react-router-dom';
import { useMyProfile, useMyProjects, useMyInvoices } from '../../hooks/useClientPortal';
import { useAuth } from '../../store/authStore';
import {
  FolderOpen, FileText, CheckCircle2, Clock, AlertTriangle, TrendingUp
} from 'lucide-react';

const statusLabel = {
  Pending:    { text: 'Beklemede',  cls: 'bg-slate-100 text-slate-600' },
  InProgress: { text: 'Devam ediyor', cls: 'bg-blue-100 text-blue-700' },
  InRevision: { text: 'Revizyon', cls: 'bg-amber-100 text-amber-700' },
  Completed:  { text: 'Tamamlandı', cls: 'bg-green-100 text-green-700' },
};

const invoiceStatusLabel = {
  Draft:             { text: 'Taslak',             cls: 'bg-slate-100 text-slate-600' },
  Sent:              { text: 'Onay bekliyor',       cls: 'bg-blue-100 text-blue-700' },
  Paid:              { text: 'Ödendi',              cls: 'bg-green-100 text-green-700' },
  Overdue:           { text: 'Gecikmiş',            cls: 'bg-red-100 text-red-700' },
  ClientApproved:    { text: 'Onaylandı',           cls: 'bg-violet-100 text-violet-700' },
  RevisionRequested: { text: 'Revizyon istendi',    cls: 'bg-amber-100 text-amber-700' },
};

const ClientHomePage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: projects = [] } = useMyProjects();
  const { data: invoices = [] } = useMyInvoices();

  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
  const totalBilled = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
  const recentProjects = [...projects].slice(0, 3);
  const recentInvoices = [...invoices].slice(0, 3);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-slate-600 font-medium">Müşteri profiliniz bulunamadı.</p>
        <p className="text-slate-400 text-sm text-center max-w-sm">
          Freelancer'ınızın sizi sistemde bir müşteri hesabına bağlaması gerekiyor. Lütfen iletişime geçin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hoşgeldin */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Merhaba, {user?.fullName?.split(' ')[0] ?? 'Hoş geldiniz'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {profile.companyName} · {profile.freelancerName} ile çalışıyorsunuz
        </p>
      </div>

      {/* KPI kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Aktif Proje"
          value={activeProjects.length}
          icon={<FolderOpen className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-50"
        />
        <KpiCard
          label="Onay Bekleyen Fatura"
          value={pendingInvoices.length}
          icon={<FileText className="w-5 h-5 text-amber-600" />}
          bg="bg-amber-50"
          alert={pendingInvoices.length > 0}
        />
        <KpiCard
          label="Tamamlanan Proje"
          value={projects.filter(p => p.status === 'Completed').length}
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          bg="bg-green-50"
        />
        <KpiCard
          label="Toplam Fatura"
          value={`₺${totalBilled.toLocaleString('tr-TR')}`}
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          bg="bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son projeler */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Projelerim</h2>
            <Link to="/client-portal/projects" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Tümünü gör →
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Henüz proje yok</div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map(p => {
                const st = statusLabel[p.status] ?? statusLabel.Pending;
                const progress = p.milestoneCount > 0
                  ? Math.round((p.completedMilestoneCount / p.milestoneCount) * 100)
                  : 0;
                return (
                  <Link
                    key={p.id}
                    to={`/client-portal/projects/${p.id}`}
                    className="block p-3 rounded-lg border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-slate-800 line-clamp-1">{p.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${st.cls}`}>
                        {st.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{progress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Son faturalar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Son Faturalar</h2>
            <Link to="/client-portal/invoices" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Tümünü gör →
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">Henüz fatura yok</div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map(inv => {
                const st = invoiceStatusLabel[inv.status] ?? invoiceStatusLabel.Draft;
                return (
                  <Link
                    key={inv.id}
                    to={`/client-portal/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{inv.customerName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-800">
                        ₺{(inv.totalAmount ?? 0).toLocaleString('tr-TR')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                        {st.text}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon, bg, alert }) => (
  <div className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${alert ? 'border-amber-300' : 'border-slate-200'}`}>
    <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

export default ClientHomePage;
