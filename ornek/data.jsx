// Mock data for SoloSync prototype

const SoloData = {
  user: {
    firstName: "Doğukan", lastName: "Kalkan",
    email: "dogukan@solosync.app",
    role: "Freelancer",
    initials: "DK",
  },

  customers: [
    { id: "c1", company: "Mavi Pazarlama A.Ş.", contact: "Selin Demir", email: "selin@mavipazarlama.com.tr", phone: "+90 532 145 67 89", taxNo: "6230012345", projectsCount: 3, status: "active", since: "Şub 2024" },
    { id: "c2", company: "Anadolu Yapı Kooperatifi", contact: "Burak Yıldız", email: "byildiz@anadoluyapi.com", phone: "+90 533 884 22 17", taxNo: "1112233445", projectsCount: 2, status: "active", since: "Ağu 2024" },
    { id: "c3", company: "Lale Restoran Grubu", contact: "Ayşe Kaya", email: "ayse@lalerestoran.com", phone: "+90 535 200 81 02", taxNo: "9876543210", projectsCount: 1, status: "active", since: "Kas 2025" },
    { id: "c4", company: "Ege Tekstil Ltd.", contact: "Mert Aksoy", email: "mert@egetekstil.com", phone: "+90 549 723 09 41", taxNo: "5556667778", projectsCount: 1, status: "passive", since: "Oca 2024" },
    { id: "c5", company: "Solar Enerji A.Ş.", contact: "Eren Şahin", email: "eren.sahin@solarenerji.com", phone: "+90 532 991 14 67", taxNo: "3344556677", projectsCount: 2, status: "active", since: "Eki 2025" },
    { id: "c6", company: "Bosphorus Coffee Co.", contact: "Zeynep Arslan", email: "zeynep@bosphoruscoffee.com", phone: "+90 542 188 23 75", taxNo: "1238794560", projectsCount: 1, status: "active", since: "Mar 2026" },
  ],

  projects: [
    { id: "p1", name: "E-Ticaret Yenileme — Mavi", customerId: "c1", customer: "Mavi Pazarlama A.Ş.", status: "InProgress", budget: 145000, spent: 68500, progress: 47, start: "12 Mar 2026", end: "30 Haz 2026", tasks: { total: 24, done: 11 }, milestones: { total: 5, done: 2 } },
    { id: "p2", name: "Marka Kimliği Yenileme", customerId: "c2", customer: "Anadolu Yapı Koop.", status: "InRevision", budget: 42000, spent: 39800, progress: 92, start: "01 Şub 2026", end: "15 May 2026", tasks: { total: 14, done: 12 }, milestones: { total: 4, done: 3 } },
    { id: "p3", name: "Mobil Sipariş Uygulaması", customerId: "c3", customer: "Lale Restoran Grubu", status: "InProgress", budget: 95000, spent: 28000, progress: 28, start: "08 Nis 2026", end: "20 Tem 2026", tasks: { total: 32, done: 9 }, milestones: { total: 6, done: 1 } },
    { id: "p4", name: "Kurumsal Web Sitesi", customerId: "c5", customer: "Solar Enerji A.Ş.", status: "Pending", budget: 28000, spent: 0, progress: 0, start: "05 May 2026", end: "30 Haz 2026", tasks: { total: 8, done: 0 }, milestones: { total: 3, done: 0 } },
    { id: "p5", name: "Café Menü & Branding", customerId: "c6", customer: "Bosphorus Coffee", status: "Completed", budget: 18000, spent: 18000, progress: 100, start: "01 Mar 2026", end: "20 Nis 2026", tasks: { total: 12, done: 12 }, milestones: { total: 3, done: 3 } },
    { id: "p6", name: "Dashboard Tasarımı", customerId: "c1", customer: "Mavi Pazarlama A.Ş.", status: "InProgress", budget: 36000, spent: 14400, progress: 40, start: "20 Mar 2026", end: "10 Haz 2026", tasks: { total: 18, done: 7 }, milestones: { total: 4, done: 1 } },
  ],

  milestones: [
    { id: "m1", projectId: "p1", title: "Tasarım onayı (Anasayfa + Ürün)", due: "20 Nis 2026", done: true, order: 1 },
    { id: "m2", projectId: "p1", title: "Ön yüz prototip (React + Tailwind)", due: "10 May 2026", done: true, order: 2 },
    { id: "m3", projectId: "p1", title: "Backend API entegrasyonu", due: "01 Haz 2026", done: false, order: 3 },
    { id: "m4", projectId: "p1", title: "Ödeme & sepet akışı", due: "15 Haz 2026", done: false, order: 4 },
    { id: "m5", projectId: "p1", title: "UAT ve canlıya alma", due: "30 Haz 2026", done: false, order: 5 },
  ],

  tasks: [
    { id: "t1", projectId: "p1", title: "Anasayfa hero bölümü tasarım iterasyonu", status: "Todo", priority: "High", due: "28 Nis", tags: ["tasarım"] },
    { id: "t2", projectId: "p1", title: "Ürün kartı varyasyonları (3 stil)", status: "Todo", priority: "Medium", due: "30 Nis", tags: ["tasarım", "ux"] },
    { id: "t3", projectId: "p1", title: "Mobil menü etkileşimi prototipi", status: "Todo", priority: "Low", due: "02 May", tags: ["mobil"] },
    { id: "t4", projectId: "p1", title: "Filtreleme bileşeni (kategori + fiyat)", status: "InProgress", priority: "High", due: "26 Nis", tags: ["frontend"] },
    { id: "t5", projectId: "p1", title: "Sepet API entegrasyonu", status: "InProgress", priority: "Urgent", due: "25 Nis", tags: ["backend", "api"] },
    { id: "t6", projectId: "p1", title: "Arama önerileri (autocomplete)", status: "InProgress", priority: "Medium", due: "29 Nis", tags: ["frontend"] },
    { id: "t7", projectId: "p1", title: "Anasayfa lighthouse optimizasyonu", status: "Review", priority: "Medium", due: "27 Nis", tags: ["performans"] },
    { id: "t8", projectId: "p1", title: "Footer ve newsletter bileşeni", status: "Review", priority: "Low", due: "25 Nis", tags: ["tasarım"] },
    { id: "t9", projectId: "p1", title: "Tasarım sistemi tokenları (renkler)", status: "Done", priority: "High", due: "15 Nis", tags: ["sistem"] },
    { id: "t10", projectId: "p1", title: "Logo refresh varyasyonları", status: "Done", priority: "Medium", due: "10 Nis", tags: ["branding"] },
    { id: "t11", projectId: "p1", title: "Wireframe akışları (Figma)", status: "Done", priority: "High", due: "05 Nis", tags: ["ux"] },
    { id: "t12", projectId: "p1", title: "Kullanıcı görüşmeleri özeti", status: "Done", priority: "Low", due: "01 Nis", tags: ["araştırma"] },
  ],

  invoices: [
    { id: "i1", number: "INV-2026-0014", customerId: "c1", customer: "Mavi Pazarlama A.Ş.", issueDate: "15 Nis 2026", dueDate: "30 Nis 2026", total: 32500, paid: 0, status: "Sent" },
    { id: "i2", number: "INV-2026-0013", customerId: "c2", customer: "Anadolu Yapı Koop.", issueDate: "10 Nis 2026", dueDate: "25 Nis 2026", total: 18900, paid: 18900, status: "Paid" },
    { id: "i3", number: "INV-2026-0012", customerId: "c3", customer: "Lale Restoran Grubu", issueDate: "08 Nis 2026", dueDate: "23 Nis 2026", total: 24000, paid: 0, status: "ClientApproved" },
    { id: "i4", number: "INV-2026-0011", customerId: "c5", customer: "Solar Enerji A.Ş.", issueDate: "01 Nis 2026", dueDate: "16 Nis 2026", total: 8500, paid: 0, status: "Overdue" },
    { id: "i5", number: "INV-2026-0010", customerId: "c1", customer: "Mavi Pazarlama A.Ş.", issueDate: "25 Mar 2026", dueDate: "10 Nis 2026", total: 14000, paid: 14000, status: "Paid" },
    { id: "i6", number: "INV-2026-0009", customerId: "c2", customer: "Anadolu Yapı Koop.", issueDate: "20 Mar 2026", dueDate: "05 Nis 2026", total: 7800, paid: 0, status: "RevisionRequested" },
    { id: "i7", number: "INV-2026-0008", customerId: "c6", customer: "Bosphorus Coffee", issueDate: "18 Mar 2026", dueDate: "02 Nis 2026", total: 18000, paid: 18000, status: "Paid" },
    { id: "i8", number: "INV-2026-0007", customerId: "c5", customer: "Solar Enerji A.Ş.", issueDate: "10 Mar 2026", dueDate: "25 Mar 2026", total: 12000, paid: 0, status: "Draft" },
  ],

  invoiceItems: {
    i1: [
      { desc: "UI/UX Tasarım — Sprint 3", qty: 40, unit: 650, amount: 26000 },
      { desc: "Tasarım sistemi dokümantasyonu", qty: 5, unit: 800, amount: 4000 },
      { desc: "Müşteri sunumu hazırlığı", qty: 5, unit: 500, amount: 2500 },
    ],
  },

  comments: [
    { id: "co1", invoiceId: "i1", userId: "self", author: "Doğukan Kalkan", role: "Freelancer", content: "Merhaba Selin Hanım, Sprint 3 kapsamında tamamlanan tasarımlar için faturayı ilettim. İncelemenizi rica ederim.", at: "15 Nis, 14:22" },
    { id: "co2", invoiceId: "i1", userId: "client", author: "Selin Demir", role: "Müşteri", content: "Eline sağlık Doğukan. Muhasebe ile paylaştım, bu hafta içinde ödenecek 👍", at: "15 Nis, 16:08" },
    { id: "co3", invoiceId: "i1", userId: "self", author: "Doğukan Kalkan", role: "Freelancer", content: "Çok teşekkürler! Sprint 4 planlamasını da yarın paylaşacağım.", at: "15 Nis, 16:14" },
  ],

  weeklyHours: [3.5, 6.2, 7.1, 5.8, 8.4, 2.1, 0],
  weekDays: ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"],

  recentEntries: [
    { id: "te1", task: "Sepet API entegrasyonu", project: "E-Ticaret Yenileme", duration: 8420, date: "Bugün, 09:14 → 11:34" },
    { id: "te2", task: "Filtreleme bileşeni", project: "E-Ticaret Yenileme", duration: 5640, date: "Bugün, 13:00 → 14:34" },
    { id: "te3", task: "Mobil menü prototipi", project: "Mobil Sipariş Uyg.", duration: 11280, date: "Dün, 10:00 → 13:08" },
    { id: "te4", task: "Logo varyasyonları", project: "Marka Kimliği", duration: 7200, date: "Dün, 14:30 → 16:30" },
    { id: "te5", task: "Wireframe akışları", project: "Kurumsal Web Sitesi", duration: 9000, date: "23 Nis, 09:00 → 11:30" },
  ],

  activities: [
    { id: "a1", type: "task", text: "Sepet API entegrasyonu görevi tamamlandı", who: "Sen", time: "12 dk önce" },
    { id: "a2", type: "comment", text: "Selin Demir bir faturaya yorum yazdı", who: "Müşteri", time: "1 saat önce" },
    { id: "a3", type: "invoice", text: "INV-2026-0013 ödendi (₺18.900)", who: "Sistem", time: "3 saat önce" },
    { id: "a4", type: "milestone", text: "Tasarım onayı milestone'u tamamlandı", who: "Sen", time: "Dün" },
    { id: "a5", type: "project", text: "Café Menü & Branding projesi tamamlandı", who: "Sen", time: "5 gün önce" },
  ],
};

