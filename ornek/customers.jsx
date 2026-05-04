// Customers (CRM) page

function CustomersPage({ onNavigate }) {
  const D = window.SoloData;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = D.customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.company.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Müşteriler</h1>
          <div className="page-subtitle">{D.customers.length} müşteri · {D.customers.reduce((s,c)=>s+c.projectsCount,0)} aktif proje</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Download size={14}/> Dışa aktar</button>
          <button className="btn btn-primary" onClick={()=>setModalOpen(true)}><I.Plus size={14}/> Yeni müşteri</button>
        </div>
      </div>

      <div style={{display:"flex", gap: 8, alignItems:"center", marginBottom: 14}}>
        <div className="search" style={{flex:1, maxWidth: 360}}>
          <I.Search size={14}/>
          <input className="input" placeholder="Şirket, kişi veya e-posta ara..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <Tabs items={[
          { value: "all", label: "Tümü", count: D.customers.length },
          { value: "active", label: "Aktif", count: D.customers.filter(c=>c.status==="active").length },
          { value: "passive", label: "Pasif", count: D.customers.filter(c=>c.status==="passive").length },
        ]} value={filter} onChange={setFilter}/>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:"30%"}}>Şirket</th>
              <th>Yetkili</th>
              <th>İletişim</th>
              <th>Vergi No</th>
              <th>Proje</th>
              <th>Durum</th>
              <th style={{width: 60}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{display:"flex", alignItems:"center", gap: 10}}>
                    <Avatar name={c.company}/>
                    <div>
                      <div style={{fontWeight: 500}}>{c.company}</div>
                      <div style={{fontSize: 11, color:"var(--text-tertiary)"}}>Müşteri olduğu zaman: {c.since}</div>
                    </div>
                  </div>
                </td>
                <td>{c.contact}</td>
                <td>
                  <div style={{display:"flex", flexDirection:"column", gap: 2}}>
                    <span style={{fontSize: 12.5}}>{c.email}</span>
                    <span className="mono" style={{fontSize: 11, color:"var(--text-tertiary)"}}>{c.phone}</span>
                  </div>
                </td>
                <td className="mono" style={{fontSize: 12, color:"var(--text-secondary)"}}>{c.taxNo}</td>
                <td>
                  <Badge cls={c.projectsCount > 0 ? "badge-blue" : "badge-gray"}>
                    {c.projectsCount} proje
                  </Badge>
                </td>
                <td>
                  <span className="status-pill">
                    <span className="dot" style={{background: c.status==="active" ? "var(--success)" : "var(--text-tertiary)"}}/>
                    {c.status==="active" ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td><button className="btn btn-ghost btn-icon btn-sm"><I.More size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <Empty icon={<I.Users size={20}/>} title="Müşteri bulunamadı" sub="Arama kriterlerini değiştirmeyi dene veya yeni bir müşteri ekle."/>
        )}
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title="Yeni müşteri ekle"
        footer={<>
          <button className="btn btn-ghost" onClick={()=>setModalOpen(false)}>İptal</button>
          <button className="btn btn-primary" onClick={()=>setModalOpen(false)}>Kaydet</button>
        </>}>
        <div className="grid-2">
          <div className="field"><label className="label">Şirket adı *</label><input className="input" placeholder="Örn: Mavi Pazarlama A.Ş."/></div>
          <div className="field"><label className="label">Yetkili kişi *</label><input className="input" placeholder="Ad Soyad"/></div>
        </div>
        <div className="grid-2">
          <div className="field"><label className="label">E-posta *</label><input className="input" type="email" placeholder="ornek@firma.com"/></div>
          <div className="field"><label className="label">Telefon</label><input className="input" placeholder="+90 5XX XXX XX XX"/></div>
        </div>
        <div className="field"><label className="label">Vergi numarası</label><input className="input mono" placeholder="10 haneli VKN"/></div>
        <div className="field"><label className="label">Fatura adresi</label><textarea className="textarea" placeholder="Tam adres"/></div>
      </Modal>
    </div>
  );
}

window.CustomersPage = CustomersPage;
