// Sidebar + Topbar layout

const { useState: useStateL } = React;

function Sidebar({ active, onNavigate }) {
  const D = window.SoloData;
  const items = [
    { key: "dashboard", icon: <I.Home/>, label: "Ana Sayfa" },
    { key: "customers", icon: <I.Users/>, label: "Müşteriler", count: D.customers.length },
    { key: "projects", icon: <I.Folder/>, label: "Projeler", count: D.projects.filter(p=>p.status!=="Completed").length },
    { key: "timetracker", icon: <I.Clock/>, label: "Zaman Takibi" },
    { key: "invoices", icon: <I.Receipt/>, label: "Faturalar", count: D.invoices.filter(i=>["Sent","Overdue","ClientApproved"].includes(i.status)).length },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">S</div>
        <div className="sidebar-brand-name">SoloSync</div>
        <div style={{flex:1}}/>
        <Badge cls="badge-gray" style={{fontSize: 10, height: 18}}>v1.0</Badge>
      </div>

      <div className="sidebar-section-label">Çalışma alanı</div>
      <nav className="sidebar-nav">
        {items.map(it => (
          <div key={it.key} className={`sidebar-link ${active.startsWith(it.key) || (it.key==="projects" && (active==="project-detail" || active==="kanban")) || (it.key==="invoices" && active==="invoice-detail") ?"active":""}`}
               onClick={()=>onNavigate(it.key)}>
            {it.icon}
            <span>{it.label}</span>
            {it.count != null && <span className="count">{it.count}</span>}
          </div>
        ))}

        <div className="sidebar-section-label">Hesap</div>
        <div className="sidebar-link" onClick={()=>onNavigate("settings")}>
          <I.Settings/><span>Ayarlar</span>
        </div>
        <div className="sidebar-link">
          <I.Bell/><span>Bildirimler</span>
          <span className="count" style={{background:"var(--danger)", color:"#fff", borderRadius: 10, padding:"1px 6px"}}>3</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <Avatar name="Doğukan Kalkan"/>
          <div className="user-card-info">
            <div className="user-card-name">Doğukan Kalkan</div>
            <div className="user-card-email">dogukan@solosync.app</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" title="Çıkış"><I.Logout size={14}/></button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ page, onSearch, theme, onToggleTheme }) {
  const titles = {
    dashboard: "Ana Sayfa",
    customers: "Müşteriler",
    projects: "Projeler",
    "project-detail": "Proje Detayı",
    kanban: "Kanban",
    timetracker: "Zaman Takibi",
    invoices: "Faturalar",
    "invoice-detail": "Fatura Detayı",
    settings: "Ayarlar",
  };
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-crumbs">
          <span>SoloSync</span>
          <span className="sep">/</span>
          <span className="here">{titles[page] || page}</span>
        </div>
      </div>
      <div style={{flex:1}}/>
      <div className="search" style={{width: 280}}>
        <I.Search size={14}/>
        <input className="input" placeholder="Hızlı ara... (⌘K)" />
      </div>
      <button className="btn btn-ghost btn-icon" title="Bildirimler"><I.Bell size={16}/></button>
      <button className="btn btn-ghost btn-icon" onClick={onToggleTheme} title={theme==="dark"?"Aydınlık tema":"Karanlık tema"}>
        {theme === "dark" ? <I.Sun size={16}/> : <I.Moon size={16}/>}
      </button>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
