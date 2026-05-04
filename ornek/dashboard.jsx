// Dashboard home page

function DashboardHome({ onNavigate }) {
  const D = window.SoloData;
  const totalRevenue = D.invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.paid,0);
  const pendingRevenue = D.invoices.filter(i=>["Sent","ClientApproved","Overdue"].includes(i.status)).reduce((s,i)=>s+i.total,0);
  const activeProjects = D.projects.filter(p=>p.status==="InProgress" || p.status==="InRevision").length;
  const todayHours = (D.weeklyHours[new Date().getDay()===0?6:new Date().getDay()-1] || 5.8);

  const maxH = Math.max(...D.weeklyHours, 1);
  const todayIdx = (new Date().getDay()+6)%7;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Günaydın, Doğukan 👋</h1>
          <div className="page-subtitle">İşte bugünkü işlerin ve bu haftaki performansın.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Calendar size={14}/> Bu hafta</button>
          <button className="btn btn-primary" onClick={()=>onNavigate("timetracker")}><I.Play size={12}/> Kronometre başlat</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label"><I.DollarSign/> Bu ay tahsilat</div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-meta up"><I.ArrowUp size={12}/> %18 önceki aya göre</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Receipt/> Bekleyen tahsilat</div>
          <div className="stat-value">{formatCurrency(pendingRevenue)}</div>
          <div className="stat-meta">{D.invoices.filter(i=>i.status==="Overdue").length} fatura gecikmiş</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Briefcase/> Aktif proje</div>
          <div className="stat-value">{activeProjects}</div>
          <div className="stat-meta">{D.projects.filter(p=>p.status==="Pending").length} beklemede</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Clock/> Bugün çalışılan</div>
          <div className="stat-value">{todayHours.toFixed(1)} <span style={{fontSize:14, color:"var(--text-tertiary)", fontWeight: 400}}>saat</span></div>
          <div className="stat-meta up"><I.TrendingUp size={12}/> Hedefin üstünde</div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 16, marginBottom: 16}}>
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Haftalık çalışma süresi</h2>
              <div style={{fontSize: 12, color: "var(--text-tertiary)", marginTop: 2}}>Toplam {D.weeklyHours.reduce((a,b)=>a+b,0).toFixed(1)} saat</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate("timetracker")}>Detay <I.ChevronRight size={12}/></button>
          </div>
          <div className="card-body">
            <div style={{display:"flex", alignItems:"flex-end", gap: 14, height: 180, paddingTop: 8}}>
              {D.weeklyHours.map((h, i) => (
                <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap: 8}}>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500}} className="mono">{h ? h.toFixed(1) : "–"}</div>
                  <div style={{
                    width: "100%", height: `${(h/maxH)*120}px`, minHeight: 4,
                    background: i===todayIdx ? "var(--accent)" : "var(--accent-soft-strong)",
                    borderRadius: "4px 4px 0 0",
                    transition: "background .2s",
                  }}/>
                  <div style={{fontSize: 11, color: i===todayIdx ? "var(--text)" : "var(--text-tertiary)", fontWeight: i===todayIdx ? 600 : 400}}>
                    {D.weekDays[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Yaklaşan kilometre taşları</h2>
          </div>
          <div style={{padding: "8px 16px 16px"}}>
            {D.milestones.filter(m=>!m.done).slice(0,4).map(m => {
              const proj = D.projects.find(p=>p.id===m.projectId);
              return (
                <div key={m.id} style={{padding: "10px 0", borderBottom: "1px dashed var(--border)"}}>
                  <div style={{display:"flex", alignItems:"center", gap: 8, marginBottom: 4}}>
                    <I.Flag size={12} style={{color:"var(--warning)"}}/>
                    <div style={{fontSize: 13, fontWeight: 500, flex: 1}}>{m.title}</div>
                  </div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)", paddingLeft: 20, display:"flex", justifyContent:"space-between"}}>
                    <span>{proj?.name}</span>
                    <span className="mono">{m.due}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap: 16}}>
        <div className="card">
          <div className="card-header">
            <h2>Aktif projeler</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate("projects")}>Hepsi <I.ChevronRight size={12}/></button>
          </div>
          <div style={{padding: "4px 0"}}>
            {D.projects.filter(p=>p.status!=="Completed").slice(0,4).map(p => (
              <div key={p.id} onClick={()=>onNavigate("project-detail", p.id)} style={{padding:"12px 16px", borderBottom: "1px solid var(--border)", cursor:"pointer", transition:"background .12s"}} 
                   onMouseEnter={(e)=>e.currentTarget.style.background="var(--bg-hover)"}
                   onMouseLeave={(e)=>e.currentTarget.style.background=""}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 8}}>
                  <div style={{fontSize: 13, fontWeight: 500}}>{p.name}</div>
                  <StatusPill status={p.status}/>
                </div>
                <div style={{display:"flex", alignItems:"center", gap: 12, fontSize: 11, color:"var(--text-tertiary)"}}>
                  <span>{p.customer}</span>
                  <span>•</span>
                  <span>{p.tasks.done}/{p.tasks.total} görev</span>
                  <span style={{flex:1}}/>
                  <span className="mono">%{p.progress}</span>
                </div>
                <div style={{marginTop: 8}}><Progress value={p.progress}/></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Son aktiviteler</h2>
          </div>
          <div style={{padding: "8px 16px 16px"}}>
            {D.activities.map(a => (
              <div key={a.id} className="activity">
                <div className="activity-dot" style={{background: a.type==="invoice"?"var(--success-soft)":a.type==="comment"?"var(--accent-soft)":"var(--bg-subtle)"}}>
                  {a.type==="task" && <I.CheckCircle size={14} style={{color:"var(--success)"}}/>}
                  {a.type==="comment" && <I.MessageSquare size={14} style={{color:"var(--accent)"}}/>}
                  {a.type==="invoice" && <I.DollarSign size={14} style={{color:"var(--success)"}}/>}
                  {a.type==="milestone" && <I.Flag size={14} style={{color:"var(--warning)"}}/>}
                  {a.type==="project" && <I.Briefcase size={14} style={{color:"var(--accent)"}}/>}
                </div>
                <div style={{flex:1}}>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.who} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardHome = DashboardHome;
