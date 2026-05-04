// src/pages/CustomersPage.jsx
import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers';
import CustomerModal from '../components/customers/CustomerModal';
import { Search, Plus, Pencil, Trash2, Building2, Mail, Phone } from 'lucide-react';

// ─── Skeleton: tablo satırı animasyonu ──────────────────────────────
function TableSkeleton({ rows = 5 }) {
  return (
    <tbody className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-200 rounded-lg flex-shrink-0" />
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
          </td>
          <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
          <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
          <td className="px-6 py-4"><div className="h-5 w-12 bg-slate-200 rounded-full" /></td>
          <td className="px-6 py-4"><div className="h-4 w-8 bg-slate-100 rounded ml-auto" /></td>
        </tr>
      ))}
    </tbody>
  );
}

export default function CustomersPage() {
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const { data: customers = [], isLoading } = useCustomers(search);
  const deleteMutation = useDeleteCustomer();

  const handleEdit = (customer) => { setEditing(customer); setModalOpen(true); };
  const handleAdd  = ()         => { setEditing(null);     setModalOpen(true); };
  const handleDelete = (id) => {
    setDeleteError('');
    if (confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id, {
        onError: (err) => {
          const msg = err.response?.data?.message || 'Silme işlemi başarısız.';
          setDeleteError(msg);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
          {/* isLoading'de yanlış sayı gösterme */}
          {!isLoading && (
            <p className="text-slate-500 text-sm mt-1">{customers.length} müşteri kayıtlı</p>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-brand-500/30"
        >
          <Plus className="w-4 h-4" />
          Yeni Müşteri
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Şirket, iletişim kişisi veya e-posta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition"
        />
      </div>

      {/* Delete error banner */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>⚠️ {deleteError}</span>
          <button onClick={() => setDeleteError('')} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-6 py-4">Şirket</th>
              <th className="text-left px-6 py-4">İletişim Kişisi</th>
              <th className="text-left px-6 py-4">E-posta</th>
              <th className="text-left px-6 py-4">Telefon</th>
              <th className="text-left px-6 py-4">Proje</th>
              <th className="text-left px-6 py-4">Durum</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>

          {isLoading ? (
            /* Skeleton satırları — "müşteri yok" flash'ı olmaz */
            <TableSkeleton rows={5} />
          ) : customers.length === 0 ? (
            /* Sadece yükleme bittikten sonra boş durum */
            <tbody>
              <tr>
                <td colSpan={7}>
                  <div className="text-center py-16 text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Henüz müşteri yok</p>
                    <p className="text-sm mt-1">Yeni müşteri ekleyin</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-brand-600" />
                      </div>
                      <span className="font-semibold text-slate-800">{c.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.contactName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5" />{c.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      {c.phone ? <><Phone className="w-3.5 h-3.5" />{c.phone}</> : <span className="text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {c.projectCount} proje
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition text-slate-400">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition text-slate-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <CustomerModal
          customer={editing}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
