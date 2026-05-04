// Time Tracker page

const { useState: useStateT, useEffect: useEffectT } = React;

function TimeTrackerPage({ onNavigate }) {
  const D = window.SoloData;
  const [running, setRunning] = useStateT(null); // {taskId, startTime}
  const [elapsed, setElapsed] = useStateT(0);
  const [selectedProject, setSelectedProject] = useStateT(D.projects[0].id);
  const [selectedTask, setSelectedTask] = useStateT("t5");
  const [manualOpen, setManualOpen] = useStateT(false);
  const [syncState, setSyncState] = useStateT("synced");

  useEffectT(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - running.startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // simulate occasional sync state for realism
  useEffectT(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSyncState("syncing");
      setTimeout(() => setSyncState("synced"), 800);
    }, 10000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    setRunning({ taskId: selectedTask, startTime: Date.now() });
    setElapsed(0);
  };
  const stop = () => {
    setRunning(null); setElapsed(0);
  };

  const projectTasks = D.tasks.filter(t => t.projectId === selectedProject);
  const runningTask = running ? D.tasks.find(t => t.id === running.taskId) : null;
  const runningProject = running ? D.projects.find(p=>p.id===D.tasks.find(t=>t.id===running.taskId)?.projectId) : null;

  const todayTotal = D.recentEntries.filter(e=>e.date.startsWith("Bugün")).reduce((s,e)=>s+e.duration,0);
  const weekTotal = D.weeklyHours.reduce((a,b)=>a+b,0) * 3600;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Zaman Takibi</h1>
          <div className="page-subtitle">Görev bazlı kronometreyle tüm çalışma saatlerini kaydet.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={()=>setManualOpen(true)}><I.Plus size={14}/> Manuel kayıt</button>
          <button className="btn btn-secondary"><I.Download size={14}/> Rapor</button>
        </div>
      </div>

      {/* Big Timer Card */}
      <div className="card" style={{marginBottom: 16, overflow:"hidden", position:"relative"}}>
        {running && (
          <div style={{position:"absolute", inset: 0, background: "radial-gradient(circle at 20% 0%, var(--accent-soft), transparent 60%)", pointerEvents: "none"}}/>
        )}
        <div style={{padding: "32px 32px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap: 32, position:"relative"}}>
          <div style={{flex: 1, minWidth: 0}}>
            {running ? (
              <>
                <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 8}}>
                  <span className="pulse-dot"/>
                  <Badge cls="badge-green">Aktif</Badge>
                  <span style={{fontSize: 12, color:"var(--text-tertiary)", display:"inline-flex", alignItems:"center", gap: 6}}>
                    <I.Wifi size={12}/>
                    {syncState === "syncing" ? "Senkronize ediliyor..." : "Sunucu ile senkronize"}
                  </span>
                </div>
                <div className="timer-display" style={{fontSize: 72}}>{formatDuration(elapsed)}</div>
                <div style={{marginTop: 12, fontSize: 14, color: "var(--text-secondary)"}}>
                  <span style={{fontWeight: 500, color: "var(--text)"}}>{runningTask?.title}</span>
                  <span style={{margin: "0 8px", color:"var(--text-tertiary)"}}>·</span>
                  <span>{runningProject?.name}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{fontSize: 12, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:".06em", fontWeight: 500, marginBottom: 8}}>Hazır</div>
                <div className="timer-display" style={{fontSize: 72, color: "var(--text-tertiary)"}}>00:00:00</div>
                <div style={{marginTop: 12, display:"flex", gap: 10, alignItems:"center", flexWrap:"wrap"}}>
                  <select className="select" style={{maxWidth: 220, height: 32}} value={selectedProject} onChange={e=>setSelectedProject(e.target.value)}>
                    {D.projects.filter(p=>p.status!=="Completed").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select className="select" style={{maxWidth: 280, height: 32}} value={selectedTask} onChange={e=>setSelectedTask(e.target.value)}>
                    {projectTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
          <div>
            {running ? (
              <button className="btn btn-danger btn-lg" onClick={stop} style={{height: 56, padding: "0 28px", fontSize: 15, borderRadius: 12}}>
                <I.Square size={14}/> Durdur
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={start} style={{height: 56, padding: "0 28px", fontSize: 15, borderRadius: 12, boxShadow: "0 4px 16px -4px rgba(37,99,235,.4)"}}>
                <I.Play size={14}/> Kronometreyi Başlat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
        <div className="stat">
          <div className="stat-label"><I.Clock/> Bugün</div>
          <div className="stat-value mono">{formatDuration(todayTotal + (running?elapsed:0))}</div>
          <div className="stat-meta">{D.recentEntries.filter(e=>e.date.startsWith("Bugün")).length + (running?1:0)} kayıt</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.TrendingUp/> Bu hafta</div>
          <div className="stat-value">{(weekTotal/3600).toFixed(1)} <span style={{fontSize:14, color:"var(--text-tertiary)", fontWeight: 400}}>saat</span></div>
          <div className="stat-meta up"><I.ArrowUp size={12}/> Geçen haftadan +%12</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.DollarSign/> Bu hafta hak ediş</div>
          <div className="stat-value">{formatCurrency(weekTotal/3600 * 650)}</div>
          <div className="stat-meta">Saatlik {formatCurrency(650)} ortalama</div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 16}}>
        <div className="card">
          <div className="card-header">
            <h2>Son kayıtlar</h2>
          </div>
          <table className="table">
            <thead>
              <tr><th>Görev</th><th>Proje</th><th>Süre</th><th>Tarih</th><th style={{width: 40}}></th></tr>
            </thead>
            <tbody>
              {D.recentEntries.map(e => (
                <tr key={e.id}>
                  <td style={{fontWeight: 500, fontSize: 13}}>{e.task}</td>
                  <td style={{color: "var(--text-secondary)", fontSize: 12.5}}>{e.project}</td>
                  <td className="mono" style={{fontWeight: 500}}>{formatDuration(e.duration)}</td>
                  <td style={{fontSize: 12, color: "var(--text-tertiary)"}}>{e.date}</td>
                  <td><button className="btn btn-ghost btn-icon btn-sm"><I.More size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Son 5 gün</h2>
          </div>
          <div style={{padding: "12px 16px"}}>
            {D.weekDays.slice(0,5).map((day, i) => {
              const h = D.weeklyHours[i];
              const max = Math.max(...D.weeklyHours);
              return (
                <div key={day} style={{padding: "8px 0", display:"flex", alignItems:"center", gap: 12}}>
                  <div style={{width: 36, fontSize: 12, color:"var(--text-tertiary)"}}>{day}</div>
                  <div style={{flex: 1, height: 8, background: "var(--bg-subtle)", borderRadius: 4, overflow:"hidden"}}>
                    <div style={{width: `${(h/max)*100}%`, height: "100%", background: "var(--accent)", borderRadius: 4}}/>
                  </div>
                  <div className="mono" style={{fontSize: 12, color:"var(--text-secondary)", minWidth: 48, textAlign:"right"}}>{h.toFixed(1)} sa</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal open={manualOpen} onClose={()=>setManualOpen(false)} title="Manuel zaman kaydı"
        footer={<>
          <button className="btn btn-ghost" onClick={()=>setManualOpen(false)}>İptal</button>
          <button className="btn btn-primary" onClick={()=>setManualOpen(false)}>Kaydet</button>
        </>}>
        <div className="field"><label className="label">Görev *</label>
          <select className="select"><option>Sepet API entegrasyonu</option><option>Filtreleme bileşeni</option></select>
        </div>
        <div className="grid-2">
          <div className="field"><label className="label">Başlangıç *</label><input className="input" type="datetime-local"/></div>
          <div className="field"><label className="label">Bitiş *</label><input className="input" type="datetime-local"/></div>
        </div>
        <div className="field"><label className="label">Açıklama</label><textarea className="textarea" placeholder="Ne üzerinde çalıştın?"/></div>
      </Modal>
    </div>
  );
}

window.TimeTrackerPage = TimeTrackerPage;
