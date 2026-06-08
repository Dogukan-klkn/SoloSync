// src/pages/ProjectDetailPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProject, useMilestones, useAddMilestone } from '../hooks/useProjects';
import { useProjectTasks } from '../hooks/useProjectTasks';
import ProjectModal from '../components/projects/ProjectModal';
import {
  ArrowLeft, Plus, Calendar, DollarSign, Flag, Columns3,
  CheckCircle2, Circle, Tag, User, FileText, Clock,
  TrendingUp, ChevronRight, Edit3, LayoutGrid,
} from 'lucide-react';

const STATUS_CONFIG = {
  Pending:    { label: 'Beklemede',    cls: 'bg-amber-50   text-amber-700',   bar: 'bg-amber-400'   },
  InProgress: { label: 'Devam Ediyor', cls: 'bg-blue-50    text-blue-700',    bar: 'bg-blue-500'    },
  InRevision: { label: 'Revizyon',     cls: 'bg-purple-50  text-purple-700',  bar: 'bg-purple-400'  },
  Completed:  { label: 'Tamamlandı',  cls: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: project,       isLoading: pLoading }  = useProject(id);
  const { data: milestones = [], isLoading: mLoading } = useMilestones(id);
  const { data: tasks = [] }                           = useProjectTasks(id);
  const addMilestone = useAddMilestone(id);

  const { register, handleSubmit, reset } = useForm();

  const onAddMilestone = async (data) => {
    await addMilestone.mutateAsync({
      projectId: id,
      title:     data.title,
      dueDate:   data.dueDate || null,
      order:     milestones.length + 1,
    });
    reset();
    setShowMilestoneForm(false);
  };

  if (pLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Proje bulunamadı.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-brand-500 font-semibold">Geri dön</button>
    </div>
  );

  const cfg            = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.Pending;
  const totalTasks     = project.totalTaskCount ?? tasks.length;
  const completedTasks = project.completedTaskCount ?? tasks.filter(t => t.status === 'Done').length;
  const progress       = project.progressPercentage ?? (totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0);

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <button onClick={() => navigate('/dashboard/projects')} className="hover:text-brand-600 transition-colors">Projeler</button>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium truncate">{project.name}</span>
      </div>

      {/* ── Başlık Satırı ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/projects')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-brand-600 font-medium">{project.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/dashboard/projects/${id}/kanban`)}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <LayoutGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-1.5 border border-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Edit3 size={14} /> Düzenle
          </button>
          <button onClick={() => navigate(`/dashboard/projects/${id}/kanban`)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm">
            <Plus size={14} /> Görev Ekle
          </button>
        </div>
      </div>

      {/* ── 4 KPI Kartı ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-brand-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">İlerleme</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{progress}%</p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={14} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">Bütçe</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {project.budget ? `₺${Number(project.budget).toLocaleString('tr-TR')}` : '—'}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={14} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">Görevler</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{completedTasks}<span className="text-base font-normal text-slate-400">/{totalTasks}</span></p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Flag size={14} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">Km Taşları</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {project.completedMilestoneCount}<span className="text-base font-normal text-slate-400">/{project.milestoneCount}</span>
          </p>
        </div>
      </div>

      {/* ── İki Kolon Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Sol: Milestone'lar (2/3) ── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-brand-500" />
              <h2 className="font-bold text-slate-900">Kilometre Taşları</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{milestones.length}</span>
            </div>
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors">
              <Plus size={14} /> Ekle
            </button>
          </div>

          {showMilestoneForm && (
            <form onSubmit={handleSubmit(onAddMilestone)} className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <input {...register('title', { required: true })} placeholder="Milestone başlığı *"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                </div>
                <div>
                  <input {...register('dueDate')} type="date"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={addMilestone.isPending}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">
                  {addMilestone.isPending ? 'Ekleniyor...' : 'Ekle'}
                </button>
                <button type="button" onClick={() => setShowMilestoneForm(false)}
                  className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition">
                  İptal
                </button>
              </div>
            </form>
          )}

          {mLoading ? (
            <div className="py-6 text-center text-slate-400 text-sm">Yükleniyor...</div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Flag size={36} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Henüz milestone yok</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {milestones.map((m) => {
                const isDone = m.totalTasks > 0 && m.completedTasks === m.totalTasks;
                return (
                  <li key={m.id}
                    className={`p-4 rounded-xl border transition-all ${isDone ? 'border-emerald-100 bg-emerald-50/60' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {isDone
                        ? <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />
                        : <Circle size={17} className="text-slate-300 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>{m.title}</p>
                        {m.dueDate && <p className="text-xs text-slate-400">{new Date(m.dueDate).toLocaleDateString('tr-TR')}</p>}
                      </div>
                      <span className="text-xs font-medium text-slate-500 shrink-0 whitespace-nowrap">
                        {m.totalTasks === 0 ? 'Görev yok' : `${m.completedTasks}/${m.totalTasks}`}
                      </span>
                    </div>
                    {m.totalTasks > 0 && (
                      <div className="ml-8">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>İlerleme</span><span>{m.progressPercentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-brand-500'}`}
                            style={{ width: `${m.progressPercentage}%` }} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Sağ: Detaylar (1/3) ── */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4">Detaylar</h2>
            <div className="space-y-4">

              <div>
                <p className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><User size={11} /> Müşteri</p>
                <p className="text-sm font-semibold text-slate-800">{project.customerName}</p>
              </div>

              {project.description && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><FileText size={11} /> Açıklama</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Tag size={11} /> Etiketler</p>
                <p className="text-xs text-slate-400 italic">Etiket yok</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Başlangıç</p>
                    <p className="text-sm font-medium text-slate-700">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString('tr-TR') : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Bitiş</p>
                    <p className="text-sm font-medium text-slate-700">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Oluşturuldu</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Son Güncelleme</p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date(project.updatedAt || project.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => navigate(`/dashboard/projects/${id}/kanban`)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-600 font-semibold text-sm py-3 rounded-2xl shadow-sm transition-colors">
            <Columns3 size={15} /> Kanban Board'u Aç
          </button>
        </div>
      </div>

      {/* Düzenleme Modalı */}
      {editModalOpen && (
        <ProjectModal
          project={project}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}
