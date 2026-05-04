// Root App

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "blue",
  "density": "comfortable",
  "radius": 10
}/*EDITMODE-END*/;

const accentColors = {
  blue:    { primary: "#2563eb", hover: "#1d4ed8", soft: "#eff6ff", softStrong: "#dbeafe", text: "#1e40af" },
  indigo:  { primary: "#4f46e5", hover: "#4338ca", soft: "#eef2ff", softStrong: "#e0e7ff", text: "#3730a3" },
  violet:  { primary: "#7c3aed", hover: "#6d28d9", soft: "#f5f3ff", softStrong: "#ede9fe", text: "#5b21b6" },
  green:   { primary: "#059669", hover: "#047857", soft: "#ecfdf5", softStrong: "#d1fae5", text: "#065f46" },
  orange:  { primary: "#ea580c", hover: "#c2410c", soft: "#fff7ed", softStrong: "#ffedd5", text: "#9a3412" },
  rose:    { primary: "#e11d48", hover: "#be123c", soft: "#fff1f2", softStrong: "#ffe4e6", text: "#9f1239" },
};

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stage, setStage] = useStateA("login"); // login | register | onboarding | app
  const [page, setPage] = useStateA("dashboard");
  const [pageParam, setPageParam] = useStateA(null);

  // Apply theme + accent
  useEffectA(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    const c = accentColors[tweaks.accent] || accentColors.blue;
    document.documentElement.style.setProperty("--accent", c.primary);
    document.documentElement.style.setProperty("--accent-hover", c.hover);
    if (tweaks.theme === "light") {
      document.documentElement.style.setProperty("--accent-soft", c.soft);
      document.documentElement.style.setProperty("--accent-soft-strong", c.softStrong);
      document.documentElement.style.setProperty("--accent-text", c.text);
    } else {
      // Use rgba for dark
      const rgb = hexToRgb(c.primary);
      document.documentElement.style.setProperty("--accent-soft", `rgba(${rgb}, 0.12)`);
      document.documentElement.style.setProperty("--accent-soft-strong", `rgba(${rgb}, 0.22)`);
      document.documentElement.style.setProperty("--accent-text", lightenHex(c.primary, 0.4));
    }
    // density
    document.documentElement.style.setProperty("--density-pad", tweaks.density === "compact" ? "8px 12px" : tweaks.density === "cozy" ? "16px 20px" : "12px 16px");
    // radius
    document.documentElement.style.setProperty("--r-md", `${tweaks.radius - 2}px`);
    document.documentElement.style.setProperty("--r-lg", `${tweaks.radius}px`);
    document.documentElement.style.setProperty("--r-xl", `${tweaks.radius + 4}px`);
  }, [tweaks.theme, tweaks.accent, tweaks.density, tweaks.radius]);

  const navigate = (p, param) => { setPage(p); setPageParam(param || null); window.scrollTo({top:0, behavior:"smooth"}); };

  if (stage === "login") return <LoginPage onLogin={()=>setStage("onboarding")} onGoRegister={()=>setStage("register")}/>;
  if (stage === "register") return <RegisterPage onRegister={()=>setStage("onboarding")} onGoLogin={()=>setStage("login")}/>;
  if (stage === "onboarding") return <OnboardingFlow onDone={()=>setStage("app")}/>;

  let content;
  switch (page) {
    case "dashboard": content = <DashboardHome onNavigate={navigate}/>; break;
    case "customers": content = <CustomersPage onNavigate={navigate}/>; break;
    case "projects": content = <ProjectsPage onNavigate={navigate}/>; break;
    case "project-detail": content = <ProjectDetailPage projectId={pageParam} onNavigate={navigate}/>; break;
    case "kanban": content = <KanbanBoard projectId={pageParam} onNavigate={navigate}/>; break;
    case "timetracker": content = <TimeTrackerPage onNavigate={navigate}/>; break;
    case "invoices": content = <InvoicesPage onNavigate={navigate}/>; break;
    case "invoice-detail": content = <InvoiceDetailPage invoiceId={pageParam} onNavigate={navigate}/>; break;
    case "settings": content = <SettingsPlaceholder/>; break;
    default: content = <DashboardHome onNavigate={navigate}/>;
  }

  return (
    <>
      <div className="app">
        <Sidebar active={page} onNavigate={navigate}/>
        <div className="main">
          <Topbar page={page}
                  theme={tweaks.theme}
                  onToggleTheme={()=>setTweak("theme", tweaks.theme==="dark"?"light":"dark")}/>
          <div key={page+(pageParam||"")} style={{flex:1, display:"flex", flexDirection:"column"}}>
            {content}
          </div>
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Görünüm">
          <TweakRadio label="Tema" value={tweaks.theme}
                      onChange={(v)=>setTweak("theme", v)}
                      options={[{value:"light",label:"Light"},{value:"dark",label:"Dark"}]}/>
        </TweakSection>
        <TweakSection label="Marka rengi">
          <div style={{display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 8}}>
            {Object.entries(accentColors).map(([k, v]) => (
              <button key={k}
                      onClick={()=>setTweak("accent", k)}
                      title={k}
                      style={{
                        width: "100%", height: 32, borderRadius: 8,
                        background: v.primary,
                        border: tweaks.accent === k ? "2px solid var(--text)" : "2px solid transparent",
                        cursor: "pointer", outline: "none",
                        boxShadow: tweaks.accent === k ? "0 0 0 2px var(--bg-elevated), 0 0 0 4px var(--accent)" : "none",
                        transition: "transform .12s",
                      }}/>
            ))}
          </div>
        </TweakSection>
        <TweakSection label="Yoğunluk">
          <TweakRadio label="" value={tweaks.density}
                      onChange={(v)=>setTweak("density", v)}
                      options={[
                        {value:"compact",label:"Yoğun"},
                        {value:"comfortable",label:"Dengeli"},
                        {value:"cozy",label:"Ferah"},
                      ]}/>
        </TweakSection>
        <TweakSection label="Köşe yuvarlaklığı">
          <TweakSlider label={`${tweaks.radius}px`} value={tweaks.radius} min={4} max={20} step={1}
                       onChange={(v)=>setTweak("radius", v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="page fade-in">
      <div className="page-header"><div className="page-title-group"><h1>Ayarlar</h1><div className="page-subtitle">Hesap, çalışma alanı ve faturalandırma tercihleri.</div></div></div>
      <Empty icon={<I.Settings size={20}/>} title="Bu bölüm bu prototipte aktif değil" sub="Profile, faturalandırma ve entegrasyon ayarları burada yer alacak."/>
    </div>
  );
}

// utils
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r}, ${g}, ${b}`;
}
function lightenHex(hex, amt) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const lr = Math.min(255, Math.round(r + (255-r)*amt));
  const lg = Math.min(255, Math.round(g + (255-g)*amt));
  const lb = Math.min(255, Math.round(b + (255-b)*amt));
  return `rgb(${lr},${lg},${lb})`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