window.SoloData = SoloData;

// Helpers
window.formatCurrency = (n) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

window.formatDuration = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};

window.formatHours = (sec) => {
  const h = sec / 3600;
  return h < 1 ? `${Math.round(h*60)} dk` : `${h.toFixed(1)} sa`;
};

window.statusMeta = {
  Pending:    { label: "Beklemede", cls: "badge-gray", color: "var(--text-tertiary)" },
  InProgress: { label: "Devam ediyor", cls: "badge-blue", color: "var(--accent)" },
  InRevision: { label: "Revizyon", cls: "badge-yellow", color: "var(--warning)" },
  Completed:  { label: "Tamamlandı", cls: "badge-green", color: "var(--success)" },
};

window.invoiceStatusMeta = {
  Draft:              { label: "Taslak", cls: "badge-gray" },
  Sent:               { label: "Gönderildi", cls: "badge-blue" },
  Paid:               { label: "Ödendi", cls: "badge-green" },
  Overdue:            { label: "Gecikmiş", cls: "badge-red" },
  ClientApproved:     { label: "Müşteri onayladı", cls: "badge-purple" },
  RevisionRequested:  { label: "Revizyon istendi", cls: "badge-yellow" },
};

window.priorityMeta = {
  Low:    { label: "Düşük", color: "var(--p-low)" },
  Medium: { label: "Orta", color: "var(--p-medium)" },
  High:   { label: "Yüksek", color: "var(--p-high)" },
  Urgent: { label: "Acil", color: "var(--p-urgent)" },
};

window.taskStatusMeta = {
  Todo:       { label: "Yapılacak", color: "#71717a", soft: "var(--col-todo)" },
  InProgress: { label: "Devam Ediyor", color: "#2563eb", soft: "var(--col-progress)" },
  Review:     { label: "İnceleme", color: "#eab308", soft: "var(--col-review)" },
  Done:       { label: "Tamamlandı", color: "#16a34a", soft: "var(--col-done)" },
};

window.tagColor = (t) => {
  const map = { tasarım: "tag-purple", ux: "tag-pink", frontend: "tag-blue", backend: "tag-yellow", api: "tag-yellow", mobil: "tag-blue", performans: "tag", sistem: "tag-green", branding: "tag-pink", araştırma: "tag" };
  return map[t] || "tag";
};
