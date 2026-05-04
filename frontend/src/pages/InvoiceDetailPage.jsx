import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useInvoice, useSendInvoice, useClientAction, useAddInvoiceItem, useRemoveInvoiceItem, useAddPayment } from '../hooks/useInvoices';
import CommentSection from '../components/comments/CommentSection';
import { useAuth } from '../store/authStore';

const STATUS_LABELS = {
  Draft: 'Taslak', Sent: 'Gönderildi', Paid: 'Ödendi',
  Overdue: 'Gecikmiş', ClientApproved: 'Onaylandı', RevisionRequested: 'Revizyon Talebi',
};
const STATUS_STYLES = {
  Draft: 'bg-gray-100 text-gray-600', Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700', Overdue: 'bg-red-100 text-red-700',
  ClientApproved: 'bg-emerald-100 text-emerald-700', RevisionRequested: 'bg-orange-100 text-orange-700',
};

function formatDate(d) { return d ? new Date(d).toLocaleDateString('tr-TR') : '-'; }
function formatCurrency(v) { return `₺${Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`; }

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const { data: invoice, isLoading } = useInvoice(id);
  const sendMutation = useSendInvoice();
  const clientActionMutation = useClientAction();
  const addItemMutation = useAddInvoiceItem();
  const removeItemMutation = useRemoveInvoiceItem();
  const addPaymentMutation = useAddPayment();

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 });
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: 0, paymentDate: new Date().toISOString().split('T')[0], method: 1, notes: '' });
  const [revisionNote, setRevisionNote] = useState('');

  if (isLoading) return <div className="p-8 text-center text-gray-400">Yükleniyor...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-400">Fatura bulunamadı.</div>;

  const handleSend = () => sendMutation.mutate(id);
  const handleMarkPaid = () => clientActionMutation.mutate({ id, data: { action: 'mark-paid' } });
  const handleApprove = () => clientActionMutation.mutate({ id, data: { action: 'approve' } });
  const handleRevision = () => clientActionMutation.mutate({ id, data: { action: 'request-revision', note: revisionNote } });
  const handleAddItem = () => {
    addItemMutation.mutate({ id, data: newItem });
    setShowAddItem(false);
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };
  const handleRemoveItem = (itemId) => removeItemMutation.mutate({ id, itemId });
  const handleAddPayment = () => {
    addPaymentMutation.mutate({ id, data: newPayment });
    setShowAddPayment(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/dashboard/invoices')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={16} /> Faturalar
      </button>

      {/* Başlık */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">{invoice.customerName} · {formatDate(invoice.issueDate)}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_STYLES[invoice.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[invoice.status] || invoice.status}
        </span>
      </div>

      {/* Freelancer aksiyonları */}
      {role === 'Freelancer' && (
        <div className="flex gap-3 mb-6">
          {invoice.status === 'Draft' && (
            <button onClick={handleSend} className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-700">
              <Send size={14} /> Gönder
            </button>
          )}
          {invoice.status === 'ClientApproved' && (
            <button onClick={handleMarkPaid} className="flex items-center gap-2 bg-green-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-green-700">
              <CheckCircle size={14} /> Ödendi İşaretle
            </button>
          )}
          {invoice.status === 'RevisionRequested' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm text-orange-700">
              ⚠ Müşteri revizyon talep etti.
            </div>
          )}
        </div>
      )}

      {/* Client aksiyonları */}
      {role === 'Client' && invoice.status === 'Sent' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 space-y-3">
          <p className="text-sm font-medium text-blue-800">Bu faturayı onaylayabilir veya revizyon talep edebilirsiniz.</p>
          <textarea placeholder="Revizyon notu (opsiyonel)" value={revisionNote}
            onChange={e => setRevisionNote(e.target.value)}
            className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm resize-none outline-none" rows={2} />
          <div className="flex gap-3">
            <button onClick={handleApprove} className="bg-green-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-green-700">✓ Onayla</button>
            <button onClick={handleRevision} className="bg-orange-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-orange-600">Revizyon İste</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Kalemler */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Fatura Kalemleri</h2>
              {role === 'Freelancer' && invoice.status === 'Draft' && (
                <button onClick={() => setShowAddItem(!showAddItem)}
                  className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700">
                  <Plus size={14} /> Kalem Ekle
                </button>
              )}
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Açıklama', 'Adet', 'Birim Fiyat', 'Tutar', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.items?.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 text-sm text-gray-800">{item.description}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-2.5">
                      {role === 'Freelancer' && invoice.status === 'Draft' && (
                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showAddItem && (
              <div className="flex gap-2 p-4 border-t border-gray-100">
                <input placeholder="Açıklama" value={newItem.description}
                  onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Adet" value={newItem.quantity}
                  onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Fiyat" value={newItem.unitPrice}
                  onChange={e => setNewItem(p => ({ ...p, unitPrice: e.target.value }))}
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <button onClick={handleAddItem} className="bg-brand-600 text-white rounded-lg px-3 py-2 text-sm">Ekle</button>
              </div>
            )}
            <div className="flex justify-end px-5 py-3 border-t border-gray-100">
              <span className="text-base font-bold text-gray-900">Toplam: {formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>

          {/* Ödemeler */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Ödeme Geçmişi</h2>
              {role === 'Freelancer' && (
                <button onClick={() => setShowAddPayment(!showAddPayment)}
                  className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700">
                  <Plus size={14} /> Ödeme Ekle
                </button>
              )}
            </div>
            {invoice.payments?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Henüz ödeme kaydı yok.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {invoice.payments?.map(p => (
                  <div key={p.id} className="flex justify-between items-center px-5 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{formatCurrency(p.amount)}</div>
                      <div className="text-xs text-gray-400">{p.method} · {formatDate(p.paymentDate)}</div>
                    </div>
                    {p.notes && <span className="text-xs text-gray-400">{p.notes}</span>}
                  </div>
                ))}
              </div>
            )}
            {showAddPayment && (
              <div className="flex flex-wrap gap-2 p-4 border-t border-gray-100">
                <input type="number" placeholder="Tutar" value={newPayment.amount}
                  onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={newPayment.paymentDate}
                  onChange={e => setNewPayment(p => ({ ...p, paymentDate: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Not (opsiyonel)" value={newPayment.notes}
                  onChange={e => setNewPayment(p => ({ ...p, notes: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <button onClick={handleAddPayment} className="bg-green-600 text-white rounded-lg px-3 py-2 text-sm">Kaydet</button>
              </div>
            )}
          </div>
        </div>

        {/* Yorumlar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <CommentSection invoiceId={id} />
        </div>
      </div>
    </div>
  );
}
