// Invoices list + Invoice detail (with comments)

const { useState: useStateI } = React;

function InvoicesPage({ onNavigate }) {
  const D = window.SoloData;
  const [filter, setFilter] = useStateI("all");
  const [search, setSearch] = useStateI("");

  const filtered = D.invoices.filter(i => {
    const matchFilter = filter==="all" || i.status === filter;
    const matchSearch = !search || i.number.toLowerCase().includes(search.toLowerCase()) || i.customer.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const total = D.invoices.reduce((s,i)=>s+i.total,0);
  const paid = D.invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.paid,0);
  const overdue = D.invoices.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.total,0);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Faturalar</h1>
          <div className="page-subtitle">{D.invoices.length} fatura · Toplam {formatCurrency(total)}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Download size={14}/> Dışa aktar</button>
          <button className="btn btn-primary"><I.Plus size={14}/> Yeni fatura</button>
        </div>
      </div>

      <div className="stat-grid" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
        <div className="stat">
          <div className="stat-label"><I.DollarSign/> Toplam tahsilat</div>
          <div className="stat-value">{formatCurrency(paid)}</div>
          <div className="stat-meta">{D.invoices.filter(i=>i.status==="Paid").length} ödenmiş fatura</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Clock/> Bekleyen</div>
          <div className="stat-value">{formatCurrency(D.invoices.filter(i=>i.status==="Sent" || i.status==="ClientApproved").reduce((s,i)=>s+i.total,0))}</div>
          <div className="stat-meta">{D.invoices.filter(i=>i.status==="Sent" || i.status==="ClientApproved").length} fatura</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.AlertCircle/> Gecikmiş</div>
          <div className="stat-value" style={{color: overdue > 0 ? "var(--danger-text)" : "var(--text)"}}>{formatCurrency(overdue)}</div>
          <div className="stat-meta">{D.invoices.filter(i=>i.status==="Overdue").length} fatura — takip et</div>
        </div>
        <div className="stat">
          <div className="stat-label"><I.Edit/> Taslaklar</div>
          <div className="stat-value">{D.invoices.filter(i=>i.status==="Draft").length}</div>
          <div className="stat-meta">Tamamlanmamış</div>
        </div>
      </div>

      <div style={{display:"flex", gap: 8, alignItems:"center", marginBottom: 14, flexWrap:"wrap"}}>
        <div className="search" style={{flex:1, maxWidth: 320}}>
          <I.Search size={14}/>
          <input className="input" placeholder="Fatura no veya müşteri ara..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <Tabs items={[
          { value: "all", label: "Tümü", count: D.invoices.length },
          { value: "Draft", label: "Taslak", count: D.invoices.filter(i=>i.status==="Draft").length },
          { value: "Sent", label: "Gönderildi", count: D.invoices.filter(i=>i.status==="Sent").length },
          { value: "ClientApproved", label: "Onaylandı", count: D.invoices.filter(i=>i.status==="ClientApproved").length },
          { value: "Paid", label: "Ödendi", count: D.invoices.filter(i=>i.status==="Paid").length },
          { value: "Overdue", label: "Gecikmiş", count: D.invoices.filter(i=>i.status==="Overdue").length },
        ]} value={filter} onChange={setFilter}/>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Fatura No</th>
              <th>Müşteri</th>
              <th>Tarih</th>
              <th>Vade</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th style={{width: 40}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} onClick={()=>onNavigate("invoice-detail", inv.id)}>
                <td className="mono" style={{fontWeight: 500}}>{inv.number}</td>
                <td>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <Avatar name={inv.customer} size="sm"/>
                    {inv.customer}
                  </div>
                </td>
                <td style={{fontSize: 12.5, color:"var(--text-secondary)"}}>{inv.issueDate}</td>
                <td style={{fontSize: 12.5}} className={inv.status==="Overdue"?"":"mono"}>
                  {inv.status==="Overdue" ? <span style={{color:"var(--danger-text)", fontWeight: 500}}>{inv.dueDate}</span> : <span className="mono" style={{color:"var(--text-secondary)"}}>{inv.dueDate}</span>}
                </td>
                <td style={{fontWeight: 600}}>{formatCurrency(inv.total)}</td>
                <td><Badge cls={invoiceStatusMeta[inv.status].cls}>{invoiceStatusMeta[inv.status].label}</Badge></td>
                <td><button className="btn btn-ghost btn-icon btn-sm" onClick={(e)=>e.stopPropagation()}><I.More size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <Empty icon={<I.Receipt size={20}/>} title="Fatura bulunamadı" sub="Bu filtreye uyan fatura yok."/>
        )}
      </div>
    </div>
  );
}

