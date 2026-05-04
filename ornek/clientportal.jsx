// SoloSync — Client (Müşteri) Portali
// Tek dosyada: layout, ana sayfa, projelerim, proje detayı, faturalarım, fatura detayı.
// Mevcut tasarım sistemini (styles.css) ve ortak primitives'i (Avatar, Badge, Modal, Tabs, Progress, Empty, I) yeniden kullanır.

const { useState: useStateCP, useEffect: useEffectCP, useMemo: useMemoCP } = React;

// ----------------------------- Mock data (Client gözüyle) -----------------------------

const ClientData = {
  // Oturumu açan müşteri — Selin Demir, Mavi Pazarlama A.Ş.
  user: {
    firstName: "Selin",
    lastName: "Demir",
    email: "selin@mavipazarlama.com.tr",
    company: "Mavi Pazarlama A.Ş.",
    role: "Müşteri",
    initials: "SD",
  },
  freelancer: {
    name: "Doğukan Kalkan",
    title: "Freelance UI/UX Designer",
    email: "dogukan@solosync.app",
    initials: "DK",
  },
  // Sadece bu müşteriye ait projeler
  projects: [
    {
      id: "p1",
      name: "E-Ticaret Yenileme — Mavi",
      status: "InProgress",
      progress: 47,
      start: "12 Mar 2026",
      end: "30 Haz 2026",
      lastUpdate: "23 Nis 2026",
      milestones: { total: 5, done: 2 },
      tasks: { total: 24, done: 11 },
      description: "Tam kapsamlı e-ticaret platformu yenileme — mobil-öncelikli tasarım, ödeme entegrasyonu ve müşteri portali dahil.",
    },
    {
      id: "p6",
      name: "Dashboard Tasarımı",
      status: "InProgress",
      progress: 40,
      start: "20 Mar 2026",
      end: "10 Haz 2026",
      lastUpdate: "22 Nis 2026",
      milestones: { total: 4, done: 1 },
      tasks: { total: 18, done: 7 },
      description: "İç kullanım için yönetim paneli; analitik, raporlar ve kullanıcı yönetimi bileşenleri.",
    },
    {
      id: "p_archive",
      name: "Landing Page Yenileme",
      status: "Completed",
      progress: 100,
      start: "10 Oca 2026",
      end: "28 Şub 2026",
      lastUpdate: "28 Şub 2026",
      milestones: { total: 3, done: 3 },
      tasks: { total: 9, done: 9 },
      description: "Anasayfa ve kampanya sayfası yenilemesi — 3 hafta içinde teslim edildi.",
    },
  ],
  milestones: {
    p1: [
      { id: "m1", title: "Tasarım onayı (Anasayfa + Ürün)", due: "20 Nis 2026", done: true, order: 1 },
      { id: "m2", title: "Ön yüz prototip (React + Tailwind)", due: "10 May 2026", done: true, order: 2 },
      { id: "m3", title: "Backend API entegrasyonu", due: "01 Haz 2026", done: false, order: 3 },
      { id: "m4", title: "Ödeme & sepet akışı", due: "15 Haz 2026", done: false, order: 4 },
      { id: "m5", title: "UAT ve canlıya alma", due: "30 Haz 2026", done: false, order: 5 },
    ],
    p6: [
      { id: "dm1", title: "Tasarım sistemi taslağı", due: "01 Nis 2026", done: true, order: 1 },
      { id: "dm2", title: "Modül 1: Analitik ekranları", due: "10 May 2026", done: false, order: 2 },
      { id: "dm3", title: "Modül 2: Kullanıcı yönetimi", due: "20 May 2026", done: false, order: 3 },
      { id: "dm4", title: "Sunum ve teslim", due: "10 Haz 2026", done: false, order: 4 },
    ],
    p_archive: [
      { id: "lm1", title: "Wireframe", due: "20 Oca 2026", done: true, order: 1 },
      { id: "lm2", title: "Hi-fi tasarım", due: "10 Şub 2026", done: true, order: 2 },
      { id: "lm3", title: "Kodlama & teslim", due: "28 Şub 2026", done: true, order: 3 },
    ],
  },
  // Müşterinin gördüğü görevler — sadece isim ve durum, salt-okunur
  tasks: {
    p1: [
      { id: "t1", title: "Anasayfa hero bölümü tasarım iterasyonu", status: "Todo" },
      { id: "t4", title: "Filtreleme bileşeni (kategori + fiyat)", status: "InProgress" },
      { id: "t5", title: "Sepet API entegrasyonu", status: "InProgress" },
      { id: "t7", title: "Anasayfa lighthouse optimizasyonu", status: "Review" },
      { id: "t9", title: "Tasarım sistemi tokenları (renkler)", status: "Done" },
      { id: "t10", title: "Logo refresh varyasyonları", status: "Done" },
      { id: "t11", title: "Wireframe akışları (Figma)", status: "Done" },
    ],
    p6: [
      { id: "dt1", title: "Sidebar navigasyonu", status: "Done" },
      { id: "dt2", title: "Analitik kart bileşenleri", status: "InProgress" },
      { id: "dt3", title: "Filtre paneli", status: "Todo" },
    ],
    p_archive: [],
  },
  // Faturalar — bu müşteriye kesilmiş
  invoices: [
    { id: "i1", number: "INV-2026-0014", projectId: "p1", projectName: "E-Ticaret Yenileme — Mavi", issueDate: "15 Nis 2026", dueDate: "30 Nis 2026", total: 32500, status: "Sent" },
    { id: "i5", number: "INV-2026-0010", projectId: "p1", projectName: "E-Ticaret Yenileme — Mavi", issueDate: "25 Mar 2026", dueDate: "10 Nis 2026", total: 14000, status: "Paid" },
    { id: "i_dash", number: "INV-2026-0006", projectId: "p6", projectName: "Dashboard Tasarımı", issueDate: "10 Mar 2026", dueDate: "25 Mar 2026", total: 9800, status: "ClientApproved" },
    { id: "i_old", number: "INV-2026-0002", projectId: "p_archive", projectName: "Landing Page Yenileme", issueDate: "01 Şub 2026", dueDate: "16 Şub 2026", total: 12500, status: "Paid" },
  ],
  invoiceItems: {
    i1: [
      { desc: "UI/UX Tasarım — Sprint 3", qty: 40, unit: 650, amount: 26000 },
      { desc: "Tasarım sistemi dokümantasyonu", qty: 5, unit: 800, amount: 4000 },
      { desc: "Müşteri sunumu hazırlığı", qty: 5, unit: 500, amount: 2500 },
    ],
    i5: [
      { desc: "UI/UX Tasarım — Sprint 1-2", qty: 20, unit: 700, amount: 14000 },
    ],
    i_dash: [
      { desc: "Dashboard keşif & wireframe", qty: 14, unit: 700, amount: 9800 },
    ],
    i_old: [
      { desc: "Landing yeniden tasarım — paket fiyat", qty: 1, unit: 12500, amount: 12500 },
    ],
  },
  comments: {
    i1: [
      { id: "co1", userId: "self", author: "Doğukan Kalkan", role: "Freelancer", content: "Merhaba Selin Hanım, Sprint 3 kapsamında tamamlanan tasarımlar için faturayı ilettim. İncelemenizi rica ederim.", at: "15 Nis, 14:22" },
      { id: "co2", userId: "me", author: "Selin Demir", role: "Müşteri", content: "Eline sağlık Doğukan. Muhasebe ile paylaştım, bu hafta içinde ödenecek.", at: "15 Nis, 16:08" },
      { id: "co3", userId: "self", author: "Doğukan Kalkan", role: "Freelancer", content: "Çok teşekkürler! Sprint 4 planlamasını da yarın paylaşacağım.", at: "15 Nis, 16:14" },
    ],
    p1: [
      { id: "pc1", userId: "self", author: "Doğukan Kalkan", role: "Freelancer", content: "Filtreleme bileşeninin ilk hali bugün hazır olacak — önizlemeyi paylaşacağım.", at: "Bugün, 09:40" },
      { id: "pc2", userId: "me", author: "Selin Demir", role: "Müşteri", content: "Harika! Mobil görünümünü özellikle merak ediyoruz.", at: "Bugün, 10:12" },
    ],
  },
  notifications: [
    { id: "n1", icon: "receipt", title: "Yeni fatura alındı", body: "INV-2026-0014 · ₺32.500", time: "15 Nis", unread: true },
    { id: "n2", icon: "milestone", title: "Tasarım onayı tamamlandı", body: "E-Ticaret Yenileme — Milestone 1/5", time: "20 Nis", unread: true },
    { id: "n3", icon: "comment", title: "Doğukan bir mesaj yazdı", body: "Filtreleme bileşeninin ilk hali bugün hazır olacak…", time: "Bugün", unread: true },
    { id: "n4", icon: "milestone", title: "Ön yüz prototip tamamlandı", body: "E-Ticaret Yenileme — Milestone 2/5", time: "10 May", unread: false },
  ],
  activities: [
    { id: "a1", icon: "milestone", text: "**Ön yüz prototip** kilometre taşı tamamlandı", project: "E-Ticaret Yenileme", time: "10 May" },
    { id: "a2", icon: "task", text: "**3 yeni görev** İnceleme aşamasına alındı", project: "E-Ticaret Yenileme", time: "Dün" },
    { id: "a3", icon: "comment", text: "Doğukan **filtreleme bileşeni** üzerine yorum yaptı", project: "E-Ticaret Yenileme", time: "Bugün" },
    { id: "a4", icon: "receipt", text: "**INV-2026-0014** size gönderildi", project: "E-Ticaret Yenileme", time: "15 Nis" },
  ],
};
window.ClientData = ClientData;

