import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useProjectTasks, useDeleteTask, useReorderTasks } from '../hooks/useProjectTasks';
import { useClientRequests, useReviewClientRequest } from '../hooks/useClientRequests';
import TaskModal from '../components/tasks/TaskModal';
import RequestAiHints from '../components/requests/RequestAiHints';
import {
  ArrowLeft, Plus, GripVertical, Pencil, Trash2,
  Calendar, AlertTriangle, AlertCircle, ArrowUp, Minus, ChevronDown, ChevronUp
} from 'lucide-react';

const COLUMNS = [
  { status: 1, key: 'Todo',       label: 'Yapılacak',    color: 'bg-slate-500',  lightBg: 'bg-slate-50',   border: 'border-slate-200' },
  { status: 2, key: 'InProgress', label: 'Devam Ediyor', color: 'bg-blue-500',   lightBg: 'bg-blue-50',    border: 'border-blue-200' },
  { status: 3, key: 'Review',     label: 'İnceleme',     color: 'bg-amber-500',  lightBg: 'bg-amber-50',   border: 'border-amber-200' },
  { status: 4, key: 'Done',       label: 'Tamamlandı',   color: 'bg-emerald-500',lightBg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const PRIORITY_CONFIG = {
  Low:    { label: 'Düşük',  icon: Minus,          cls: 'text-slate-400' },
  Medium: { label: 'Orta',   icon: ArrowUp,        cls: 'text-blue-500' },
  High:   { label: 'Yüksek', icon: AlertTriangle,  cls: 'text-orange-500' },
  Urgent: { label: 'Acil',   icon: AlertCircle,    cls: 'text-red-500' },
};

export default function KanbanBoard() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading: pLoading } = useProject(projectId);
  const { data: tasks = [], isLoading: tLoading } = useProjectTasks(projectId);
  const { data: pendingRequests = [] } = useClientRequests(projectId, 'Pending');
  const deleteTask   = useDeleteTask(projectId);
  const reorderTask  = useReorderTasks(projectId);
  const reviewRequest = useReviewClientRequest(projectId);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeTab, setActiveTab]   = useState('board');
  const [expandedMsg, setExpandedMsg] = useState(null);
  const dragOverCol = useRef(null);

  // Görevleri kolonlara grupla
  const columns = COLUMNS.map(col => ({
    ...col,
    tasks: tasks
      .filter(t => t.statusValue === col.status)
      .sort((a, b) => a.order - b.order),
  }));

  // --- Drag & Drop ---
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverCol.current = colStatus;
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    const targetColTasks = tasks
      .filter(t => t.statusValue === targetStatus && t.id !== draggedTask.id)
      .sort((a, b) => a.order - b.order);

    const updatedItems = [
      // Taşınan görev hedef kolona ekleniyor (sona)
      { id: draggedTask.id, status: targetStatus, order: targetColTasks.length },
      // Hedef kolondaki mevcut görevlerin sırası korunuyor
      ...targetColTasks.map((t, idx) => ({ id: t.id, status: targetStatus, order: idx })),
    ];

    // Eğer kaynak kolondan taşınıyorsa, kaynak kolonu da güncelle
    if (draggedTask.statusValue !== targetStatus) {
      const sourceColTasks = tasks
        .filter(t => t.statusValue === draggedTask.statusValue && t.id !== draggedTask.id)
        .sort((a, b) => a.order - b.order);

      sourceColTasks.forEach((t, idx) => {
        updatedItems.push({ id: t.id, status: draggedTask.statusValue, order: idx });
      });
    }

    setDraggedTask(null);
    dragOverCol.current = null;

    try {
      await reorderTask.mutateAsync(updatedItems);
    } catch {
      // React Query otomatik refetch yapacak
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    dragOverCol.current = null;
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (task) => {
    if (!confirm(`"${task.title}" görevini silmek istediğinize emin misiniz?`)) return;
    await deleteTask.mutateAsync(task.id);
  };

  const handleAddToColumn = (statusValue) => {
    setEditTask({ _defaultStatus: statusValue });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTask(null);
  };

  // --- Loading ---
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/dashboard/projects/${projectId}`)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Projeye Dön
          </button>
          <span className="text-slate-300">|</span>
          <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
          <span className="text-sm text-slate-400">— Kanban</span>
        </div>
        <button
          onClick={() => { setEditTask(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Görev Ekle
        </button>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
        <button onClick={() => setActiveTab('board')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          Görev Tahtası
        </button>
        <button onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          Bekleyen İstekler
          {pendingRequests.length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Bekleyen İstekler Sekmesi */}
      {activeTab === 'requests' && (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              Bekleyen müşteri isteği yok.
            </div>
          ) : pendingRequests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{req.summarizedTodo}</p>
                  <p className="text-xs text-gray-400">{req.customerName} · {new Date(req.requestedAt).toLocaleDateString('tr-TR')}</p>
                  <RequestAiHints request={req} />
                </div>
              </div>
              <button
                onClick={() => setExpandedMsg(expandedMsg === req.id ? null : req.id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3">
                {expandedMsg === req.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                {expandedMsg === req.id ? 'Orijinal mesajı gizle' : 'Orijinal mesajı göster'}
              </button>
              {expandedMsg === req.id && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs text-gray-600 whitespace-pre-wrap">
                  {req.originalMessage}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => reviewRequest.mutate({ id: req.id, data: { action: 'approve' } })}
                  disabled={reviewRequest.isPending}
                  className="bg-green-600 text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-green-700 disabled:opacity-50">
                  ✓ Onayla
                </button>
                <button
                  onClick={() => reviewRequest.mutate({ id: req.id, data: { action: 'reject' } })}
                  disabled={reviewRequest.isPending}
                  className="bg-red-500 text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-red-600 disabled:opacity-50">
                  ✗ Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban Board */}
      {activeTab === 'board' && tLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'board' && (
        <div className="grid grid-cols-4 gap-4 flex-1 min-h-0 overflow-x-auto">
          {columns.map((col) => (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex flex-col rounded-2xl border ${col.border} ${col.lightBg} min-h-[300px] transition-all ${
                dragOverCol.current === col.status && draggedTask ? 'ring-2 ring-brand-400 ring-offset-2' : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
                  <span className="text-xs text-slate-400 bg-white px-1.5 py-0.5 rounded-full">
                    {col.tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToColumn(col.status)}
                  className="p-1 hover:bg-white/80 rounded-lg transition text-slate-400 hover:text-brand-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {col.tasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-300 text-xs">
                    Görev yok
                  </div>
                ) : (
                  col.tasks.map((task) => {
                    const prio = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
                    const PrioIcon = prio.icon;
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border border-slate-100 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                          draggedTask?.id === task.id ? 'opacity-40' : ''
                        }`}
                      >
                        {/* Drag handle + Priority */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                            <div className={`flex items-center gap-1 text-xs font-medium ${prio.cls}`}>
                              <PrioIcon className="w-3 h-3" />
                              {prio.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleEdit(task)} className="p-1 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-brand-500">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(task)} className="p-1 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <p className="text-sm font-medium text-slate-800 mb-1 leading-snug">{task.title}</p>

                        {/* Description preview */}
                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map(tag => (
                              <span key={tag.id} className="text-white text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: tag.color }}>
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Due date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editTask?._defaultStatus ? null : editTask}
          projectId={projectId}
          onClose={closeModal}
          totalTasks={tasks.length}
          defaultStatus={editTask?._defaultStatus}
        />
      )}
    </div>
  );
}
