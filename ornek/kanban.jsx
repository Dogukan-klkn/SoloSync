// Kanban Board with drag & drop

const { useState: useStateK, useRef: useRefK } = React;

function KanbanBoard({ projectId, onNavigate }) {
  const D = window.SoloData;
  const project = D.projects.find(x=>x.id===projectId) || D.projects[0];
  const [tasks, setTasks] = useStateK(D.tasks.filter(t => t.projectId === project.id));
  const [draggedId, setDraggedId] = useStateK(null);
  const [dragOverCol, setDragOverCol] = useStateK(null);
  const [modalOpen, setModalOpen] = useStateK(null); // status to add into

  const cols = [
    { key: "Todo", label: "Yapılacak", dotColor: "#71717a" },
    { key: "InProgress", label: "Devam Ediyor", dotColor: "#2563eb" },
    { key: "Review", label: "İnceleme", dotColor: "#eab308" },
    { key: "Done", label: "Tamamlandı", dotColor: "#16a34a" },
  ];

  const onDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragEnd = () => { setDraggedId(null); setDragOverCol(null); };
  const onDragOver = (e, col) => { e.preventDefault(); setDragOverCol(col); };
  const onDrop = (e, col) => {
    e.preventDefault();
    if (draggedId) {
      setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, status: col } : t));
    }
    setDraggedId(null); setDragOverCol(null);
  };

  return (
    <div className="page fade-in" style={{display:"flex", flexDirection:"column", height:"calc(100vh - 49px)"}}>
      <div style={{marginBottom: 4}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate("project-detail", project.id)}><I.ChevronLeft size={12}/> {project.name}</button>
      </div>
      <div className="page-header" style={{marginBottom: 14}}>
        <div className="page-title-group">
          <h1>Kanban Tahtası</h1>
          <div className="page-subtitle">Görevleri sürükle-bırak ile yönet · {tasks.length} görev</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Filter size={14}/> Filtrele</button>
          <button className="btn btn-primary" onClick={()=>setModalOpen("Todo")}><I.Plus size={14}/> Görev ekle</button>
        </div>
      </div>

      <div className="kanban-board">
        {cols.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <span className="kanban-col-dot" style={{background: col.dotColor}}/>
                  {col.label}
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setModalOpen(col.key)}><I.Plus size={12}/></button>
              </div>
              <div className={`kanban-col-body ${dragOverCol===col.key?"drop-over":""}`}
                   onDragOver={(e)=>onDragOver(e, col.key)}
                   onDrop={(e)=>onDrop(e, col.key)}
                   onDragLeave={()=>setDragOverCol(null)}>
                {colTasks.map(t => {
                  const overdue = t.due && t.status !== "Done" && /(\d+)\s+(\w+)/.test(t.due);
                  return (
                    <div key={t.id}
                         className={`kanban-card p-${t.priority.toLowerCase()} ${draggedId===t.id?"dragging":""}`}
                         draggable
                         onDragStart={(e)=>onDragStart(e, t.id)}
                         onDragEnd={onDragEnd}>
                      <div className="kanban-card-title">{t.title}</div>
                      {t.tags?.length > 0 && (
                        <div className="kanban-card-tags">
                          {t.tags.map((tag,i) => <span key={i} className={tagColor(tag)}>{tag}</span>)}
                        </div>
                      )}
                      <div className="kanban-card-meta">
                        <div className="kanban-card-meta-left">
                          <span className="kanban-card-due">
                            <I.Calendar/>
                            <span className="mono">{t.due}</span>
                          </span>
                          <Badge cls="badge-gray" style={{height: 16, padding: "0 6px", fontSize: 10}}>
                            <span className="badge-dot" style={{background: priorityMeta[t.priority].color, width: 5, height: 5}}/>
                            {priorityMeta[t.priority].label}
                          </Badge>
                        </div>
                        <Avatar name="Doğukan Kalkan" size="sm"/>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div style={{padding: "20px 8px", textAlign:"center", fontSize: 12, color:"var(--text-tertiary)", border: "1px dashed var(--border)", borderRadius: 8}}>
                    Bu kolon boş
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!modalOpen} onClose={()=>setModalOpen(null)} title="Yeni görev"
        footer={<>
          <button className="btn btn-ghost" onClick={()=>setModalOpen(null)}>İptal</button>
          <button className="btn btn-primary" onClick={()=>setModalOpen(null)}>Görev oluştur</button>
        </>}>
        <div className="field"><label className="label">Başlık *</label><input className="input" placeholder="Görev başlığı"/></div>
        <div className="field"><label className="label">Açıklama</label><textarea className="textarea" placeholder="Detaylar..."/></div>
        <div className="grid-2">
          <div className="field"><label className="label">Durum</label>
            <select className="select" defaultValue={modalOpen||"Todo"}>
              <option value="Todo">Yapılacak</option>
              <option value="InProgress">Devam Ediyor</option>
              <option value="Review">İnceleme</option>
              <option value="Done">Tamamlandı</option>
            </select>
          </div>
          <div className="field"><label className="label">Öncelik</label>
            <select className="select" defaultValue="Medium">
              <option value="Low">Düşük</option>
              <option value="Medium">Orta</option>
              <option value="High">Yüksek</option>
              <option value="Urgent">Acil</option>
            </select>
          </div>
        </div>
        <div className="field"><label className="label">Bitiş tarihi</label><input className="input" type="date"/></div>
      </Modal>
    </div>
  );
}

window.KanbanBoard = KanbanBoard;