function InvoiceDetailPage({ invoiceId, onNavigate }) {
  const D = window.SoloData;
  const inv = D.invoices.find(x=>x.id===invoiceId) || D.invoices[0];
  const items = D.invoiceItems[inv.id] || [
    { desc: "Hizmet bedeli", qty: 1, unit: inv.total, amount: inv.total },
  ];
  const initialComments = D.comments.filter(c=>c.invoiceId===inv.id);
  const [comments, setComments] = useStateI(initialComments);
  const [newComment, setNewComment] = useStateI("");

  const sendComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, {
      id: `co-${Date.now()}`,
      invoiceId: inv.id, userId: "self",
      author: "Doğukan Kalkan", role: "Freelancer",
      content: newComment, at: "Şimdi",
    }]);
    setNewComment("");
  };

  const totalNet = items.reduce((s,i)=>s+i.amount,0);
  const kdv = Math.round(totalNet * 0.20);
  const totalGross = totalNet + kdv;

  return (
    <div className="page fade-in">
      <div style={{marginBottom: 4}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate("invoices")}><I.ChevronLeft size={12}/> Faturalar</button>
      </div>
      <div className="page-header">
        <div className="page-title-group">
          <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 6}}>
            <h1 style={{margin: 0}} className="mono">{inv.number}</h1>
            <Badge cls={invoiceStatusMeta[inv.status].cls}>{invoiceStatusMeta[inv.status].label}</Badge>
          </div>
          <div className="page-subtitle">{inv.customer} · Düzenleme: {inv.issueDate} · Vade: {inv.dueDate}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><I.Download size={14}/> PDF indir</button>
          {inv.status === "Draft" && <button className="btn btn-primary"><I.Send size={14}/> Gönder</button>}
          {inv.status === "Sent" && <button className="btn btn-primary"><I.CheckCircle size={14}/> Ödendi işaretle</button>}
          {inv.status === "ClientApproved" && <button className="btn btn-primary"><I.CheckCircle size={14}/> Ödendi işaretle</button>}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap: 16}}>
        <div className="flex-col" style={{gap: 16}}>
          {/* Invoice paper */}
          <div className="card">
            <div style={{padding: 24}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom: 20, borderBottom: "1px solid var(--border)", marginBottom: 20}}>
                <div>
                  <div style={{display:"flex", alignItems:"center", gap: 10}}>
                    <div className="sidebar-brand-mark" style={{width: 32, height: 32, fontSize: 14}}>S</div>
                    <div className="sidebar-brand-name" style={{fontSize: 16}}>SoloSync</div>
                  </div>
                  <div style={{marginTop: 12, fontSize: 12, color:"var(--text-tertiary)", lineHeight: 1.6}}>
                    Doğukan Kalkan<br/>
                    Freelance UI/UX Designer<br/>
                    İstanbul, Türkiye
                  </div>
                </div>
                <div style={{textAlign: "right"}}>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:".05em"}}>Fatura No</div>
                  <div className="mono" style={{fontSize: 15, fontWeight: 600, marginTop: 2}}>{inv.number}</div>
                </div>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap: 16, marginBottom: 20}}>
                <div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:".05em", marginBottom: 6}}>Fatura Edilen</div>
                  <div style={{fontSize: 13, fontWeight: 500}}>{inv.customer}</div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)", marginTop: 2, lineHeight: 1.5}}>
                    Vergi No: {(D.customers.find(c=>c.id===inv.customerId)||{}).taxNo || "—"}
                  </div>
                </div>
                <div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:".05em", marginBottom: 6}}>Düzenleme</div>
                  <div style={{fontSize: 13}}>{inv.issueDate}</div>
                </div>
                <div>
                  <div style={{fontSize: 11, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:".05em", marginBottom: 6}}>Vade</div>
                  <div style={{fontSize: 13}}>{inv.dueDate}</div>
                </div>
              </div>

              <table className="table invoice-items" style={{marginBottom: 20}}>
                <thead>
                  <tr>
                    <th>Açıklama</th>
                    <th style={{width: 60, textAlign:"right"}}>Miktar</th>
                    <th style={{width: 100, textAlign:"right"}}>Birim</th>
                    <th style={{width: 120, textAlign:"right"}}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.desc}</td>
                      <td className="mono" style={{textAlign:"right"}}>{it.qty}</td>
                      <td className="mono" style={{textAlign:"right", color:"var(--text-secondary)"}}>{formatCurrency(it.unit)}</td>
                      <td className="mono" style={{textAlign:"right", fontWeight: 500}}>{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{display:"flex", justifyContent:"flex-end"}}>
                <div style={{minWidth: 240}}>
                  <div style={{display:"flex", justifyContent:"space-between", padding: "6px 0", fontSize: 13}}>
                    <span style={{color:"var(--text-tertiary)"}}>Ara toplam</span>
                    <span className="mono">{formatCurrency(totalNet)}</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", padding: "6px 0", fontSize: 13}}>
                    <span style={{color:"var(--text-tertiary)"}}>KDV (%20)</span>
                    <span className="mono">{formatCurrency(kdv)}</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", padding: "10px 0 0", borderTop: "1px solid var(--border)", marginTop: 8, fontSize: 16, fontWeight: 600}}>
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
              <h2><I.MessageSquare size={14} style={{verticalAlign:"middle", marginRight:6}}/>Yorumlar ({comments.length})</h2>
            </div>
            <div className="card-body">
              <div className="comment-list" style={{marginBottom: 16}}>
                {comments.map(c => (
                  <div key={c.id} className={`comment-row ${c.userId==="self"?"me":""}`}>
                    {c.userId !== "self" && <Avatar name={c.author} size="sm"/>}
                    <div style={{flex:1, display:"flex", flexDirection:"column", alignItems: c.userId==="self"?"flex-end":"flex-start"}}>
                      <div className="comment-meta">
                        <strong style={{color:"var(--text)", fontSize: 12, fontWeight: 600}}>{c.author}</strong>
                        <Badge cls={c.role==="Freelancer"?"badge-blue":"badge-gray"} style={{height: 16, fontSize: 10, padding: "0 6px"}}>{c.role}</Badge>
                        <span>·</span>
                        <span>{c.at}</span>
                      </div>
                      <div className="comment-bubble">{c.content}</div>
                    </div>
                    {c.userId === "self" && <Avatar name={c.author} size="sm"/>}
                  </div>
                ))}
                {comments.length === 0 && <div style={{padding: "24px 12px", textAlign:"center", color:"var(--text-tertiary)", fontSize: 13}}>Henüz yorum yok. İlk yorumu siz yapın.</div>}
              </div>

              <div style={{display:"flex", gap: 8, alignItems:"flex-end"}}>
                <textarea className="textarea" placeholder="Bir yorum yaz... (Enter ile gönder)" 
                          value={newComment} onChange={e=>setNewComment(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendComment(); } }}
                          style={{minHeight: 56}}/>
                <button className="btn btn-primary btn-icon" onClick={sendComment} style={{height: 56, width: 44}}>
                  <I.Send size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-col" style={{gap: 16}}>
          <div className="card">
            <div className="card-header"><h2>Özet</h2></div>
            <div className="card-body" style={{display:"flex", flexDirection:"column", gap: 14}}>
              <div>
                <div style={{fontSize: 11, color:"var(--text-tertiary)", marginBottom: 4}}>Toplam tutar</div>
                <div style={{fontSize: 22, fontWeight: 600}}>{formatCurrency(totalGross)}</div>
              </div>
              <div>
                <div style={{fontSize: 11, color:"var(--text-tertiary)", marginBottom: 4}}>Tahsilat durumu</div>
                <Progress value={inv.paid > 0 ? (inv.paid/inv.total)*100 : 0} kind={inv.paid >= inv.total ? "success" : ""}/>
                <div style={{fontSize: 12, marginTop: 6, display:"flex", justifyContent:"space-between"}}>
                  <span style={{color: "var(--success-text)"}}>{formatCurrency(inv.paid)} ödendi</span>
                  <span style={{color: "var(--text-tertiary)"}}>{formatCurrency(inv.total - inv.paid)} kaldı</span>
                </div>
              </div>
              <div style={{borderTop:"1px dashed var(--border)", paddingTop: 12, fontSize: 12, color:"var(--text-tertiary)", lineHeight: 1.7}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>Düzenleme</span><span style={{color:"var(--text-secondary)"}}>{inv.issueDate}</span></div>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>Son ödeme</span><span style={{color:"var(--text-secondary)"}}>{inv.dueDate}</span></div>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>Müşteri</span><span style={{color:"var(--text-secondary)"}}>{inv.customer}</span></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Ödeme geçmişi</h2></div>
            <div style={{padding: "8px 16px 16px"}}>
              {inv.paid > 0 ? (
                <div style={{padding: "10px 0"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <div>
                      <div style={{fontSize: 13, fontWeight: 500}}>{formatCurrency(inv.paid)}</div>
                      <div style={{fontSize: 11, color:"var(--text-tertiary)", marginTop: 2}}>Banka havalesi · {inv.dueDate}</div>
                    </div>
                    <I.CheckCircle size={18} style={{color:"var(--success)"}}/>
                  </div>
                </div>
              ) : (
                <div style={{padding: "12px 0", fontSize: 12, color:"var(--text-tertiary)", textAlign:"center"}}>
                  Henüz ödeme alınmadı
                </div>
              )}
              <button className="btn btn-secondary btn-sm" style={{width: "100%", marginTop: 8}}><I.Plus size={12}/> Ödeme ekle</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InvoicesPage, InvoiceDetailPage });
