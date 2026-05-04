// src/components/projects/ProjectModal.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import { useCustomers } from '../../hooks/useCustomers';

const schema = z.object({
  customerId:  z.string().min(1, 'Müşteri seçimi zorunludur'),
  name:        z.string().min(1, 'Proje adı zorunludur').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  status:      z.coerce.number().min(1).max(4),
  budget:      z.union([z.coerce.number().positive('Geçerli bir bütçe giriniz'), z.literal(''), z.nan()]).optional(),
  startDate:   z.string().optional().or(z.literal('')),
  endDate:     z.string().optional().or(z.literal('')),
});

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function ProjectModal({ project, onClose }) {
  const isEdit = !!project;
  const create = useCreateProject();
  const update = useUpdateProject();
  const { data: customers = [] } = useCustomers();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 1 },
  });

  useEffect(() => {
    if (project) {
      reset({
        customerId:  project.customerId,
        name:        project.name,
        description: project.description ?? '',
        status:      project.statusValue ?? 1,
        budget:      project.budget ?? '',
        startDate:   project.startDate ? project.startDate.split('T')[0] : '',
        endDate:     project.endDate ? project.endDate.split('T')[0] : '',
      });
    } else {
      reset({ customerId: '', name: '', description: '', status: 1, budget: '', startDate: '', endDate: '' });
    }
  }, [project, reset]);

  const onSubmit = async (data) => {
    setServerError('');
    const payload = {
      customerId:  data.customerId,
      name:        data.name,
      description: data.description?.trim() || null,
      status:      Number(data.status),
      // Boş string → null gönder; backend string? olarak kabul eder
      budget:      data.budget !== '' && data.budget !== undefined && !isNaN(Number(data.budget))
                     ? Number(data.budget)
                     : null,
      startDate:   data.startDate?.trim() || null,
      endDate:     data.endDate?.trim()   || null,
    };
    try {
      if (isEdit) await update.mutateAsync({ id: project.id, data: payload });
      else         await create.mutateAsync(payload);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : 'İşlem başarısız. Lütfen tekrar deneyin.');
      setServerError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              ⚠️ {serverError}
            </div>
          )}

          {/* Müşteri Seçimi */}
          <div>
            <label className={labelCls}>Müşteri *</label>
            <select {...register('customerId')} className={inputCls}>
              <option value="">— Müşteri Seçin —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
          </div>

          {/* Proje Adı */}
          <div>
            <label className={labelCls}>Proje Adı *</label>
            <input {...register('name')} className={inputCls} placeholder="E-ticaret Sitesi" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Açıklama */}
          <div>
            <label className={labelCls}>Açıklama</label>
            <textarea {...register('description')} rows={2} className={`${inputCls} resize-none`} placeholder="Proje detayları..." />
          </div>

          {/* Durum + Bütçe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Durum</label>
              <select {...register('status')} className={inputCls}>
                <option value={1}>Beklemede</option>
                <option value={2}>Devam Ediyor</option>
                <option value={3}>Revizyon</option>
                <option value={4}>Tamamlandı</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Bütçe (₺)</label>
              <input {...register('budget')} type="number" step="0.01" className={inputCls} placeholder="5000" />
              {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
            </div>
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Başlangıç</label>
              <input {...register('startDate')} type="date" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Bitiş</label>
              <input {...register('endDate')} type="date" className={inputCls} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition font-medium text-sm">
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
