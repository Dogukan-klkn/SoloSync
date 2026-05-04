// src/pages/ProjectDetailPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProject, useMilestones, useAddMilestone } from '../hooks/useProjects';
import { ArrowLeft, Plus, Calendar, DollarSign, Flag, Columns3, CheckCircle2, Circle } from 'lucide-react';

const STATUS_CONFIG = {
  Pending:    { label: 'Beklemede',    cls: 'bg-amber-50   text-amber-700'  },
  InProgress: { label: 'Devam Ediyor', cls: 'bg-blue-50    text-blue-700'   },
  InRevision: { label: 'Revizyon',      cls: 'bg-purple-50  text-purple-700' },
  Completed:  { label: 'Tamamlandı',   cls: 'bg-emerald-50 text-emerald-700'},
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const { data: project,    isLoading: pLoading }  = useProject(id);
  const { data: milestones = [], isLoading: mLoading } = useMilestones(id);
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

  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.Pending;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Projelere Dön
      </button>

      {/* Project Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">{project.name}</h1>
            <p className="text-sm text-brand-600 font-medium mt-1">{project.customerName}</p>
          </div>
          <button
            onClick={() => navigate(`/dashboard/projects/${id}/kanban`)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <Columns3 className="w-4 h-4" /> Kanban Board
          </button>
        </div>

        {project.description && (
          <p className="text-slate-600 text-sm mb-4">{project.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Başlangıç</p>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              {project.startDate ? new Date(project.startDate).toLocaleDateString('tr-TR') : '—'}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Bitiş</p>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              {project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '—'}
            </div>
          </div>
          {project.budget && (
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Bütçe</p>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                <DollarSign className="w-4 h-4 text-slate-400" />
                {project.budget.toLocaleString('tr-TR')} ₺
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestones Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-brand-500" />
            <h2 className="font-bold text-slate-900">Milestone'lar</h2>
            <span className="text-sm text-slate-400">({milestones.length})</span>
          </div>
          <button
            onClick={() => setShowMilestoneForm(!showMilestoneForm)}
            className="flex items-center gap-1.5 text-brand-500 hover:text-brand-700 font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </div>

        {/* Add Milestone Form */}
        {showMilestoneForm && (
          <form onSubmit={handleSubmit(onAddMilestone)} className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <input
                  {...register('title', { required: true })}
                  placeholder="Milestone başlığı *"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={addMilestone.isPending} className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">
                {addMilestone.isPending ? 'Ekleniyor...' : 'Ekle'}
              </button>
              <button type="button" onClick={() => setShowMilestoneForm(false)} className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition">
                İptal
              </button>
            </div>
          </form>
        )}

        {/* Milestone List */}
        {mLoading ? (
          <div className="py-6 text-center text-slate-400 text-sm">Yükleniyor...</div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Flag className="w-10 h-10 mx-auto mb-2 opacity-25" />
            <p className="text-sm">Henüz milestone yok</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {milestones.map((m) => {
              const isDone = m.totalTasks > 0 && m.completedTasks === m.totalTasks;
              return (
                <li
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${isDone ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-white'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {m.title}
                      </p>
                      {m.dueDate && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(m.dueDate).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {m.totalTasks === 0
                        ? 'Görev yok'
                        : `${m.completedTasks}/${m.totalTasks} Görev`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {m.totalTasks > 0 && (
                    <div className="ml-8">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>İlerleme</span>
                        <span>{m.progressPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-brand-500'}`}
                          style={{ width: `${m.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
