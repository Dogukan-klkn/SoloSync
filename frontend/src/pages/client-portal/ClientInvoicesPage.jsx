import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyInvoices } from '../../hooks/useClientPortal';
import { FileText, ChevronRight, AlertCircle } from 'lucide-react';

const STATUS_TABS = [
  { key: null,              label: 'Tümü' },
  { key: 'Sent',            label: 'Onay Bekliyor' },
  { key: 'ClientApproved',  label: 'Onayladım' },
  { key: 'Paid',            label: 'Ödendi' },
  { key: 'Overdue',         label: 'Gecikmiş' },
];

const invoiceStatus = {
  Draft:             { text: 'Taslak',           cls: 'bg-slate-100 text-slate-600' },
  Sent:              { text: 'Onay bekliyor',     cls: 'bg-blue-100 text-blue-700' },
  Paid:              { text: 'Ödendi',            cls: 'bg-green-100 text-green-700' },
  Overdue:           { text: 'Gecikmiş',          cls: 'bg-red-100 text-red-700' },
  ClientApproved:    { text: 'Onayladım',         cls: 'bg-violet-100 text-violet-700' },
  RevisionRequested: { text: 'Revizyon istendi',  cls: 'bg-amber-100 text-amber-700' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const formatAmount = (n) => `₺${(n ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`;

const ClientInvoicesPage = () => {
  const [activeStatus, setActiveStatus] = useState(null);
  const { data: invoices = [], isLoading } = useMyInvoices(activeStatus);

  const pendingCount = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').length;
  const totalBilled = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);

  if (isLoading) return <div className="text-center py-20 text-slate-400">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faturalarım</h1>
          <p className="text-slate-500 mt-1">Toplam {formatAmount(totalBilled)} · {invoices.length} fatura</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} fatura onayınızı bekliyor
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit flex-wrap">
        {STATUS_TABS.map(t => (
          <button
            key={t.key ?? 'all'}
            onClick={() => setActiveStatus(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeStatus === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <FileText className="w-12 h-12 text-slate-300" />
          <p className="text-slate-500">Bu kategoride fatura bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-slate-500 font-medium">Fatura No</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Proje</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Tarih</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Son Ödeme</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Tutar</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Durum</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => {
                const st = invoiceStatus[inv.status] ?? invoiceStatus.Draft;
                const isActionable = inv.status === 'Sent';
                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-slate-50 transition-colors ${isActionable ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{inv.invoiceNumber}</span>
                      {isActionable && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">Onay bekliyor</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{inv.customerName}</td>
                    <td className="px-4 py-4 text-slate-500">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-800">{formatAmount(inv.totalAmount)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Link to={`/client-portal/invoices/${inv.id}`} className="text-slate-400 hover:text-violet-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientInvoicesPage;