// Müşteri durum etiketleri (özel — daha sıcak dil)
const cpInvoiceStatus = {
  Draft:             { label: "Taslak",            cls: "badge-gray" },
  Sent:              { label: "Onayınız bekleniyor", cls: "badge-blue" },
  Paid:              { label: "Ödendi",             cls: "badge-green" },
  Overdue:           { label: "Gecikmiş",           cls: "badge-red" },
  ClientApproved:    { label: "Onayladınız",        cls: "badge-purple" },
  RevisionRequested: { label: "Revizyon istendi",   cls: "badge-yellow" },
};

// ----------------------------- Layout (Sidebar + Topbar) -----------------------------

function CPSidebar({ active, onNavigate }) {
  const D = window.ClientData;
  const items = [
    { key: "home",     icon: <I.Home/>,    label: "Özet" },
    { key: "projects", icon: <I.Folder/>,  label: "Projelerim", count: D.projects.filter(p => p.status !== "Completed").length },
    { key: "invoices", icon: <I.Receipt/>, label: "Faturalarım", count: D.invoices.filter(i => i.status === "Sent" || i.status === "Overdue").length },
    { key: "messages", icon: <I.MessageSquare/>, label: "Mesajlar", count: 1 },
  ];

  const isActive = (key) => {
    if (active === key) return true;
    if (key === "projects" && active === "project-detail") return true;
    if (key === "invoices" && active === "invoice-detail") return true;
    return false;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">S</div>
        <div className="sidebar-brand-name">SoloSync</div>
        <div style={{flex:1}}/>
        <Badge cls="badge-purple" style={{fontSize: 10, height: 18}}>Müşteri</Badge>
      </div>

      {/* Workspace card — bağlı olduğu freelancer'ı göster */}
      <div style={{padding: "12px 14px", borderBottom: "1px solid var(--border)"}}>
        <div style={{fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6}}>Çalışma alanı</div>
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <Avatar name={D.freelancer.name} size="sm"/>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 12.5, fontWeight: 500}}>{D.freelancer.name}</div>
            <div style={{fontSize: 11, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{D.freelancer.title}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section-label">Portal</div>
      <nav className="sidebar-nav">
        {items.map(it => (
          <div key={it.key} className={`sidebar-link ${isActive(it.key) ? "active" : ""}`} onClick={() => onNavigate(it.key)}>
            {it.icon}
            <span>{it.label}</span>
            {it.count != null && it.count > 0 && <span className="count">{it.count}</span>}
          </div>
        ))}

        <div className="sidebar-section-label">Hesap</div>
        <div className={`sidebar-link ${active === "settings" ? "active" : ""}`} onClick={() => onNavigate("settings")}>
          <I.Settings/><span>Ayarlar</span>
        </div>
        <div className="sidebar-link" onClick={() => onNavigate("notifications")}>
          <I.Bell/><span>Bildirimler</span>
          <span className="count" style={{background: "var(--danger)", color: "#fff", borderRadius: 10, padding: "1px 6px"}}>3</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <Avatar name={`${D.user.firstName} ${D.user.lastName}`}/>
          <div className="user-card-info">
            <div className="user-card-name">{D.user.firstName} {D.user.lastName}</div>
            <div className="user-card-email">{D.user.company}</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" title="Çıkış"><I.Logout size={14}/></button>
        </div>
      </div>
    </aside>
  );
}

function CPTopbar({ page, theme, onToggleTheme }) {
  const titles = {
    home: "Özet",
    projects: "Projelerim",
    "project-detail": "Proje Detayı",
    invoices: "Faturalarım",
    "invoice-detail": "Fatura Detayı",
    messages: "Mesajlar",
    settings: "Ayarlar",
    notifications: "Bildirimler",
  };
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-crumbs">
          <span>Müşteri Portalı</span>
          <span className="sep">/</span>
          <span className="here">{titles[page] || page}</span>
        </div>
      </div>
      <div style={{flex: 1}}/>
      <div className="search" style={{width: 280}}>
        <I.Search size={14}/>
        <input className="input" placeholder="Proje veya fatura ara..."/>
      </div>
      <button className="btn btn-ghost btn-icon" title="Bildirimler" style={{position: "relative"}}>
        <I.Bell size={16}/>
        <span style={{position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "var(--danger)", borderRadius: "50%"}}/>
      </button>
      <button className="btn btn-ghost btn-icon" onClick={onToggleTheme} title={theme === "dark" ? "Aydınlık tema" : "Karanlık tema"}>
        {theme === "dark" ? <I.Sun size={16}/> : <I.Moon size={16}/>}
      </button>
    </div>
  );
}

// ----------------------------- Pages -----------------------------

