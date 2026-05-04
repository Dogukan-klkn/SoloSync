import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { useCreateInvoice, useUpdateInvoice } from '../../hooks/useInvoices';

export default function InvoiceModal({ invoice, onClose }) {
  const isEdit = !!invoice;
  const { data: customers = [] } = useCustomers();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [customerId, setCustomerId] = useState(invoice?.customerId || '');
  const [issueDate, setIssueDate] = useState(invoice?.issueDate?.split('T')[0] || today);
  const [dueDate, setDueDate] = useState(invoice?.dueDate?.split('T')[0] || nextMonth);
  const [items, setItems] = useState(
    invoice?.items?.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })) ||
    [{ description: '', quantity: 1, unitPrice: 0 }]
  );
  const [error, setError] = useState('');

  const total = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!customerId) { setError('Müşteri seçimi zorunludur.'); return; }

    const payload = { customerId, issueDate, dueDate, items };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: invoice.id, data: { customerId, issueDate, dueDate, status: invoice.statusValue } });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Fatura Düzenle' : 'Yeni Fatura'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Müşteri seçin...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Tarihi</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Son Ödeme Tarihi</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          {!isEdit && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Fatura Kalemleri</label>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                  <Plus size={14} /> Kalem Ekle
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      placeholder="Açıklama"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      className="col-span-6 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="number" min="0.01" step="0.01" placeholder="Adet"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="number" min="0" step="0.01" placeholder="Birim Fiyat"
                      value={item.unitPrice}
                      onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                      className="col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button type="button" onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="col-span-1 p-2 text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">
                  Toplam: ₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              İptal
            </button>
            <button type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {createMutation.isPending || updateMutation.isPending ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
