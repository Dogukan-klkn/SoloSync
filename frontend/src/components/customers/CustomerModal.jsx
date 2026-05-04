// src/components/customers/CustomerModal.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';

const schema = z.object({
  companyName:    z.string().min(1, 'Şirket adı zorunludur').max(100),
  contactName:    z.string().min(1, 'İletişim kişisi zorunludur').max(50),
  email:          z.string().email('Geçerli e-posta giriniz').max(100),
  phone:          z.string().max(20).optional().or(z.literal('')),
  taxNumber:      z.string().max(50).optional().or(z.literal('')),
  billingAddress: z.string().max(250).optional().or(z.literal('')),
  isActive:       z.boolean().optional(),
});

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function CustomerModal({ customer, onClose }) {
  const isEdit = !!customer;
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true },
  });

  useEffect(() => {
    if (customer) reset({ ...customer });
    else reset({ companyName: '', contactName: '', email: '', phone: '', taxNumber: '', billingAddress: '', isActive: true });
  }, [customer, reset]);

  const onSubmit = async (data) => {
    setServerError('');
    const payload = {
      ...data,
      phone:          data.phone || null,
      taxNumber:      data.taxNumber || null,
      billingAddress: data.billingAddress || null,
    };
    try {
      if (isEdit) await update.mutateAsync({ id: customer.id, data: payload });
      else         await create.mutateAsync(payload);
      onClose();
    } catch (err) {
      // Form kapanmaz — hata modal içinde gösterilir
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors ?
          Object.values(err.response.data.errors).flat().join(', ') :
          'İşlem başarısız. Lütfen tekrar deneyin.';
      setServerError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {/* Sunucu hatası */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              ⚠️ {serverError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Şirket Adı *</label>
              <input {...register('companyName')} className={inputCls} placeholder="Acme Corp" />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>İletişim Kişisi *</label>
              <input {...register('contactName')} className={inputCls} placeholder="Ali Yılmaz" />
              {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>E-posta *</label>
            <input {...register('email')} type="email" className={inputCls} placeholder="ali@acme.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Telefon</label>
              <input {...register('phone')} className={inputCls} placeholder="+90 555 000 00 00" />
            </div>
            <div>
              <label className={labelCls}>Vergi No</label>
              <input {...register('taxNumber')} className={inputCls} placeholder="1234567890" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Fatura Adresi</label>
            <textarea {...register('billingAddress')} rows={2} className={`${inputCls} resize-none`} placeholder="Adres..." />
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-brand-500" />
              <span className="text-sm text-slate-700">Müşteri aktif</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium text-sm">
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
