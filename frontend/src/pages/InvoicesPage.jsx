import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useInvoices, useDeleteInvoice } from '../hooks/useInvoices';
import InvoiceModal from '../components/invoices/InvoiceModal';

const STATUS_TABS = [
  { key: '', label: 'Tümü' },
  { key: 'Draft', label: 'Taslak' },
  { key: 'Sent', label: 'Gönderildi' },
  { key: 'ClientApproved', label: 'Onaylandı' },
  { key: 'Paid', label: 'Ödendi' },
  { key: 'Overdue', label: 'Gecikmiş' },
];

const STATUS_STYLES = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  ClientApproved: 'bg-emerald-100 text-emerald-700',
  RevisionRequested: 'bg-orange-100 text-orange-700',
};

const STATUS_LABELS = {
  Draft: 'Taslak',
  Sent: 'Gönderildi',
  Paid: 'Ödendi',
  Overdue: 'Gecikmiş',
  ClientApproved: 'Onaylandı',
  RevisionRequested: 'Revizyon Talebi',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

function formatCurrency(amount) {
  return `₺${Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { data: invoices = [], isLoading } = useInvoices(activeTab || undefined);
  const deleteMutation = useDeleteInvoice();

  const all = useInvoices().data || [];
  const totals = {
    total: all.reduce((s, i) => s + Number(i.totalAmount || 0), 0),
    pending: all.filter(i => i.status === 'Sent').reduce((s, i) => s + Number(i.totalAmount || 0), 0),
    overdue: all.filter(i => i.status === 'Overdue').length,
    draft: all.filter(i => i.status === 'Draft').length,
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Faturayı silmek istediğinize emin misiniz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faturalar</h1>
          <p className="text-sm text-gray-500 mt-1">{all.length} fatura</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Yeni Fatura
        </button>
      </div>

      {/* KPI kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Toplam Tahsilat', value: formatCurrency(totals.total), icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Bekleyen', value: formatCurrency(totals.pending), icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Gecikmiş', value: totals.overdue, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Taslaklar', value: totals.draft, icon: FileText, color: 'text-gray-600 bg-gray-50' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div className="text-xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Henüz fatura yok.</p>
            <button onClick={() => setShowModal(true)}
              className="mt-3 text-brand-600 text-sm font-medium hover:underline">
              İlk faturayı oluştur
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No', 'Müşteri', 'Tarih', 'Vade', 'Tutar', 'Durum', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => {
                const isOverdue = new Date(inv.dueDate) < new Date() && inv.status === 'Sent';
                return (
                  <tr key={inv.id}
                    onClick={() => navigate(`/dashboard/invoices/${inv.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                          {inv.customerName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-800">{inv.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.issueDate)}</td>
                    <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => handleDelete(inv.id, e)}
                        className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <InvoiceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
