// Auth pages: Login, Register, Onboarding

function LoginPage({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("dogukan@solosync.app");
  const [pass, setPass] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onLogin(); }, 500);
  };
  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="flex-row" style={{marginBottom: 40}}>
          <div className="sidebar-brand-mark" style={{width: 32, height: 32, fontSize: 15}}>S</div>
          <div className="sidebar-brand-name" style={{fontSize: 17}}>SoloSync</div>
        </div>
        <h1 style={{fontSize: 28, marginBottom: 6}}>Tekrar hoş geldin.</h1>
        <p style={{color: "var(--text-tertiary)", marginBottom: 28}}>İşini tek merkezden yönet. Müşteri, proje, fatura ve zaman takibi — hepsi bir arada.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">E-posta</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@solosync.app"/>
          </div>
          <div className="field">
            <label className="label">Şifre</label>
            <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          </div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", margin: "8px 0 20px"}}>
            <label style={{display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-secondary)"}}>
              <input type="checkbox" defaultChecked/> Beni hatırla
            </label>
            <a href="#" style={{fontSize:13, color:"var(--accent-text)", textDecoration:"none"}}>Şifremi unuttum</a>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{width:"100%"}} disabled={loading}>
            {loading ? "Giriş yapılıyor..." : <>Giriş yap <I.ArrowRight size={14}/></>}
          </button>
        </form>
        <div style={{textAlign:"center", marginTop: 20, fontSize: 13, color: "var(--text-tertiary)"}}>
          Hesabın yok mu? <a href="#" onClick={(e)=>{e.preventDefault();onGoRegister();}} style={{color:"var(--accent-text)", textDecoration:"none", fontWeight: 500}}>Kayıt ol →</a>
        </div>
      </div>

      <div className="auth-visual-side">
        <div className="auth-grid-bg"/>
        <div style={{position:"relative", zIndex:1, display:"flex", alignItems:"center", gap: 8}}>
          <Badge cls="badge-blue" style={{background:"rgba(255,255,255,.15)", color:"#fff"}}>v1.0 — Hafta 6</Badge>
        </div>
        <div className="auth-quote">
          <div className="auth-quote-text">"Beş farklı araç yerine artık tek bir SoloSync kullanıyorum. Müşteri görüşmesinden faturaya kadar her şey burada."</div>
          <div className="auth-quote-attr">— Ayşe T., UI/UX Designer · 3 yıllık freelancer</div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onGoLogin }) {
  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="flex-row" style={{marginBottom: 40}}>
          <div className="sidebar-brand-mark" style={{width: 32, height: 32, fontSize: 15}}>S</div>
          <div className="sidebar-brand-name" style={{fontSize: 17}}>SoloSync</div>
        </div>
        <h1 style={{fontSize: 28, marginBottom: 6}}>Hesabını oluştur.</h1>
        <p style={{color: "var(--text-tertiary)", marginBottom: 28}}>14 gün ücretsiz dene, kart bilgisi gerekmez.</p>
        <form onSubmit={(e)=>{e.preventDefault(); onRegister();}}>
          <div className="grid-2">
            <div className="field">
              <label className="label">Ad</label>
              <input className="input" defaultValue="Doğukan"/>
            </div>
            <div className="field">
              <label className="label">Soyad</label>
              <input className="input" defaultValue="Kalkan"/>
            </div>
          </div>
          <div className="field">
            <label className="label">E-posta</label>
            <input className="input" type="email" defaultValue="dogukan@solosync.app"/>
          </div>
          <div className="field">
            <label className="label">Şifre</label>
            <input className="input" type="password" defaultValue="••••••••"/>
            <div className="help">En az 8 karakter, bir büyük harf ve bir rakam içermeli</div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{width:"100%", marginTop: 8}}>
            Hesabı oluştur <I.ArrowRight size={14}/>
          </button>
        </form>
        <div style={{textAlign:"center", marginTop: 20, fontSize: 13, color: "var(--text-tertiary)"}}>
          Hesabın var mı? <a href="#" onClick={(e)=>{e.preventDefault();onGoLogin();}} style={{color:"var(--accent-text)", textDecoration:"none", fontWeight: 500}}>Giriş yap →</a>
        </div>
      </div>
      <div className="auth-visual-side">
        <div className="auth-grid-bg"/>
        <div style={{position:"relative", zIndex:1}}><Badge cls="badge-blue" style={{background:"rgba(255,255,255,.15)", color:"#fff"}}>14 gün ücretsiz</Badge></div>
        <div className="auth-quote">
          <div className="auth-quote-text">"3 ayda 28 fatura kestim, hepsi tek tıkla PDF. Muhasebecim de mutlu, ben de."</div>
          <div className="auth-quote-attr">— Burak Y., Full-stack Geliştirici</div>
        </div>
      </div>
    </div>
  );
}

