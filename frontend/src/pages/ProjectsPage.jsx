// src/pages/ProjectsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import ProjectModal from '../components/projects/ProjectModal';
import { Plus, FolderOpen, Calendar, DollarSign, Trash2, ChevronRight, Pencil } from 'lucide-react';

const STATUS_CONFIG = {
  Pending:    { label: 'Beklemede',    cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
  InProgress: { label: 'Devam Ediyor', cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  InRevision: { label: 'Revizyon',     cls: 'bg-purple-50  text-purple-700  border-purple-200'  },
  Completed:  { label: 'Tamamlandı',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Skeleton Kart ──────────────────────────────────────────
function ProjectCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-24 bg-slate-200 rounded-full" />
        <div className="h-4 w-4 bg-slate-200 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-full bg-slate-100 rounded mb-1" />
      <div className="h-4 w-2/3 bg-slate-100 rounded mb-4" />
      <div className="h-4 w-24 bg-brand-100 rounded mb-3" />
      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4" />
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);

  // "Tüm Müşteriler" filter dropdown kaldırıldı — sadece projeleri listele
  const { data: projects = [], isLoading } = useProjects();
  const deleteMutation = useDeleteProject();

  const handleAdd  = ()          => { setEditing(null);    setModalOpen(true); };
  const handleEdit = (e, proj)   => { e.stopPropagation(); setEditing(proj);   setModalOpen(true); };
  const handleDelete = (e, id)   => {
    e.stopPropagation();
    if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projeler</h1>
          {!isLoading && (
            <p className="text-slate-500 text-sm mt-1">{projects.length} proje</p>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-md hover:shadow-brand-500/30"
        >
          <Plus className="w-4 h-4" />
          Yeni Proje
        </button>
      </div>

      {/* ── İçerik ── */}
      {isLoading ? (
        /* Skeleton Grid — veri yüklenirken "proje yok" yazısı görünmez */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Sadece yükleme BİTTİKTEN sonra boş durum göster */
        <div className="text-center py-20 text-slate-400">
          <FolderOpen className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-500">Henüz proje yok</p>
          <p className="text-sm mt-1">Yukarıdaki butona tıklayarak ilk projenizi oluşturun.</p>
          <button
            onClick={handleAdd}
            className="mt-5 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            <Plus className="w-4 h-4" /> Proje Oluştur
          </button>
        </div>
      ) : (
        /* Proje Kartları Gridi */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/dashboard/projects/${p.id}`)}
              className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-brand-300 transition-all group"
            >
              {/* Status + Aksiyonlar */}
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={p.status} />
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleEdit(e, p)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-brand-50 hover:text-brand-500 rounded-lg transition text-slate-400"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, p.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition text-slate-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition" />
                </div>
              </div>

              {/* Proje Adı + Açıklama */}
              <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{p.name}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.description || 'Açıklama yok'}</p>

              {/* Müşteri Badge */}
              <span className="inline-block text-xs bg-brand-50 text-brand-700 font-semibold px-2.5 py-1 rounded-full mb-3">
                {p.customerName}
              </span>

              {/* Milestone Progress */}
              {p.milestoneCount > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Milestone</span>
                    <span>{p.completedMilestoneCount}/{p.milestoneCount}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${(p.completedMilestoneCount / p.milestoneCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Alt Meta Bilgi */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '—'}
                </div>
                {p.budget && (
                  <div className="flex items-center gap-1 font-semibold text-slate-600">
                    <DollarSign className="w-3.5 h-3.5" />
                    {p.budget.toLocaleString('tr-TR')} ₺
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProjectModal
          project={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
