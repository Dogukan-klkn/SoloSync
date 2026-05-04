// Projects list + Project detail

function ProjectsPage({ onNavigate }) {
  const D = window.SoloData;
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  const filtered = D.projects.filter(p => {
    const matchFilter = filter==="all" || p.status === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.customer.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Projeler</h1>
          <div className="page-subtitle">Tüm projelerini, ilerleme durumlarını ve bütçelerini takip et.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><I.Plus size={14}/> Yeni proje</button>
        </div>
      </div>

      <div style={{display:"flex", gap: 8, alignItems:"center", marginBottom: 14, flexWrap:"wrap"}}>
        <div className="search" style={{flex:1, maxWidth: 320}}>
          <I.Search size={14}/>
          <input className="input" placeholder="Proje veya müşteri ara..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <Tabs items={[
          { value: "all", label: "Tümü", count: D.projects.length },
          { value: "InProgress", label: "Devam ediyor", count: D.projects.filter(p=>p.status==="InProgress").length },
          { value: "InRevision", label: "Revizyon", count: D.projects.filter(p=>p.status==="InRevision").length },
          { value: "Pending", label: "Beklemede", count: D.projects.filter(p=>p.status==="Pending").length },
          { value: "Completed", label: "Tamamlandı", count: D.projects.filter(p=>p.status==="Completed").length },
        ]} value={filter} onChange={setFilter}/>
        <div style={{flex:1}}/>
        <div style={{display:"flex", border:"1px solid var(--border)", borderRadius:6, overflow:"hidden"}}>
          <button className={`btn btn-ghost btn-sm ${view==="grid"?"":""}`} onClick={()=>setView("grid")} style={{borderRadius:0, background: view==="grid"?"var(--bg-subtle)":""}}>
            <I.Layers size={14}/>
          </button>
          <button className={`btn btn-ghost btn-sm`} onClick={()=>setView("list")} style={{borderRadius:0, background: view==="list"?"var(--bg-subtle)":""}}>
            <I.Kanban size={14} style={{transform:"rotate(90deg)"}}/>
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap: 14}}>
          {filtered.map(p => (
            <div key={p.id} className="project-card" onClick={()=>onNavigate("project-detail", p.id)}>
              <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap: 8}}>
                <div style={{flex:1, minWidth: 0}}>
                  <div className="project-card-title">{p.name}</div>
                  <div style={{fontSize: 12, color:"var(--text-tertiary)", marginTop: 2}}>{p.customer}</div>
                </div>
                <StatusPill status={p.status}/>
              </div>
              <div>
                <div style={{display:"flex", justifyContent:"space-between", fontSize: 11, color:"var(--text-tertiary)", marginBottom: 6}}>
                  <span>İlerleme</span>
                  <span className="mono">%{p.progress}</span>
                </div>
                <Progress value={p.progress} kind={p.status==="Completed"?"success":""}/>
              </div>
              <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8, borderTop: "1px dashed var(--border)"}}>
                <div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)"}}>Bütçe</div>
                  <div style={{fontSize: 13, fontWeight: 600, marginTop: 2}}>{formatCurrency(p.budget)}</div>
                </div>
                <div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)"}}>Görevler</div>
                  <div style={{fontSize: 13, fontWeight: 600, marginTop: 2}}>{p.tasks.done}/{p.tasks.total}</div>
                </div>
              </div>
              <div className="project-card-meta">
                <span><I.Calendar size={11} style={{verticalAlign:"middle", marginRight:4}}/>{p.start} → {p.end}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Proje</th><th>Müşteri</th><th>Durum</th><th>İlerleme</th><th>Bütçe</th><th>Bitiş</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={()=>onNavigate("project-detail", p.id)}>
                  <td style={{fontWeight: 500}}>{p.name}</td>
                  <td>{p.customer}</td>
                  <td><StatusPill status={p.status}/></td>
                  <td style={{minWidth: 160}}>
                    <div style={{display:"flex", alignItems:"center", gap: 8}}>
                      <Progress value={p.progress}/>
                      <span className="mono" style={{fontSize: 11, color:"var(--text-tertiary)", minWidth: 32}}>%{p.progress}</span>
                    </div>
                  </td>
                  <td className="mono">{formatCurrency(p.budget)}</td>
                  <td className="mono" style={{fontSize: 12, color:"var(--text-secondary)"}}>{p.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProjectDetailPage({ projectId, onNavigate }) {
  const D = window.SoloData;
  const p = D.projects.find(x => x.id === projectId) || D.projects[0];
  const milestones = D.milestones.filter(m => m.projectId === p.id);
  const tasks = D.tasks.filter(t => t.projectId === p.id);

  return (
    <div className="page fade-in">
      <div style={{marginBottom: 8}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate("projects")}><I.ChevronLeft size={12}/> Projeler</button>
      </div>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 6}}>
            <h1 style={{margin: 0}}>{p.name}</h1>
            <StatusPill status={p.status}/>
          </div>
          <div className="page-subtitle">
            <span>{p.customer}</span>
            <span style={{margin: "0 8px"}}>·</span>
            <I.Calendar size={11} style={{verticalAlign:"middle", marginRight: 4}}/>
            {p.start} → {p.end}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={()=>onNavigate("kanban", p.id)}><I.Kanban size={14}/> Kanban</button>
          <button className="btn btn-secondary"><I.Edit size={14}/> Düzenle</button>
          <button className="btn btn-primary"><I.Plus size={14}/> Görev ekle</button>
        </div>
      </div>

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <div className="stat">
          <div className="stat-label">İlerleme</div>
          <div className="stat-value">%{p.progress}</div>
          <div style={{marginTop: 8}}><Progress value={p.progress}/></div>
        </div>
        <div className="stat">
          <div className="stat-label">Bütçe</div>
          <div className="stat-value">{formatCurrency(p.budget)}</div>
          <div className="stat-meta">{formatCurrency(p.spent)} harcandı (%{Math.round(p.spent/p.budget*100)})</div>
        </div>
        <div className="stat">
          <div className="stat-label">Görevler</div>
          <div className="stat-value">{p.tasks.done}<span style={{color:"var(--text-tertiary)", fontSize:18, fontWeight:400}}>/{p.tasks.total}</span></div>
          <div className="stat-meta">{p.tasks.total - p.tasks.done} kaldı</div>
        </div>
        <div className="stat">
          <div className="stat-label">Kilometre taşları</div>
          <div className="stat-value">{p.milestones.done}<span style={{color:"var(--text-tertiary)", fontSize:18, fontWeight:400}}>/{p.milestones.total}</span></div>
          <div className="stat-meta">tamamlandı</div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 16}}>
        <div className="card">
          <div className="card-header">
            <h2>Kilometre Taşları</h2>
            <button className="btn btn-ghost btn-sm"><I.Plus size={12}/> Ekle</button>
          </div>
          <div style={{padding: 8}}>
            {milestones.map(m => (
              <div key={m.id} style={{display:"flex", alignItems:"center", gap: 12, padding: "10px 12px", borderRadius: 8, transition:"background .12s"}}
                   onMouseEnter={(e)=>e.currentTarget.style.background="var(--bg-hover)"}
                   onMouseLeave={(e)=>e.currentTarget.style.background=""}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `2px solid ${m.done?"var(--success)":"var(--border-strong)"}`,
                  background: m.done ? "var(--success)" : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor: "pointer", flexShrink: 0,
                }}>
                  {m.done && <I.Check size={12} stroke={3} style={{color:"#fff"}}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize: 13, fontWeight: 500, textDecoration: m.done?"line-through":"none", color: m.done?"var(--text-tertiary)":"var(--text)"}}>
                    {m.title}
                  </div>
                </div>
                <span className="mono" style={{fontSize: 11, color:"var(--text-tertiary)"}}>{m.due}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Detaylar</h2>
          </div>
          <div className="card-body" style={{display:"flex", flexDirection:"column", gap: 14}}>
            <div>
              <div style={{fontSize: 11, color:"var(--text-tertiary)", marginBottom: 4}}>Müşteri</div>
              <div style={{display:"flex", alignItems:"center", gap: 8, fontSize: 13}}>
                <Avatar name={p.customer} size="sm"/>
                {p.customer}
              </div>
            </div>
            <div>
              <div style={{fontSize: 11, color:"var(--text-tertiary)", marginBottom: 4}}>Açıklama</div>
              <div style={{fontSize: 12.5, color:"var(--text-secondary)", lineHeight: 1.5}}>
                Tam kapsamlı e-ticaret platformu yenileme — mobil-first tasarım, ödeme entegrasyonu ve müşteri portalı dahil.
              </div>
            </div>
            <div>
              <div style={{fontSize: 11, color:"var(--text-tertiary)", marginBottom: 4}}>Etiketler</div>
              <div style={{display:"flex", flexWrap:"wrap", gap: 4}}>
                <span className="tag tag-purple">tasarım</span>
                <span className="tag tag-blue">frontend</span>
                <span className="tag tag-yellow">backend</span>
              </div>
            </div>
            <div style={{borderTop:"1px dashed var(--border)", paddingTop: 12, fontSize: 11, color:"var(--text-tertiary)"}}>
              Oluşturuldu: 12 Mar 2026<br/>
              Son güncelleme: 22 Nis 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectsPage, ProjectDetailPage });
