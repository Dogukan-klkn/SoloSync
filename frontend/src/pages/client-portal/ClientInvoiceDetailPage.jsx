import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMyInvoice, useInvoiceAction } from '../../hooks/useClientPortal';
import { useAddComment } from '../../hooks/useComments';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../store/authStore';
import {
  ChevronLeft, CheckCircle2, XCircle, MessageSquare, Send, AlertCircle
} from 'lucide-react';

const invoiceStatus = {
  Draft:             { text: 'Taslak',           cls: 'bg-slate-100 text-slate-600' },
  Sent:              { text: 'Onayınız bekleniyor', cls: 'bg-blue-100 text-blue-700' },
  Paid:              { text: 'Ödendi',            cls: 'bg-green-100 text-green-700' },
  Overdue:           { text: 'Gecikmiş',          cls: 'bg-red-100 text-red-700' },
  ClientApproved:    { text: 'Onayladınız',       cls: 'bg-violet-100 text-violet-700' },
  RevisionRequested: { text: 'Revizyon istendi',  cls: 'bg-amber-100 text-amber-700' },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const formatAmount = (n) => `₺${(n ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ClientInvoiceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { data: invoice, isLoading } = useMyInvoice(id);
  const invoiceAction = useInvoiceAction();
  const { data: comments = [] } = useComments({ invoiceId: id });
  const addComment = useAddComment(null, id);

  const handleApprove = async () => {
    if (!window.confirm('Bu faturayı onaylamak istediğinize emin misiniz?')) return;
    await invoiceAction.mutateAsync({ id, action: 'approve' });
  };

  const handleRevision = async (e) => {
    e.preventDefault();
    await invoiceAction.mutateAsync({ id, action: 'request-revision', notes: revisionNotes });
    setShowRevisionForm(false);
    setRevisionNotes('');
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate({ content: commentText.trim(), invoiceId: id });
    setCommentText('');
  };

  if (isLoading) return <div className="text-center py-20 text-slate-400">Yükleniyor...</div>;
  if (!invoice) return <div className="text-center py-20 text-slate-500">Fatura bulunamadı.</div>;

  const st = invoiceStatus[invoice.status] ?? invoiceStatus.Draft;
  const isActionable = invoice.status === 'Sent';
  const totalPaid = invoice.payments?.reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0;
  const remaining = (invoice.totalAmount ?? 0) - totalPaid;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link to="/client-portal/invoices" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronLeft className="w-4 h-4" /> Faturalarım
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{invoice.invoiceNumber}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>{st.text}</span>
            </div>
            <p className="text-sm text-slate-500">
              Düzenlenme: {formatDate(invoice.issueDate)} · Son ödeme: {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-800">{formatAmount(invoice.totalAmount)}</p>
            {totalPaid > 0 && remaining > 0 && (
              <p className="text-xs text-slate-400 mt-1">Kalan: {formatAmount(remaining)}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {isActionable && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Bu fatura onayınızı bekliyor. Onayladıktan sonra freelancer'ınız ödeme sürecini başlatacaktır.
            </div>
            {!showRevisionForm ? (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={invoiceAction.isPending}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Faturayı Onayla
                </button>
                <button
                  onClick={() => setShowRevisionForm(true)}
                  className="flex items-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Revizyon İste
                </button>
              </div>
            ) : (
              <form onSubmit={handleRevision} className="space-y-3">
                <textarea
                  value={revisionNotes}
                  onChange={e => setRevisionNotes(e.target.value)}
                  rows={3}
                  placeholder="Revizyon nedeninizi açıklayın (opsiyonel)..."
                  className="w-full border border-amber-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={invoiceAction.isPending}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {invoiceAction.isPending ? 'Gönderiliyor...' : 'Revizyon Gönder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(false)}
                    className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Kalemler */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Fatura Kalemleri</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-slate-500 font-medium">Açıklama</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Miktar</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Birim</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-medium">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoice.items?.map(item => (
                  <tr key={item.id}>
                    <td className="px-5 py-3.5 text-slate-700">{item.description}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{formatAmount(item.unitPrice)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">{formatAmount(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-right font-semibold text-slate-700">Toplam</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800">{formatAmount(invoice.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ödeme geçmişi */}
          {invoice.payments?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Ödeme Geçmişi</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm text-slate-700">{p.method}</p>
                      {p.notes && <p className="text-xs text-slate-400">{p.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">{formatAmount(p.amount)}</p>
                      <p className="text-xs text-slate-400">{formatDate(p.paymentDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Yorumlar */}
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col">
          <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Yorumlar</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-80">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">Henüz yorum yok</div>
            ) : comments.map(c => (
              <div key={c.id} className={`flex gap-2.5 ${c.userId === user?.id ? 'flex-row-reverse' : ''}`}>
                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.authorFullName?.[0] ?? '?'}
                </div>
                <div className={`flex flex-col max-w-[180px] ${c.userId === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3 py-2 rounded-xl text-xs ${
                    c.userId === user?.id
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-700 rounded-tl-sm'
                  }`}>
                    {c.content}
                  </div>
                  <span className="text-xs text-slate-400 mt-0.5">{c.authorFullName}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Yorum yaz..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || addComment.isPending}
                className="bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInvoiceDetailPage;