function OnboardingFlow({ onDone }) {
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState("design");
  const [size, setSize] = useState("solo");
  const [goals, setGoals] = useState(["clients","invoices"]);

  const steps = [
    {
      num: "Adım 1 / 4",
      title: "Ne tür bir freelancer'sın?",
      sub: "Sana en uygun şablonları ve raporları seçebilmemiz için.",
      content: (
        <div className="flex-col" style={{gap: 10}}>
          {[
            ["design","Tasarımcı / Yaratıcı","UI/UX, grafik, branding, illüstrasyon", <I.Sparkles size={18}/>],
            ["dev","Yazılım Geliştirici","Web, mobil, backend, DevOps", <I.Zap size={18}/>],
            ["marketing","Pazarlama / İçerik","SEO, sosyal medya, copywriting", <I.TrendingUp size={18}/>],
            ["consulting","Danışman / Diğer","Strateji, koçluk, eğitim", <I.Briefcase size={18}/>],
          ].map(([k,t,d,ic]) => (
            <div key={k} className={`onb-choice ${niche===k?"selected":""}`} onClick={()=>setNiche(k)}>
              <div className="onb-choice-icon">{ic}</div>
              <div style={{flex:1}}>
                <div className="onb-choice-title">{t}</div>
                <div className="onb-choice-desc">{d}</div>
              </div>
              {niche===k && <I.Check size={16} style={{color: "var(--accent)"}}/>}
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "Adım 2 / 4",
      title: "Şu an kaç müşterin var?",
      sub: "Endişelenme, sonra istediğin zaman değiştirebilirsin.",
      content: (
        <div className="grid-2">
          {[["solo","1–3 müşteri","Yeni başladım"],["growing","4–10 müşteri","Hızla büyüyor"],["established","10+ müşteri","Tam hızda"],["agency","Mini ajans","Ekibim var"]].map(([k,t,d]) => (
            <div key={k} className={`onb-choice ${size===k?"selected":""}`} onClick={()=>setSize(k)}>
              <div style={{flex:1}}>
                <div className="onb-choice-title">{t}</div>
                <div className="onb-choice-desc">{d}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "Adım 3 / 4",
      title: "Önceliğin ne?",
      sub: "Birden fazla seçebilirsin. Ana sayfayı buna göre düzenleriz.",
      content: (
        <div className="flex-col" style={{gap: 10}}>
          {[
            ["clients","Müşterileri tek yerde toplamak", <I.Users size={18}/>],
            ["projects","Proje ve görevleri yönetmek", <I.Folder size={18}/>],
            ["time","Zamanı doğru kayıt altına almak", <I.Clock size={18}/>],
            ["invoices","Profesyonel fatura kesmek", <I.Receipt size={18}/>],
            ["portal","Müşteriye şeffaf bir portal sunmak", <I.Globe size={18}/>],
          ].map(([k,t,ic]) => (
            <div key={k} className={`onb-choice ${goals.includes(k)?"selected":""}`}
                 onClick={()=>setGoals(g => g.includes(k) ? g.filter(x=>x!==k) : [...g,k])}>
              <div className="onb-choice-icon">{ic}</div>
              <div style={{flex:1}}>
                <div className="onb-choice-title">{t}</div>
              </div>
              {goals.includes(k) && <I.Check size={16} style={{color: "var(--accent)"}}/>}
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "Adım 4 / 4",
      title: "Her şey hazır 🎉",
      sub: "Demo verilerle başlatıyoruz — istediğin zaman temizleyebilirsin.",
      content: (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0"}}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: "linear-gradient(135deg, var(--accent), #1e40af)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px -8px rgba(37,99,235,.5), inset 0 1px 0 rgba(255,255,255,.2)",
            color: "#fff",
          }}>
            <I.Sparkles size={32}/>
          </div>
          <div style={{marginTop: 20, textAlign:"center"}}>
            <div style={{fontSize: 15, fontWeight: 600}}>Workspace'in hazır</div>
            <div style={{fontSize: 13, color: "var(--text-tertiary)", marginTop: 4}}>6 demo müşteri · 6 proje · 12 görev yüklendi</div>
          </div>
        </div>
      ),
    },
  ];

  const cur = steps[step];

  return (
    <div className="onb-shell">
      <div className="onb-card">
        <div className="onb-progress">
          {steps.map((_,i) => <div key={i} className={`onb-progress-step ${i<=step?"active":""}`}/>)}
        </div>
        <div className="onb-body fade-in" key={step}>
          <div className="onb-step-num">{cur.num}</div>
          <h1 className="onb-title">{cur.title}</h1>
          <p className="onb-sub">{cur.sub}</p>
          {cur.content}
        </div>
        <div className="onb-footer">
          <button className="btn btn-ghost" onClick={()=> step===0 ? null : setStep(step-1)} disabled={step===0}>
            <I.ChevronLeft size={14}/> Geri
          </button>
          <div style={{fontSize:12, color:"var(--text-tertiary)"}}>{step+1} / {steps.length}</div>
          <button className="btn btn-primary" onClick={()=> step===steps.length-1 ? onDone() : setStep(step+1)}>
            {step===steps.length-1 ? "Workspace'e gir" : "Devam et"} <I.ArrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, RegisterPage, OnboardingFlow });