function CPHome({ onNavigate }) {
  const D = window.ClientData;
  const activeProjects = D.projects.filter(p => p.status !== "Completed");
  const pendingInvoices = D.invoices.filter(i => i.status === "Sent");
  const pendingTotal = pendingInvoices.reduce((s, i) => s + i.total, 0);
  const paidTotal = D.invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.total, 0);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Hoş geldiniz, {D.user.firstName} 👋</h1>
          <div className="page-subtitle">{D.user.company} · Doğukan Kalkan ile birlikte çalışılan projeler ve faturalar.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => onNavigate("messages")}>
            <I.MessageSquare size={14}/> Doğukan'a yaz
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="stat-grid" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
        <div className="stat">
          <div className="stat-label"><I.Folder/> Aktif projeler</div>
          <div className="stat-value">{activeProjects.length}</div>
          <div className="stat-meta">{D.projects.filter(p => p.status === "Completed").length} tamamlandı</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Flag/> Yaklaşan kilometre taşı</div>
          <div className="stat-value" style={{fontSize: 18, fontWeight: 600}}>Backend API</div>
          <div className="stat-meta">01 Haz 2026 · 36 gün</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.AlertCircle/> Onayınızı bekleyen</div>
          <div className="stat-value" style={{color: pendingInvoices.length ? "var(--accent)" : "var(--text)"}}>{formatCurrency(pendingTotal)}</div>
          <div className="stat-meta">{pendingInvoices.length} fatura inceleme bekliyor</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.CheckCircle/> Bu yıl ödenen</div>
          <div className="stat-value">{formatCurrency(paidTotal)}</div>
          <div className="stat-meta">{D.invoices.filter(i => i.status === "Paid").length} fatura</div>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16}}>
        {/* Active projects with progress */}
        <div className="flex-col" style={{gap: 16}}>
          <div className="card">
            <div className="card-header">
              <h2>Aktif projeler</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("projects")}>Tümünü gör <I.ArrowRight size={12}/></button>
            </div>
            <div style={{padding: "8px 4px 12px"}}>
              {activeProjects.map(p => (
                <div key={p.id} onClick={() => onNavigate("project-detail", p.id)}
                     style={{padding: "14px 16px", borderTop: "1px solid var(--border)", cursor: "pointer", transition: "background .12s"}}
                     onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                     onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8}}>
                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                      <div style={{fontSize: 14, fontWeight: 600}}>{p.name}</div>
                      <StatusPill status={p.status}/>
                    </div>
                    <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>Son güncelleme: {p.lastUpdate}</div>
                  </div>
                  <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 8}}>
                    <div style={{flex: 1}}>
                      <Progress value={p.progress}/>
                    </div>
                    <div style={{fontSize: 12, color: "var(--text-secondary)", minWidth: 36, textAlign: "right"}} className="mono">%{p.progress}</div>
                  </div>
                  <div style={{display: "flex", gap: 18, fontSize: 11.5, color: "var(--text-tertiary)"}}>
                    <span><I.Flag size={11} style={{verticalAlign: "-1px"}}/> {p.milestones.done}/{p.milestones.total} kilometre</span>
                    <span><I.Layers size={11} style={{verticalAlign: "-1px"}}/> {p.tasks.done}/{p.tasks.total} görev</span>
                    <span><I.Calendar size={11} style={{verticalAlign: "-1px"}}/> {p.start} → {p.end}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="card">
            <div className="card-header"><h2>Son aktiviteler</h2></div>
            <div style={{padding: "4px 16px 12px"}}>
              {D.activities.map(a => {
                const iconMap = { milestone: <I.Flag/>, task: <I.Layers/>, comment: <I.MessageSquare/>, receipt: <I.Receipt/> };
                return (
                  <div key={a.id} className="activity">
                    <div className="activity-dot">{iconMap[a.icon] || <I.Sparkles/>}</div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div className="activity-text" dangerouslySetInnerHTML={{__html: a.text}}/>
                      <div className="activity-time">{a.project} · {a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: action panel + invoices peek */}
        <div className="flex-col" style={{gap: 16}}>
          {pendingInvoices.length > 0 && (
            <div className="card" style={{borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)"}}>
              <div className="card-body">
                <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
                  <I.AlertCircle size={16} style={{color: "var(--accent)"}}/>
                  <strong style={{fontSize: 13}}>Aksiyonunuz bekleniyor</strong>
                </div>
                <div style={{fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12}}>
                  <strong className="mono" style={{color: "var(--text)"}}>{pendingInvoices[0].number}</strong> faturası inceleme bekliyor — {formatCurrency(pendingInvoices[0].total)}.
                </div>
                <button className="btn btn-primary" style={{width: "100%"}} onClick={() => onNavigate("invoice-detail", pendingInvoices[0].id)}>
                  Faturayı incele <I.ArrowRight size={12}/>
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2>Son faturalar</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("invoices")}>Tümü <I.ArrowRight size={12}/></button>
            </div>
            <div style={{padding: "4px 0"}}>
              {D.invoices.slice(0, 4).map(i => (
                <div key={i.id} onClick={() => onNavigate("invoice-detail", i.id)}
                     style={{display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: "1px solid var(--border)", cursor: "pointer"}}
                     onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                     onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div className="mono" style={{fontSize: 12.5, fontWeight: 500}}>{i.number}</div>
                    <div style={{fontSize: 11, color: "var(--text-tertiary)", marginTop: 2}}>{i.dueDate}</div>
                  </div>
                  <div style={{textAlign: "right"}}>
                    <div className="mono" style={{fontSize: 13, fontWeight: 600}}>{formatCurrency(i.total)}</div>
                    <Badge cls={cpInvoiceStatus[i.status].cls} style={{height: 16, fontSize: 10, marginTop: 2}}>{cpInvoiceStatus[i.status].label}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Doğukan ile iletişim</h2></div>
            <div className="card-body">
              <div style={{display: "flex", gap: 12, alignItems: "center", marginBottom: 12}}>
                <Avatar name={D.freelancer.name} size="lg"/>
                <div>
                  <div style={{fontSize: 14, fontWeight: 600}}>{D.freelancer.name}</div>
                  <div style={{fontSize: 12, color: "var(--text-tertiary)"}}>{D.freelancer.title}</div>
                </div>
              </div>
              <div style={{display: "flex", gap: 8}}>
                <button className="btn btn-secondary btn-sm" style={{flex: 1}}><I.Mail size={12}/> E-posta</button>
                <button className="btn btn-primary btn-sm" style={{flex: 1}} onClick={() => onNavigate("messages")}><I.MessageSquare size={12}/> Mesaj</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CPProjects({ onNavigate }) {
  const D = window.ClientData;
  const [filter, setFilter] = useStateCP("all");
  const [search, setSearch] = useStateCP("");

  const filtered = D.projects.filter(p => {
    const okFilter = filter === "all" || p.status === filter;
    const okSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return okFilter && okSearch;
  });

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Projelerim</h1>
          <div className="page-subtitle">Sizin için yürütülen projelerin ilerlemesini takip edin.</div>
        </div>
      </div>

      <div style={{display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap"}}>
        <div className="search" style={{flex: 1, maxWidth: 320}}>
          <I.Search size={14}/>
          <input className="input" placeholder="Proje ara..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Tabs items={[
          { value: "all", label: "Tümü", count: D.projects.length },
          { value: "InProgress", label: "Devam ediyor", count: D.projects.filter(p => p.status === "InProgress").length },
          { value: "InRevision", label: "Revizyon", count: D.projects.filter(p => p.status === "InRevision").length },
          { value: "Completed", label: "Tamamlandı", count: D.projects.filter(p => p.status === "Completed").length },
        ]} value={filter} onChange={setFilter}/>
      </div>

      {filtered.length === 0 ? (
        <Empty icon={<I.Folder size={20}/>} title="Proje bulunamadı" sub="Bu filtreye uyan proje yok."/>
      ) : (
        <div className="grid-3">
          {filtered.map(p => (
            <div key={p.id} className="project-card" onClick={() => onNavigate("project-detail", p.id)}>
              <div style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8}}>
                <div className="project-card-title">{p.name}</div>
                <StatusPill status={p.status}/>
              </div>
              <div className="project-card-desc">{p.description}</div>
              <div>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6}}>
                  <span>İlerleme</span>
                  <span className="mono">%{p.progress}</span>
                </div>
                <Progress value={p.progress} kind={p.status === "Completed" ? "success" : ""}/>
              </div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 10, borderTop: "1px solid var(--border)"}}>
                <div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>Kilometre taşları</div>
                  <div style={{fontSize: 13, fontWeight: 600, marginTop: 2}}>
                    <span className="mono">{p.milestones.done}/{p.milestones.total}</span>
                  </div>
                </div>
                <div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>Görevler</div>
                  <div style={{fontSize: 13, fontWeight: 600, marginTop: 2}}>
                    <span className="mono">{p.tasks.done}/{p.tasks.total}</span>
                  </div>
                </div>
              </div>
              <div className="project-card-meta">
                <span><I.Calendar size={11} style={{verticalAlign: "-1px"}}/> {p.start} → {p.end}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CPProjectDetail({ projectId, onNavigate }) {
  const D = window.ClientData;
  const p = D.projects.find(x => x.id === projectId) || D.projects[0];
  const milestones = D.milestones[p.id] || [];
  const tasks = D.tasks[p.id] || [];
  const projectComments = D.comments[p.id] || [];
  const [comments, setComments] = useStateCP(projectComments);
  const [newC, setNewC] = useStateCP("");

  const send = () => {
    if (!newC.trim()) return;
    setComments([...comments, { id: `pc-${Date.now()}`, userId: "me", author: `${D.user.firstName} ${D.user.lastName}`, role: "Müşteri", content: newC, at: "Şimdi" }]);
    setNewC("");
  };

  // Group tasks by status
  const grouped = {
    Todo: tasks.filter(t => t.status === "Todo"),
    InProgress: tasks.filter(t => t.status === "InProgress"),
    Review: tasks.filter(t => t.status === "Review"),
    Done: tasks.filter(t => t.status === "Done"),
  };

  return (
    <div className="page fade-in">
      <div style={{marginBottom: 4}}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("projects")}>
          <I.ChevronLeft size={12}/> Projelerim
        </button>
      </div>

      <div className="page-header">
        <div className="page-title-group">
          <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 6}}>
            <h1 style={{margin: 0}}>{p.name}</h1>
            <StatusPill status={p.status}/>
          </div>
          <div className="page-subtitle">
            <I.Calendar size={11} style={{verticalAlign: "-1px"}}/> {p.start} → {p.end} · Son güncelleme {p.lastUpdate}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Download size={14}/> Brief PDF</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="stat-grid" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
        <div className="stat">
          <div className="stat-label">İlerleme</div>
          <div className="stat-value">%{p.progress}</div>
          <div style={{marginTop: 8}}><Progress value={p.progress} kind={p.status === "Completed" ? "success" : ""}/></div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Flag/> Kilometre taşları</div>
          <div className="stat-value"><span className="mono">{p.milestones.done}<span style={{color: "var(--text-tertiary)", fontSize: 18}}>/{p.milestones.total}</span></span></div>
          <div className="stat-meta">{p.milestones.total - p.milestones.done} kaldı</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Layers/> Görevler</div>
          <div className="stat-value"><span className="mono">{p.tasks.done}<span style={{color: "var(--text-tertiary)", fontSize: 18}}>/{p.tasks.total}</span></span></div>
          <div className="stat-meta">{p.tasks.total - p.tasks.done} aktif görev</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Clock/> Kalan süre</div>
          <div className="stat-value">36 gün</div>
          <div className="stat-meta">Hedef: {p.end}</div>
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16}}>
        <div className="flex-col" style={{gap: 16}}>
          {/* Milestone timeline */}
          <div className="card">
            <div className="card-header">
              <h2>Kilometre taşları</h2>
              <Badge cls="badge-gray">{p.milestones.done} / {p.milestones.total} tamamlandı</Badge>
            </div>
            <div className="card-body" style={{padding: "8px 16px 16px"}}>
              <div style={{position: "relative", paddingLeft: 12}}>
                <div style={{position: "absolute", left: 16, top: 12, bottom: 12, width: 2, background: "var(--border)"}}/>
                {milestones.map((m, idx) => (
                  <div key={m.id} style={{position: "relative", paddingLeft: 24, paddingTop: 10, paddingBottom: 10}}>
                    <div style={{
                      position: "absolute", left: 0, top: 12,
                      width: 18, height: 18, borderRadius: "50%",
                      background: m.done ? "var(--success)" : "var(--bg-elevated)",
                      border: m.done ? "2px solid var(--success)" : "2px solid var(--border-strong)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff",
                    }}>
                      {m.done && <I.Check size={10} stroke={3}/>}
                    </div>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12}}>
                      <div>
                        <div style={{fontSize: 13.5, fontWeight: 500, color: m.done ? "var(--text-tertiary)" : "var(--text)", textDecoration: m.done ? "line-through" : "none"}}>
                          {m.title}
                        </div>
                        <div style={{fontSize: 11, color: "var(--text-tertiary)", marginTop: 2}}>
                          {m.done ? "Tamamlandı · " : "Hedef · "}{m.due}
                        </div>
                      </div>
                      {!m.done && idx === milestones.findIndex(x => !x.done) && (
                        <Badge cls="badge-blue">Sıradaki</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <div style={{padding: 24, color: "var(--text-tertiary)", fontSize: 13, textAlign: "center"}}>
                    Henüz kilometre taşı eklenmedi.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tasks (read-only) */}
          <div className="card">
            <div className="card-header">
              <h2>Görevler</h2>
              <Badge cls="badge-gray">Salt görüntüleme</Badge>
            </div>
            <div className="card-body" style={{padding: "8px 16px 16px"}}>
              {tasks.length === 0 ? (
                <div style={{padding: 24, color: "var(--text-tertiary)", fontSize: 13, textAlign: "center"}}>
                  Bu projede görüntülenecek görev yok.
                </div>
              ) : (
                <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10}}>
                  {Object.entries(grouped).map(([status, list]) => (
                    <div key={status}>
                      <div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8}}>
                        <span style={{width: 6, height: 6, borderRadius: "50%", background: window.taskStatusMeta[status].color}}/>
                        {window.taskStatusMeta[status].label} <span style={{color: "var(--text-tertiary)", fontWeight: 400}}>{list.length}</span>
                      </div>
                      <div style={{display: "flex", flexDirection: "column", gap: 6}}>
                        {list.map(t => (
                          <div key={t.id} style={{
                            padding: "8px 10px",
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--r-sm)",
                            fontSize: 12.5, lineHeight: 1.4,
                          }}>
                            {t.title}
                          </div>
                        ))}
                        {list.length === 0 && (
                          <div style={{padding: "10px 8px", fontSize: 11, color: "var(--text-tertiary)", fontStyle: "italic"}}>—</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Brief + Discussion */}
        <div className="flex-col" style={{gap: 16}}>
          <div className="card">
            <div className="card-header"><h2>Proje özeti</h2></div>
            <div className="card-body" style={{display: "flex", flexDirection: "column", gap: 14, fontSize: 13}}>
              <div>
                <div style={{fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4}}>Açıklama</div>
                <div style={{lineHeight: 1.6}}>{p.description}</div>
              </div>
              <div style={{borderTop: "1px dashed var(--border)", paddingTop: 12}}>
                <div style={{fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4}}>Sorumlu</div>
                <div style={{display: "flex", alignItems: "center", gap: 10, marginTop: 6}}>
                  <Avatar name={D.freelancer.name} size="sm"/>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 500}}>{D.freelancer.name}</div>
                    <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>{D.freelancer.email}</div>
                  </div>
                </div>
              </div>
              <div style={{borderTop: "1px dashed var(--border)", paddingTop: 12, fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.7}}>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Başlangıç</span><span style={{color: "var(--text-secondary)"}}>{p.start}</span></div>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Bitiş</span><span style={{color: "var(--text-secondary)"}}>{p.end}</span></div>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Son güncelleme</span><span style={{color: "var(--text-secondary)"}}>{p.lastUpdate}</span></div>
              </div>
            </div>
          </div>

          {/* Discussion */}
          <div className="card">
            <div className="card-header">
              <h2><I.MessageSquare size={14} style={{verticalAlign: "middle", marginRight: 6}}/>Proje tartışması</h2>
            </div>
            <div className="card-body">
              <div className="comment-list" style={{marginBottom: 14}}>
                {comments.map(c => (
                  <div key={c.id} className={`comment-row ${c.userId === "me" ? "me" : ""}`}>
                    {c.userId !== "me" && <Avatar name={c.author} size="sm"/>}
                    <div style={{flex: 1, display: "flex", flexDirection: "column", alignItems: c.userId === "me" ? "flex-end" : "flex-start"}}>
                      <div className="comment-meta">
                        <strong style={{color: "var(--text)", fontSize: 12, fontWeight: 600}}>{c.author}</strong>
                        <Badge cls={c.role === "Freelancer" ? "badge-blue" : "badge-purple"} style={{height: 16, fontSize: 10, padding: "0 6px"}}>{c.role}</Badge>
                        <span>·</span>
                        <span>{c.at}</span>
                      </div>
                      <div className="comment-bubble">{c.content}</div>
                    </div>
                    {c.userId === "me" && <Avatar name={c.author} size="sm"/>}
                  </div>
                ))}
                {comments.length === 0 && (
                  <div style={{padding: "20px 8px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13}}>
                    Henüz mesaj yok. İlk mesajı siz yazın.
                  </div>
                )}
              </div>
              <div style={{display: "flex", gap: 8, alignItems: "flex-end"}}>
                <textarea className="textarea" placeholder="Mesaj yaz... (Enter ile gönder)"
                          value={newC}
                          onChange={e => setNewC(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                          style={{minHeight: 56}}/>
                <button className="btn btn-primary btn-icon" onClick={send} style={{height: 56, width: 44}}>
                  <I.Send size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CPInvoices({ onNavigate }) {
  const D = window.ClientData;
  const [filter, setFilter] = useStateCP("all");

  const filtered = D.invoices.filter(i => filter === "all" || i.status === filter);
  const pending = D.invoices.filter(i => i.status === "Sent").reduce((s, i) => s + i.total, 0);
  const paid = D.invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.total, 0);
  const approved = D.invoices.filter(i => i.status === "ClientApproved").reduce((s, i) => s + i.total, 0);
  const overdue = D.invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.total, 0);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Faturalarım</h1>
          <div className="page-subtitle">{D.invoices.length} fatura · Doğukan Kalkan tarafından düzenlendi.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Download size={14}/> Tümünü indir</button>
        </div>
      </div>

      <div className="stat-grid" style={{gridTemplateColumns: "repeat(4, 1fr)"}}>
        <div className="stat">
          <div className="stat-label"><I.AlertCircle/> Onayınız bekleniyor</div>
          <div className="stat-value" style={{color: pending ? "var(--accent)" : "var(--text)"}}>{formatCurrency(pending)}</div>
          <div className="stat-meta">{D.invoices.filter(i => i.status === "Sent").length} fatura</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.CheckCircle/> Onayladığınız</div>
          <div className="stat-value">{formatCurrency(approved)}</div>
          <div className="stat-meta">Ödeme bekleniyor</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.DollarSign/> Bu yıl ödenen</div>
          <div className="stat-value">{formatCurrency(paid)}</div>
          <div className="stat-meta">{D.invoices.filter(i => i.status === "Paid").length} fatura</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Clock/> Gecikmiş</div>
          <div className="stat-value" style={{color: overdue ? "var(--danger-text)" : "var(--text)"}}>{formatCurrency(overdue)}</div>
          <div className="stat-meta">{D.invoices.filter(i => i.status === "Overdue").length} fatura</div>
        </div>
      </div>

      <div style={{marginBottom: 14}}>
        <Tabs items={[
          { value: "all", label: "Tümü", count: D.invoices.length },
          { value: "Sent", label: "Onay bekliyor", count: D.invoices.filter(i => i.status === "Sent").length },
          { value: "ClientApproved", label: "Onayladığım", count: D.invoices.filter(i => i.status === "ClientApproved").length },
          { value: "Paid", label: "Ödendi", count: D.invoices.filter(i => i.status === "Paid").length },
          { value: "Overdue", label: "Gecikmiş", count: D.invoices.filter(i => i.status === "Overdue").length },
        ]} value={filter} onChange={setFilter}/>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Fatura No</th>
              <th>Proje</th>
              <th>Tarih</th>
              <th>Vade</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th style={{width: 40}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} onClick={() => onNavigate("invoice-detail", inv.id)}>
                <td className="mono" style={{fontWeight: 500}}>{inv.number}</td>
                <td style={{fontSize: 13}}>{inv.projectName}</td>
                <td style={{fontSize: 12.5, color: "var(--text-secondary)"}}>{inv.issueDate}</td>
                <td style={{fontSize: 12.5}}>
                  {inv.status === "Overdue"
                    ? <span style={{color: "var(--danger-text)", fontWeight: 500}}>{inv.dueDate}</span>
                    : <span className="mono" style={{color: "var(--text-secondary)"}}>{inv.dueDate}</span>}
                </td>
                <td style={{fontWeight: 600}} className="mono">{formatCurrency(inv.total)}</td>
                <td><Badge cls={cpInvoiceStatus[inv.status].cls}>{cpInvoiceStatus[inv.status].label}</Badge></td>
                <td><button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => e.stopPropagation()}><I.ChevronRight size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <Empty icon={<I.Receipt size={20}/>} title="Fatura yok" sub="Bu filtreye uyan fatura bulunamadı."/>
        )}
      </div>
    </div>
  );
}

function CPInvoiceDetail({ invoiceId, onNavigate }) {
  const D = window.ClientData;
  const inv = D.invoices.find(x => x.id === invoiceId) || D.invoices[0];
  const items = D.invoiceItems[inv.id] || [{ desc: "Hizmet bedeli", qty: 1, unit: inv.total, amount: inv.total }];
  const initialComments = D.comments[inv.id] || [];
  const [comments, setComments] = useStateCP(initialComments);
  const [newC, setNewC] = useStateCP("");
  const [status, setStatus] = useStateCP(inv.status);
  const [revisionOpen, setRevisionOpen] = useStateCP(false);
  const [revisionNote, setRevisionNote] = useStateCP("");
  const [toast, setToast] = useStateCP(null);

  const totalNet = items.reduce((s, i) => s + i.amount, 0);
  const kdv = Math.round(totalNet * 0.20);
  const totalGross = totalNet + kdv;

  const send = () => {
    if (!newC.trim()) return;
    setComments([...comments, { id: `co-${Date.now()}`, userId: "me", author: `${D.user.firstName} ${D.user.lastName}`, role: "Müşteri", content: newC, at: "Şimdi" }]);
    setNewC("");
  };

  const approve = () => {
    setStatus("ClientApproved");
    setComments([...comments, { id: `co-${Date.now()}`, userId: "me", author: `${D.user.firstName} ${D.user.lastName}`, role: "Müşteri", content: "Faturayı onayladım. Ödeme planı kapsamında işleme alınacak.", at: "Şimdi" }]);
    setToast({ kind: "success", text: "Fatura onaylandı." });
    setTimeout(() => setToast(null), 3000);
  };

  const requestRevision = () => {
    if (!revisionNote.trim()) return;
    setStatus("RevisionRequested");
    setComments([...comments, { id: `co-${Date.now()}`, userId: "me", author: `${D.user.firstName} ${D.user.lastName}`, role: "Müşteri", content: `[Revizyon Talebi]: ${revisionNote}`, at: "Şimdi" }]);
    setRevisionNote("");
    setRevisionOpen(false);
    setToast({ kind: "success", text: "Revizyon talebiniz iletildi." });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="page fade-in">
      <div style={{marginBottom: 4}}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("invoices")}>
          <I.ChevronLeft size={12}/> Faturalarım
        </button>
      </div>

      <div className="page-header">
        <div className="page-title-group">
          <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 6}}>
            <h1 style={{margin: 0}} className="mono">{inv.number}</h1>
            <Badge cls={cpInvoiceStatus[status].cls}>{cpInvoiceStatus[status].label}</Badge>
          </div>
          <div className="page-subtitle">{inv.projectName} · Düzenleme: {inv.issueDate} · Vade: {inv.dueDate}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Download size={14}/> PDF indir</button>
        </div>
      </div>

      {/* Action banner */}
      {status === "Sent" && (
        <div className="card" style={{marginBottom: 16, borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)"}}>
          <div style={{padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"}}>
            <div style={{width: 40, height: 40, borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0}}>
              <I.AlertCircle size={20}/>
            </div>
            <div style={{flex: 1, minWidth: 240}}>
              <div style={{fontSize: 14, fontWeight: 600, marginBottom: 2}}>Bu fatura onayınızı bekliyor</div>
              <div style={{fontSize: 12.5, color: "var(--text-secondary)"}}>İçeriği inceleyip onaylayabilir veya revizyon talep edebilirsiniz. Onayladıktan sonra ödeme planlanır.</div>
            </div>
            <div style={{display: "flex", gap: 8}}>
              <button className="btn btn-secondary" onClick={() => setRevisionOpen(true)}>
                <I.Edit size={14}/> Revizyon iste
              </button>
              <button className="btn btn-primary" onClick={approve}>
                <I.CheckCircle size={14}/> Onayla
              </button>
            </div>
          </div>
        </div>
      )}
      {status === "ClientApproved" && (
        <div className="card" style={{marginBottom: 16, borderColor: "transparent", background: "var(--success-soft)"}}>
          <div style={{padding: 14, display: "flex", alignItems: "center", gap: 12}}>
            <I.CheckCircle size={18} style={{color: "var(--success)"}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--success-text)"}}>Bu faturayı onayladınız.</div>
              <div style={{fontSize: 12, color: "var(--text-secondary)", marginTop: 2}}>Ödemeniz Doğukan Kalkan tarafından planlanacak. Onay tarihi: Şimdi.</div>
            </div>
          </div>
        </div>
      )}
      {status === "RevisionRequested" && (
        <div className="card" style={{marginBottom: 16, borderColor: "transparent", background: "var(--warning-soft)"}}>
          <div style={{padding: 14, display: "flex", alignItems: "center", gap: 12}}>
            <I.Edit size={18} style={{color: "var(--warning)"}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--warning-text)"}}>Revizyon talebiniz iletildi.</div>
              <div style={{fontSize: 12, color: "var(--text-secondary)", marginTop: 2}}>Doğukan Kalkan, talebinizi inceleyip yeniden düzenlenmiş bir fatura paylaşacak.</div>
            </div>
          </div>
        </div>
      )}
      {status === "Paid" && (
        <div className="card" style={{marginBottom: 16, borderColor: "transparent", background: "var(--success-soft)"}}>
          <div style={{padding: 14, display: "flex", alignItems: "center", gap: 12}}>
            <I.CheckCircle size={18} style={{color: "var(--success)"}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--success-text)"}}>Bu fatura ödendi.</div>
              <div style={{fontSize: 12, color: "var(--text-secondary)", marginTop: 2}}>Ödeme tarihi: {inv.dueDate}. Teşekkürler!</div>
            </div>
          </div>
        </div>
      )}
      {status === "Overdue" && (
        <div className="card" style={{marginBottom: 16, borderColor: "transparent", background: "var(--danger-soft)"}}>
          <div style={{padding: 14, display: "flex", alignItems: "center", gap: 12}}>
            <I.AlertCircle size={18} style={{color: "var(--danger)"}}/>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--danger-text)"}}>Bu fatura vadesi geçmiş durumda.</div>
              <div style={{fontSize: 12, color: "var(--text-secondary)", marginTop: 2}}>Vade tarihi {inv.dueDate}. Lütfen ödemeyi en kısa sürede planlayın.</div>
            </div>
          </div>
        </div>
      )}

      <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16}}>
        <div className="flex-col" style={{gap: 16}}>
          {/* Invoice paper */}
          <div className="card">
            <div style={{padding: 24}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, borderBottom: "1px solid var(--border)", marginBottom: 20}}>
                <div>
                  <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <div className="sidebar-brand-mark" style={{width: 32, height: 32, fontSize: 14}}>S</div>
                    <div className="sidebar-brand-name" style={{fontSize: 16}}>SoloSync</div>
                  </div>
                  <div style={{marginTop: 12, fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6}}>
                    {D.freelancer.name}<br/>
                    {D.freelancer.title}<br/>
                    İstanbul, Türkiye
                  </div>
                </div>
                <div style={{textAlign: "right"}}>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em"}}>Fatura No</div>
                  <div className="mono" style={{fontSize: 15, fontWeight: 600, marginTop: 2}}>{inv.number}</div>
                </div>
              </div>

              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20}}>
                <div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6}}>Fatura Edilen</div>
                  <div style={{fontSize: 13, fontWeight: 500}}>{D.user.company}</div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.5}}>
                    Vergi No: 6230012345
                  </div>
                </div>
                <div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6}}>Düzenleme</div>
                  <div style={{fontSize: 13}}>{inv.issueDate}</div>
                </div>
                <div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6}}>Vade</div>
                  <div style={{fontSize: 13}}>{inv.dueDate}</div>
                </div>
              </div>

              <table className="table invoice-items" style={{marginBottom: 20}}>
                <thead>
                  <tr>
                    <th>Açıklama</th>
                    <th style={{width: 60, textAlign: "right"}}>Miktar</th>
                    <th style={{width: 100, textAlign: "right"}}>Birim</th>
                    <th style={{width: 120, textAlign: "right"}}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.desc}</td>
                      <td className="mono" style={{textAlign: "right"}}>{it.qty}</td>
                      <td className="mono" style={{textAlign: "right", color: "var(--text-secondary)"}}>{formatCurrency(it.unit)}</td>
                      <td className="mono" style={{textAlign: "right", fontWeight: 500}}>{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{display: "flex", justifyContent: "flex-end"}}>
                <div style={{minWidth: 240}}>
                  <div style={{display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13}}>
                    <span style={{color: "var(--text-tertiary)"}}>Ara toplam</span>
                    <span className="mono">{formatCurrency(totalNet)}</span>
                  </div>
                  <div style={{display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13}}>
                    <span style={{color: "var(--text-tertiary)"}}>KDV (%20)</span>
                    <span className="mono">{formatCurrency(kdv)}</span>
                  </div>
                  <div style={{display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "1px solid var(--border)", marginTop: 8, fontSize: 16, fontWeight: 600}}>
                    <span>Toplam</span>
                    <span className="mono">{formatCurrency(totalGross)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h2><I.MessageSquare size={14} style={{verticalAlign: "middle", marginRight: 6}}/>Yorumlar ({comments.length})</h2>
            </div>
            <div className="card-body">
              <div className="comment-list" style={{marginBottom: 16}}>
                {comments.map(c => (
                  <div key={c.id} className={`comment-row ${c.userId === "me" ? "me" : ""}`}>
                    {c.userId !== "me" && <Avatar name={c.author} size="sm"/>}
                    <div style={{flex: 1, display: "flex", flexDirection: "column", alignItems: c.userId === "me" ? "flex-end" : "flex-start"}}>
                      <div className="comment-meta">
                        <strong style={{color: "var(--text)", fontSize: 12, fontWeight: 600}}>{c.author}</strong>
                        <Badge cls={c.role === "Freelancer" ? "badge-blue" : "badge-purple"} style={{height: 16, fontSize: 10, padding: "0 6px"}}>{c.role}</Badge>
                        <span>·</span>
                        <span>{c.at}</span>
                      </div>
                      <div className="comment-bubble">{c.content}</div>
                    </div>
                    {c.userId === "me" && <Avatar name={c.author} size="sm"/>}
                  </div>
                ))}
                {comments.length === 0 && (
                  <div style={{padding: "24px 12px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 13}}>
                    Henüz yorum yok. İlk yorumu siz yazın.
                  </div>
                )}
              </div>
              <div style={{display: "flex", gap: 8, alignItems: "flex-end"}}>
                <textarea className="textarea" placeholder="Bir yorum yaz... (Enter ile gönder)"
                          value={newC} onChange={e => setNewC(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                          style={{minHeight: 56}}/>
                <button className="btn btn-primary btn-icon" onClick={send} style={{height: 56, width: 44}}>
                  <I.Send size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-col" style={{gap: 16}}>
          <div className="card">
            <div className="card-header"><h2>Özet</h2></div>
            <div className="card-body" style={{display: "flex", flexDirection: "column", gap: 14}}>
              <div>
                <div style={{fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4}}>Ödenecek tutar</div>
                <div style={{fontSize: 22, fontWeight: 600}} className="mono">{formatCurrency(totalGross)}</div>
              </div>
              <div style={{borderTop: "1px dashed var(--border)", paddingTop: 12, fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.7}}>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Düzenleme</span><span style={{color: "var(--text-secondary)"}}>{inv.issueDate}</span></div>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Son ödeme</span><span style={{color: "var(--text-secondary)"}}>{inv.dueDate}</span></div>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Proje</span><span style={{color: "var(--text-secondary)"}}>{inv.projectName}</span></div>
                <div style={{display: "flex", justifyContent: "space-between"}}><span>Düzenleyen</span><span style={{color: "var(--text-secondary)"}}>{D.freelancer.name}</span></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Banka bilgileri</h2></div>
            <div className="card-body" style={{fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.8}}>
              <div><span style={{color: "var(--text-tertiary)"}}>IBAN:</span> <span className="mono">TR12 0006 4000 0011 2345 6789 01</span></div>
              <div><span style={{color: "var(--text-tertiary)"}}>Banka:</span> İş Bankası</div>
              <div><span style={{color: "var(--text-tertiary)"}}>Hesap sahibi:</span> Doğukan Kalkan</div>
              <div style={{marginTop: 10, padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--r-md)", fontSize: 11.5, color: "var(--text-tertiary)"}}>
                Ödeme açıklamasına lütfen <strong className="mono" style={{color: "var(--text-secondary)"}}>{inv.number}</strong> yazınız.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revision modal */}
      <Modal open={revisionOpen} onClose={() => setRevisionOpen(false)} title="Revizyon talep et"
             footer={<>
               <button className="btn btn-secondary" onClick={() => setRevisionOpen(false)}>İptal</button>
               <button className="btn btn-primary" onClick={requestRevision} disabled={!revisionNote.trim()}>Talebi gönder</button>
             </>}>
        <div className="field">
          <label className="label">Lütfen revizyonun nedenini açıklayın</label>
          <textarea className="textarea" placeholder="Hangi kalemde değişiklik istiyorsunuz? Sebep..." rows={5}
                    value={revisionNote} onChange={e => setRevisionNote(e.target.value)}/>
          <div className="help">Bu mesaj Doğukan Kalkan'a iletilecek ve yorumlara otomatik olarak eklenecek.</div>
        </div>
      </Modal>

      {toast && (
        <div className="toast-stack">
          <Toast kind={toast.kind}>{toast.text}</Toast>
        </div>
      )}
    </div>
  );
}

function CPMessages() {
  const D = window.ClientData;
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Mesajlar</h1>
          <div className="page-subtitle">Doğukan Kalkan ile yapılan tüm yazışmalar.</div>
        </div>
      </div>
      <div className="card">
        <div className="card-body" style={{padding: 0}}>
          <div style={{display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 520}}>
            {/* Thread list */}
            <div style={{borderRight: "1px solid var(--border)"}}>
              {[
                { id: "p1", title: "E-Ticaret Yenileme — Mavi", last: "Filtreleme bileşeninin ilk hali bugün hazır olacak…", time: "Bugün", unread: 1, active: true },
                { id: "i1", title: "INV-2026-0014", last: "Çok teşekkürler! Sprint 4 planlamasını da yarın paylaşacağım.", time: "15 Nis", unread: 0, active: false },
                { id: "p6", title: "Dashboard Tasarımı", last: "İlk wireframe taslağı paylaştım, geri bildirim bekliyorum.", time: "20 Nis", unread: 0, active: false },
              ].map(t => (
                <div key={t.id} style={{
                  padding: "12px 14px", borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: t.active ? "var(--bg-subtle)" : "transparent",
                  borderLeft: t.active ? "3px solid var(--accent)" : "3px solid transparent",
                }}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4}}>
                    <div style={{fontSize: 13, fontWeight: 600}}>{t.title}</div>
                    <div style={{fontSize: 10, color: "var(--text-tertiary)"}}>{t.time}</div>
                  </div>
                  <div style={{fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"}}>
                    {t.last}
                  </div>
                  {t.unread > 0 && (
                    <span style={{display: "inline-block", marginTop: 4, fontSize: 10, fontWeight: 500, color: "#fff", background: "var(--accent)", borderRadius: 10, padding: "1px 8px"}}>
                      {t.unread} yeni
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Thread body */}
            <div style={{display: "flex", flexDirection: "column"}}>
              <div style={{padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10}}>
                <Avatar name={D.freelancer.name} size="sm"/>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontSize: 13, fontWeight: 600}}>E-Ticaret Yenileme — Mavi</div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>{D.freelancer.name} ile tartışma</div>
                </div>
                <Badge cls="badge-blue" dot>Çevrimiçi</Badge>
              </div>

              <div style={{flex: 1, padding: 16, overflowY: "auto"}}>
                <div className="comment-list">
                  {(D.comments.p1 || []).map(c => (
                    <div key={c.id} className={`comment-row ${c.userId === "me" ? "me" : ""}`}>
                      {c.userId !== "me" && <Avatar name={c.author} size="sm"/>}
                      <div style={{flex: 1, display: "flex", flexDirection: "column", alignItems: c.userId === "me" ? "flex-end" : "flex-start"}}>
                        <div className="comment-meta">
                          <strong style={{color: "var(--text)", fontSize: 12, fontWeight: 600}}>{c.author}</strong>
                          <span>·</span>
                          <span>{c.at}</span>
                        </div>
                        <div className="comment-bubble">{c.content}</div>
                      </div>
                      {c.userId === "me" && <Avatar name={c.author} size="sm"/>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "flex-end"}}>
                <textarea className="textarea" placeholder="Mesaj yaz..." style={{minHeight: 44}}/>
                <button className="btn btn-primary btn-icon" style={{height: 44, width: 44}}><I.Send size={16}/></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CPSettings() {
  const D = window.ClientData;
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Ayarlar</h1>
          <div className="page-subtitle">Profil ve bildirim tercihleri.</div>
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
        <div className="card">
          <div className="card-header"><h2>Profil</h2></div>
          <div className="card-body">
            <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 16}}>
              <Avatar name={`${D.user.firstName} ${D.user.lastName}`} size="xl"/>
              <div>
                <div style={{fontSize: 15, fontWeight: 600}}>{D.user.firstName} {D.user.lastName}</div>
                <div style={{fontSize: 12, color: "var(--text-tertiary)"}}>{D.user.role} · {D.user.company}</div>
              </div>
            </div>
            <div className="field"><label className="label">Ad Soyad</label><input className="input" defaultValue={`${D.user.firstName} ${D.user.lastName}`}/></div>
            <div className="field"><label className="label">E-posta</label><input className="input" defaultValue={D.user.email}/></div>
            <div className="field"><label className="label">Şirket</label><input className="input" defaultValue={D.user.company}/></div>
            <button className="btn btn-primary">Kaydet</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Bildirim tercihleri</h2></div>
          <div className="card-body">
            {[
              { id: "n1", title: "Yeni fatura geldiğinde", desc: "E-posta ile bilgilendir.", on: true },
              { id: "n2", title: "Kilometre taşı tamamlandığında", desc: "Anında bildirim al.", on: true },
              { id: "n3", title: "Doğukan mesaj attığında", desc: "Hem e-posta hem bildirim.", on: true },
              { id: "n4", title: "Haftalık özet raporu", desc: "Her Pazartesi sabahı.", on: false },
            ].map(n => (
              <div key={n.id} style={{display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px dashed var(--border)"}}>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 13, fontWeight: 500}}>{n.title}</div>
                  <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>{n.desc}</div>
                </div>
                <div style={{width: 36, height: 20, background: n.on ? "var(--accent)" : "var(--border-strong)", borderRadius: 10, position: "relative", cursor: "pointer", transition: "background .12s"}}>
                  <div style={{position: "absolute", top: 2, left: n.on ? 18 : 2, width: 16, height: 16, background: "#fff", borderRadius: "50%", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CPNotifications() {
  const D = window.ClientData;
  const iconMap = { receipt: <I.Receipt/>, milestone: <I.Flag/>, comment: <I.MessageSquare/> };
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Bildirimler</h1>
          <div className="page-subtitle">Projeleriniz ve faturalarınızla ilgili tüm güncellemeler.</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">Tümünü okundu işaretle</button>
        </div>
      </div>
      <div className="card">
        <div style={{padding: "4px 0"}}>
          {D.notifications.map(n => (
            <div key={n.id} style={{display: "flex", gap: 12, padding: "14px 16px", borderTop: "1px solid var(--border)", background: n.unread ? "var(--accent-soft)" : "transparent", cursor: "pointer"}}>
              <div style={{width: 32, height: 32, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0}}>
                {iconMap[n.icon] || <I.Bell/>}
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 13, fontWeight: 500, marginBottom: 2}}>{n.title}</div>
                <div style={{fontSize: 12, color: "var(--text-secondary)"}}>{n.body}</div>
              </div>
              <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4}}>
                <div style={{fontSize: 11, color: "var(--text-tertiary)"}}>{n.time}</div>
                {n.unread && <span style={{width: 8, height: 8, borderRadius: "50%", background: "var(--accent)"}}/>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------- Root -----------------------------

const CP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "blue"
}/*EDITMODE-END*/;

const cpAccentColors = {
  blue:    { primary: "#2563eb", hover: "#1d4ed8", soft: "#eff6ff", softStrong: "#dbeafe", text: "#1e40af" },
  indigo:  { primary: "#4f46e5", hover: "#4338ca", soft: "#eef2ff", softStrong: "#e0e7ff", text: "#3730a3" },
  violet:  { primary: "#7c3aed", hover: "#6d28d9", soft: "#f5f3ff", softStrong: "#ede9fe", text: "#5b21b6" },
  green:   { primary: "#059669", hover: "#047857", soft: "#ecfdf5", softStrong: "#d1fae5", text: "#065f46" },
  orange:  { primary: "#ea580c", hover: "#c2410c", soft: "#fff7ed", softStrong: "#ffedd5", text: "#9a3412" },
  rose:    { primary: "#e11d48", hover: "#be123c", soft: "#fff1f2", softStrong: "#ffe4e6", text: "#9f1239" },
};

function ClientPortalApp() {
  const [tweaks, setTweak] = useTweaks(CP_TWEAK_DEFAULTS);
  const [page, setPage] = useStateCP("home");
  const [pageParam, setPageParam] = useStateCP(null);

  useEffectCP(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    const c = cpAccentColors[tweaks.accent] || cpAccentColors.blue;
    document.documentElement.style.setProperty("--accent", c.primary);
    document.documentElement.style.setProperty("--accent-hover", c.hover);
    if (tweaks.theme === "light") {
      document.documentElement.style.setProperty("--accent-soft", c.soft);
      document.documentElement.style.setProperty("--accent-soft-strong", c.softStrong);
      document.documentElement.style.setProperty("--accent-text", c.text);
    } else {
      const r = parseInt(c.primary.slice(1, 3), 16), g = parseInt(c.primary.slice(3, 5), 16), b = parseInt(c.primary.slice(5, 7), 16);
      document.documentElement.style.setProperty("--accent-soft", `rgba(${r},${g},${b},0.12)`);
      document.documentElement.style.setProperty("--accent-soft-strong", `rgba(${r},${g},${b},0.22)`);
      document.documentElement.style.setProperty("--accent-text", `rgb(${Math.min(255, r + 80)},${Math.min(255, g + 80)},${Math.min(255, b + 80)})`);
    }
  }, [tweaks.theme, tweaks.accent]);

  const navigate = (p, param) => { setPage(p); setPageParam(param || null); window.scrollTo({top: 0, behavior: "smooth"}); };

  let content;
  switch (page) {
    case "home":            content = <CPHome onNavigate={navigate}/>; break;
    case "projects":        content = <CPProjects onNavigate={navigate}/>; break;
    case "project-detail":  content = <CPProjectDetail projectId={pageParam} onNavigate={navigate}/>; break;
    case "invoices":        content = <CPInvoices onNavigate={navigate}/>; break;
    case "invoice-detail":  content = <CPInvoiceDetail invoiceId={pageParam} onNavigate={navigate}/>; break;
    case "messages":        content = <CPMessages/>; break;
    case "settings":        content = <CPSettings/>; break;
    case "notifications":   content = <CPNotifications/>; break;
    default:                content = <CPHome onNavigate={navigate}/>;
  }

  return (
    <>
      <div className="app">
        <CPSidebar active={page} onNavigate={navigate}/>
        <div className="main">
          <CPTopbar page={page}
                    theme={tweaks.theme}
                    onToggleTheme={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}/>
          <div key={page + (pageParam || "")} style={{flex: 1, display: "flex", flexDirection: "column"}}>
            {content}
          </div>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Görünüm">
          <TweakRadio label="Tema" value={tweaks.theme}
                      onChange={(v) => setTweak("theme", v)}
                      options={[{value: "light", label: "Light"}, {value: "dark", label: "Dark"}]}/>
        </TweakSection>
        <TweakSection label="Marka rengi">
          <div style={{display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8}}>
            {Object.entries(cpAccentColors).map(([k, v]) => (
              <button key={k} onClick={() => setTweak("accent", k)} title={k}
                      style={{
                        width: "100%", height: 32, borderRadius: 8, background: v.primary,
                        border: tweaks.accent === k ? "2px solid var(--text)" : "2px solid transparent",
                        cursor: "pointer", outline: "none",
                        boxShadow: tweaks.accent === k ? "0 0 0 2px var(--bg-elevated), 0 0 0 4px var(--accent)" : "none",
                      }}/>
            ))}
          </div>
        </TweakSection>
        <TweakSection label="Hızlı aksiyonlar">
          <TweakButton onClick={() => { setPage("invoice-detail"); setPageParam("i1"); }}>Onay bekleyen faturayı aç</TweakButton>
          <TweakButton onClick={() => { setPage("project-detail"); setPageParam("p1"); }}>E-Ticaret projesini aç</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ClientPortalApp/>);
