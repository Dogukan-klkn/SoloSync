import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import { useCreateTask, useUpdateTask } from '../../hooks/useProjectTasks';
import { useMilestones } from '../../hooks/useProjects';
import CommentSection from '../comments/CommentSection';

const TAG_PALETTE = [
  { color: '#3b82f6', label: 'Mavi' },
  { color: '#10b981', label: 'Yeşil' },
  { color: '#ef4444', label: 'Kırmızı' },
  { color: '#f59e0b', label: 'Sarı' },
  { color: '#8b5cf6', label: 'Mor' },
  { color: '#f97316', label: 'Turuncu' },
  { color: '#ec4899', label: 'Pembe' },
  { color: '#6b7280', label: 'Gri' },
];

const schema = z.object({
  title:       z.string().min(1, 'Görev başlığı zorunludur').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  status:      z.coerce.number().min(1).max(4),
  priority:    z.coerce.number().min(1).max(4),
  dueDate:     z.string().optional().or(z.literal('')),
});

const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function TaskModal({ task, projectId, onClose, totalTasks = 0, defaultStatus }) {
  const isEdit = !!task;
  const create = useCreateTask(projectId);
  const update = useUpdateTask(projectId);
  const { data: milestones = [] } = useMilestones(projectId);
  const [serverError, setServerError] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [tags, setTags] = useState(task?.tags || []);
  const [tagLabel, setTagLabel] = useState('');
  const [tagColor, setTagColor] = useState(TAG_PALETTE[0].color);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(task?.milestoneId ?? '');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: defaultStatus ?? 1, priority: 2 },
  });

  useEffect(() => {
    if (task) {
      reset({
        title:       task.title,
        description: task.description ?? '',
        status:      task.statusValue ?? 1,
        priority:    task.priorityValue ?? 2,
        dueDate:     task.dueDate ? task.dueDate.split('T')[0] : '',
      });
      setSelectedMilestoneId(task.milestoneId ?? '');
    } else {
      reset({ title: '', description: '', status: 1, priority: 2, dueDate: '' });
      setSelectedMilestoneId('');
    }
  }, [task, reset]);

  const addTag = () => {
    if (!tagLabel.trim()) return;
    setTags(prev => [...prev, { label: tagLabel.trim(), color: tagColor }]);
    setTagLabel('');
  };
  const removeTag = (idx) => setTags(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data) => {
    setServerError('');
    const payload = {
      milestoneId: selectedMilestoneId || null,
      title:       data.title,
      description: data.description?.trim() || null,
      status:      Number(data.status),
      priority:    Number(data.priority),
      dueDate:     data.dueDate?.trim() || null,
      order:       task?.order ?? totalTasks,
      tags,
    };

    try {
      if (isEdit) {
        await update.mutateAsync({ id: task.id, data: payload });
      } else {
        await create.mutateAsync({ ...payload, projectId });
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : 'İşlem başarısız.');
      setServerError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekmeler (sadece edit modunda) */}
        {isEdit && (
          <div className="flex gap-1 px-6 pt-4">
            {['form', 'comments'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab === 'form' ? 'Düzenle' : 'Yorumlar'}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'comments' && isEdit ? (
          <div className="p-6">
            <CommentSection taskId={task.id} />
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Başlık */}
            <div>
              <label className={labelCls}>Görev Başlığı *</label>
              <input {...register('title')} className={inputCls} placeholder="Tasarım revizyonu yap" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Açıklama */}
            <div>
              <label className={labelCls}>Açıklama</label>
              <textarea {...register('description')} rows={3} className={`${inputCls} resize-none`} placeholder="Görev detayları..." />
            </div>

            {/* Durum + Öncelik */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Durum</label>
                <select {...register('status')} className={inputCls}>
                  <option value={1}>Yapılacak</option>
                  <option value={2}>Devam Ediyor</option>
                  <option value={3}>İnceleme</option>
                  <option value={4}>Tamamlandı</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Öncelik</label>
                <select {...register('priority')} className={inputCls}>
                  <option value={1}>Düşük</option>
                  <option value={2}>Orta</option>
                  <option value={3}>Yüksek</option>
                  <option value={4}>Acil</option>
                </select>
              </div>
            </div>

            {/* Tarih */}
            <div>
              <label className={labelCls}>Son Tarih</label>
              <input {...register('dueDate')} type="date" className={inputCls} />
            </div>

            {/* Milestone */}
            {milestones.length > 0 && (
              <div>
                <label className={labelCls}>Milestone (Opsiyonel)</label>
                <select
                  value={selectedMilestoneId}
                  onChange={e => setSelectedMilestoneId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Milestone seçme —</option>
                  {milestones.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Etiketler */}
            <div>
              <label className={labelCls}>Etiketler</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}>
                    {tag.label}
                    <button type="button" onClick={() => removeTag(idx)} className="hover:opacity-70 ml-0.5">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagLabel} onChange={e => setTagLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Etiket adı..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <div className="flex gap-1">
                  {TAG_PALETTE.map(p => (
                    <button key={p.color} type="button" onClick={() => setTagColor(p.color)}
                      className={`w-6 h-6 rounded-full transition-transform ${tagColor === p.color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      style={{ backgroundColor: p.color }} title={p.label} />
                  ))}
                </div>
                <button type="button" onClick={addTag}
                  className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                  <Plus size={14} />
                </button>
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
        )}
      </div>
    </div>
  );
}
