# SoloSync - Freelancer SaaS Platform

> Serbest calisan profesyonellerin tum is sureclerini tek merkezden yonetmesini saglayan kapsamli bir SaaS platformu.

**Proje Sahibi:** Dogukan Kalkan
**Baslangic Tarihi:** Mart 2026
**Hedef Tamamlanma:** Haziran 2026 (12 Hafta)
**Mevcut Durum:** Hafta 7 + 7E + 7F + 7G + **8** TAMAMLANDI — Dashboard yenileme, PDF export, zaman takibi analiz, istekler sayfasi; siradaki: **Hafta 9** (analitik dashboard)

---

## 0. HAFIZA — Kritik Kararlar ve Context (Yeni Chat'te Buradan Basla)

> Bu bolum context kaybi yasanmamasi icin tutulur. Her oturum sonunda guncellenir.
> **Son Guncelleme:** 23 Mayis 2026

### Mevcut Durum Ozeti
- Hafta 1-7 + 7E + 7F + 7G + **8** tamamen tamamlandi. Siradaki: **Hafta 9**
- Backend hatasiz derleniyor (`dotnet build` — 0 warning, 0 error)
- Frontend production build basarili (`vite build` — 0 error)
- Veritabani guncel — son migration: `AddClientUserIdToCustomer` uygulanmis.
- `sessionStorage` fix uygulanmis — localStorage → sessionStorage gecisi tamamlandi (tab izolasyonu saglanmis)
- Milestone `IsCompleted` auto-sync aktif — task Done'a alindiktan sonra milestone ve proje listesi aninda guncelleniyor
- `ProjectResponse`'a `PendingRequestCount` eklendi (Client Portal'da bekleyen istek sayisi gosterimi)
- Mobil Client Portal tamamlandi — `ClientTabNavigator` + 5 ekran (home, proje listesi/detayi, fatura listesi/detayi)
- `AppNavigator.js` role-based routing: `Client` → `ClientTabNavigator`, `Freelancer` → `MainTabNavigator`
- `LoginScreen.js` — `userRole` SecureStore'a kaydedilip role bazli navigation reset yapiliyor
- **[10 Mayis 2026] Mobil Detayli Loglama Eklendi** — `mobile/src/services/api.js` ve `mobile/src/screens/auth/LoginScreen.js` icindeki catch bloklari guncellendi; artik Expo terminalinde Network Error, Backend hata kodu ve mesaji, istek URL/method/body bilgisi gosteriliyor
- **[11 Mayis 2026] Mobil Client Portal Eksikleri Giderildi** — Yorum sistemi (`commentApi.js` ve `CommentScreen.js`) eklendi ve `ClientInvoiceDetailScreen`'e baglandi. Cikis yapma (Logout) sistemi `DeviceEventEmitter` uzerinden tum mobil uygulamanin state'ini resetleyecek sekilde eklendi. Client Home header'ina Çıkış butonu konuldu.
- **[14 Mayis 2026] Mobil Freelancer Tarafı İyileştirmeleri (7F)** — Freelancer `HomeScreen.js` Client portal gibi zenginlestirildi (KPI kartlari, hizli aksiyonlar, son projeler listesi). `MainTabNavigator.js` tum sekme ikonlari (emoji) eklendi. `CustomerDetailScreen.js` yeni olusturuldu — müsteri detaylari (istatistikler, iletisim, projeler) + düzenleme + silme. `api.js`'e kritik cokme duzeltmesi: refresh token basarisiz olunca `DeviceEventEmitter.emit('logout')` tetiklenip kullanici login ekranina yonlendiriliyor. `CommentScreen.js` cokme nedenleri giderildi: `useLayoutEffect` ile navigation.setOptions, tam dependency array.
- **[14 Mayis 2026] Mobil Freelancer Parite (7G)** — Freelancer alt sekme cubugu `useSafeAreaInsets` ile cihaz jest alanindan yukari alindi (`MainTabNavigator.js`; ayrica `ClientTabNavigator.js` ile hizalandi). Ana sayfada gecikmis fatura sayisi, bugunku calisma (saat + kucuk «sa»), son projeler + «Tumu Gor» (Projeler sekmesi), KPI 6'li grid; ana sayfadaki cikis kaldirildi (cikis `SettingsScreen`). Yeni mobil freelancer **Faturalar** sekmesi: `invoiceApi.js`, `InvoiceListScreen` / `InvoiceFormScreen` / `InvoiceDetailScreen` — taslak olusturma, gonder, onay sonrasi odendi isaretle, yorumlar (`CommentScreen`), odeme satiri ekleme; web ile ayni API akisi.
- **[23 Mayis 2026] Hafta 8 — UI/UX Sprint** — `DashboardHome.jsx` tam yenileme (widget'lar, task board, grafikler). `ProjectDetailPage.jsx` + `ProjectDetailScreen.js` KPI kartlari + ilerleme yuzdesi. `TimeTrackerPage.jsx` + `TimeTrackerScreen.js` proje bazli gruplama + analiz sekmesi. `InvoiceDetailPage.jsx` PDF export (jsPDF → HTML print; Turkce karakter duzeltmesi). `InvoiceDetailScreen.js` PDF export (`expo-print` + `expo-sharing`). `RequestsPage.jsx` + `RequestsScreen.js` istekler placeholder. `DashboardLayout.jsx` + `MainTabNavigator.js` Istekler nav/tab eklendi. Backend: `ProjectResponse`'a `TotalTaskCount`, `CompletedTaskCount`, `ProgressPercentage`; `GET /api/projects/tasks/dashboard` endpoint.

### Hafta 7'de Yapilan Degisiklikler — Musteri Portali / Client Portal + Bug Fix'ler (4-5 Mayis 2026)

**Mimari Karar:** Client Portal tamamen ayri layout ve route agaci (`/client-portal/*`) altinda; Freelancer dashboard'u ile hicbir esleme yok. `Customer.ClientUserId` nullable FK ile musteriler bir Client hesabina baglanir.

**Backend Degisiklikleri:**
- `Customer.cs` — `ClientUserId` (Guid?, nullable FK → User) + `ClientUser?` navigation property eklendi
- `CrmDtos.cs` — `UpdateCustomerRequest`'e `ClientUserId` eklendi; `CustomerResponse`'a `ClientUserId` eklendi; yeni `ClientProfileResponse` DTO'su eklendi
- `ICrmServices.cs` — yeni `IClientPortalService` interface'i eklendi (11 metot: profil, projeler, milestone'lar, gorevler, faturalar, fatura aksiyonu, istek gonderme, istek listeleme)
- `CrmServices.cs` — `ClientPortalService` implementasyonu eklendi; `CustomerService.UpdateCustomerAsync`'e `ClientUserId` set edildi; `CustomerService.MapToResponse`'a `ClientUserId` eklendi
- `ApplicationDbContext.cs` — `Customer → ClientUser` nullable FK iliskisi eklendi (OnDelete: SetNull)
- `ClientPortalController.cs` — yeni controller; 10 endpoint; tumunde `[Authorize]` (FreelancerOnly degil — Client rolu da erisebilir); rotalar `/api/client-portal/*`
- `Program.cs` — `IClientPortalService → ClientPortalService` DI kaydi eklendi
- Migration: `AddClientUserIdToCustomer` olusturuldu — uygulanmali!

**Frontend Degisiklikleri (Yeni Dosyalar):**
- `frontend/src/services/clientPortalService.js` — 9 endpoint metodu
- `frontend/src/hooks/useClientPortal.js` — 9 hook (useMyProfile, useMyProjects, useMyProject, useMyMilestones, useMyTasks, useMyInvoices, useMyInvoice, useInvoiceAction, useSendRequest, useMyRequests)
- `frontend/src/layouts/ClientPortalLayout.jsx` — Mor tema sidebar (Freelancer'in adi, Client badge'i), header, ayri navigasyon
- `frontend/src/pages/client-portal/ClientHomePage.jsx` — KPI kartlari (aktif proje, bekleyen fatura, tamamlanan proje, toplam fatura), son projeler listesi, son faturalar listesi
- `frontend/src/pages/client-portal/ClientProjectsPage.jsx` — Proje kartlari; Tumu/Aktif/Tamamlanan tab filtresi; progress bar, km tasi sayaci
- `frontend/src/pages/client-portal/ClientProjectDetailPage.jsx` — Kilometre Taslari/Gorevler/Isteklerim sekmesi; istek gonderme formu (AI ozetleme destekli); istek durumu takibi
- `frontend/src/pages/client-portal/ClientInvoicesPage.jsx` — Fatura tablosu; durum tab filtresi; "Onay bekliyor" badge'i
- `frontend/src/pages/client-portal/ClientInvoiceDetailPage.jsx` — Kalem tablosu; odeme gecmisi; fatura onay/revizyon butonlari; yorum bolumu (InvoiceId bazli)
- `frontend/src/pages/client-portal/ClientMessagesPage.jsx` — Placeholder (ileride genisletilecek)

**Degistirilen Dosyalar (Frontend):**
- `App.jsx` — `/client-portal/*` route agaci eklendi; `ClientPortalLayout` ve 5 Client sayfa import edildi; `ProtectedRoute allowedRoles={['Client']}` ile korunuyor
- `LoginPage.jsx` — `data.role === 'Client'` ise `/client-portal`'a, diger durumlarda `/dashboard`'a yonlendirir
- `CustomerModal.jsx` — `clientUserId` alani eklendi (Freelancer, musteri kaydina Client hesabi ID'sini baglar); Zod schema guncellendi

**Kullanici Senaryosu — Tam Akis:**
1. Freelancer kayit olur, sisteme giris yapar (Freelancer rolü → `/dashboard`)
2. Freelancer "Müşteriler" sayfasinda musteri olusturur veya duzenlediginde "Musteri Portal Kullanici ID" alanina Client kullanicisinin UUID'sini girer
3. Client kullancisi login olur → `data.role === 'Client'` → `/client-portal`'a yonlendirilir
4. `GET /api/client-portal/me` → `ClientPortalService.FindCustomerAsync(clientUserId)` → Customer kaydini bulur → profil doner
5. Client projelerini gorur, faturalari inceler, istek gonderir
6. `PATCH /api/client-portal/invoices/{id}/action` `action: 'approve'` → `InvoiceStatus.ClientApproved`; `action: 'request-revision'` → `InvoiceStatus.RevisionRequested`
7. Client `POST /api/client-portal/projects/{id}/requests` ile istek gonderir → `ClientRequestService.CreateAsync` → AI ozetleme → Freelancer Kanban'da gorer

### Hafta 7 Bug Fix'leri (5 Mayis 2026)

**1. localStorage → sessionStorage Gecisi (Tab Izolasyonu)**
- **Problem:** Farkli sekmelerde Freelancer ve Client ayni anda acikken, Client girisi yapildiginda localStorage'daki token'i overwrite ediyordu. Freelancer sekmesi yenilendiginde Client token'iyla istek atiyordu → `FreelancerOnly` policy 403 donuyordu; gorev olusturma "Islem basarisiz" hatasi veriyordu.
- **Cozum:** `api.js` ve `authStore.jsx` dosyalarinda tum `localStorage` → `sessionStorage` olarak degistirildi. Artik her sekme bagimsiz oturum tutuyor.

**2. Milestone IsCompleted Auto-Sync**
- **Problem:** Proje listesindeki kutularda milestone sayaci (ornegin `0/3`) hic guncellenmiyordu. `CompletedMilestoneCount` hesaplamasi `m.Tasks.Any() && m.Tasks.All(t.Status == Done)` task include'a bagliydi ve proje listesi sorgusunda task'lar yuklenmedigi icin hep 0 donuyordu. Dahasi `IsCompleted` hicbir zaman DB'ye yazilmiyordu.
- **Cozum (Backend):**
  - `CrmServices.cs` — `SyncMilestoneCompletionAsync` private metodu eklendi: tum task'lar Done ise `IsCompleted = true` set edip kaydeder.
  - `UpdateTaskAsync` → task kaydedildikten sonra `SyncMilestoneCompletionAsync` cagirilir.
  - `ReorderTasksAsync` (Kanban drag-drop) → etkilenen milestone'larin hepsi sync edilir.
  - `MapToResponse` (proje listesi) → `CompletedMilestoneCount = p.Milestones?.Count(m => m.IsCompleted) ?? 0` (onceden task-bazli ve hep 0 donuyordu).
- **Cozum (Frontend):**
  - `useProjectTasks.js` — `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useReorderTasks`: her basarida `['projects']` query key'i de invalidate ediliyor. Artik Kanban'da degisiklik yapildiginda projeler sayfasina geciste sayfa yenilemesine gerek yok.
  - `useProjects.js` — `useAddMilestone`: basarida `PROJECTS_KEY` invalidate ediliyor.

### Hafta 6.5'te Yapilan Degisiklikler — Milestone-Task Senkronizasyonu (26 Nisan 2026)

**Mimari Degisiklik:** Milestone ve ProjectTask artik tam senkronize. IsCompleted manuel akisi kaldirildi; ilerleme task durumlarindan otomatik hesaplaniyor.

**Backend Degisiklikleri:**
- `ProjectTask.cs` — `MilestoneId` (Guid?, nullable FK) ve `Milestone?` navigation property eklendi
- `Milestone.cs` — `ICollection<ProjectTask> Tasks` navigation property eklendi
- `CrmDtos.cs` — `MilestoneResponse`: `IsCompleted` kaldirildi; `TotalTasks`, `CompletedTasks`, `ProgressPercentage` eklendi. `CreateProjectTaskRequest` ve `UpdateProjectTaskRequest`'e `MilestoneId` eklendi. `ProjectTaskResponse`'a `MilestoneId` eklendi.
- `ICrmServices.cs` — `ToggleMilestoneAsync` kontrati kaldirildi (artik endpoint yok)
- `CrmServices.cs` — `GetMilestonesAsync`: task'lari milestone bazli sorgulayi; dinamik progress hesabi. `AddMilestoneAsync`: yeni signature `MapMilestone(m, 0, 0)`. `ToggleMilestoneAsync` metodu silindi. `CreateTaskAsync` ve `UpdateTaskAsync`'e `MilestoneId` set edildi. `MapMilestone` statik metodu `totalTasks`/`completedTasks` alacak sekilde yeniden yazildi. `MapToResponse` (ProjectTask) `MilestoneId` dondurur.
- `ApplicationDbContext.cs` — `ProjectTask → Milestone` nullable FK iliskisi eklendi (`OnDelete: SetNull`)
- `ProjectController.cs` — `PATCH /milestones/{id}/toggle` endpoint'i kaldirildi
- Migration: `AddMilestoneTaskSync` olusturuldu — uygulanmali!

**Frontend Degisiklikleri:**
- `projectService.js` — `toggleMilestone` metodu silindi
- `useProjects.js` — `useToggleMilestone` hook'u silindi
- `useProjectTasks.js` — `useCreateTask`, `useUpdateTask`, `useReorderTasks`: her basarida `['milestones', projectId]` cache'i de invalidate ediliyor (Kanban drag/drop aninda milestone progress'ini tetikler)
- `TaskModal.jsx` — `useMilestones` import edildi; `selectedMilestoneId` state'i; form payload'a `milestoneId` eklendi; proje milestone'lari varsa "Milestone (Opsiyonel)" select dropdown goster
- `ProjectDetailPage.jsx` — Toggle butonlari/checkbox'lar tamamen kaldirildi. `useToggleMilestone` import'u kaldirildi. Milestone listesi: her satir icin `TotalTasks`/`CompletedTasks`/`ProgressPercentage` backend'den gelen veriyle otomatik dolan progress bar gosterir. "Gorevsiz" milestone'lar "Gorev yok" yazisi gosterir.

**Mobil Degisiklikleri:**
- `projectApi.js` — `toggleMilestone` metodu silindi
- `TaskFormScreen.js` — `useEffect` ile proje milestone'lari cekilir; Picker ile milestone secimi; payload'a `milestoneId` eklendi
- `ProjectDetailScreen.js` — `handleToggle` ve toggle UI tamamen kaldirildi. Her milestone icin: baslik + `completedTasks/totalTasks` sayaci + yatay progress bar (`progressPercentage`). `useFocusEffect` ile geri donus sonrasi otomatik refetch (TaskListScreen'den donus milestone'lari gunceller).
- `TaskListScreen.js` — `handleStatusChange` payload'a `milestoneId` eklendi

**Veritabani Semasi Degisikligi:**
- `ProjectTasks` tablosuna `MilestoneId` (uuid, nullable, FK → Milestones.Id, ON DELETE SET NULL) kolonu eklendi
- `Milestones` tablosundan `IsCompleted` kolonu KALDIRILMADI (migration sadece `ProjectTasks.MilestoneId` ekler; mevcut `IsCompleted` kolonu veritabaninda kalir fakat artik kullanilmiyor — ileride ayri migration ile temizlenebilir)

**Kullanici Senaryosu — Tam Akis:**
1. Freelancer proje detay sayfasinda milestone olusturur
2. Kanban board'da gorev olusturur veya duzenler → TaskModal'da "Milestone" dropdown'i gorevin hangi milestone'a ait oldugunu belirler
3. Gorev "Done" kolonuna suruklendiginde → `PATCH /tasks/reorder` API cagrilir → React Query `['milestones', projectId]` cache'ini invalidate eder → ProjectDetailPage aninda yeni `ProgressPercentage` degerini gosterir
4. Mobil'de TaskListScreen'de gorev durumu "Tamamlandi" yapildiginda → TaskListScreen guncellenir → kullanici ProjectDetailScreen'e dondugunde `useFocusEffect` tetiklenir → milestone'lar yeniden yuklenir

### Hafta 6'da Yapilan Degisiklikler (Ozet — 26 Nisan 2026)

**Eklenen Dosyalar (Backend):**
- `backend/FreelancerSaaS.Core/Entities/Invoice.cs` — Invoice, InvoiceItem, Payment entity'leri + enum'lar
- `backend/FreelancerSaaS.Core/Entities/Comment.cs` — polimorfik yorum entity'si
- `backend/FreelancerSaaS.Core/Entities/ProjectTaskTag.cs` — gorev etiketi entity'si
- `backend/FreelancerSaaS.Core/Entities/ClientRequest.cs` — musteri istegi entity'si
- `backend/FreelancerSaaS.Core/Interfaces/IAIService.cs` — AI ozetleme kontrati
- `backend/FreelancerSaaS.Infrastructure/Services/AIService.cs` — Claude API HTTP client
- `backend/FreelancerSaaS.API/Controllers/InvoiceController.cs` — 10 endpoint
- `backend/FreelancerSaaS.API/Controllers/CommentController.cs` — 4 endpoint
- `backend/FreelancerSaaS.API/Controllers/ClientRequestController.cs` — 3 endpoint
- `backend/FreelancerSaaS.Infrastructure/Migrations/..._AddWeek6Modules.cs` — uygulanmis

**Degistirilen Dosyalar (Backend):**
- `CrmDtos.cs` — TagRequest/Response, Invoice/InvoiceItem/Payment DTO'lari, Comment DTO'lari, ClientRequest DTO'lari; CreateProjectTaskRequest/UpdateProjectTaskRequest'e Tags eklendi; ProjectTaskResponse'a Tags eklendi
- `ICustomerRepository.cs` — IInvoiceRepository, ICommentRepository, IClientRequestRepository eklendi; IProjectTaskRepository'e GetByIdWithTagsAsync eklendi
- `ICrmServices.cs` — IInvoiceService, ICommentService, IClientRequestService eklendi
- `CrmRepositories.cs` — InvoiceRepository, CommentRepository, ClientRequestRepository eklendi; ProjectTaskRepository tag include'lari eklendi
- `CrmServices.cs` — InvoiceService, CommentService, ClientRequestService eklendi; ProjectTaskService'e tag sync mantigi eklendi
- `ApplicationDbContext.cs` — 5 yeni DbSet, HasQueryFilter, entity config'leri eklendi
- `ProjectTask.cs` — Tags navigation property eklendi
- `Program.cs` — 4 yeni DI kaydi + HttpClient<IAIService, AIService>
- `appsettings.json` — AnthropicSettings bolumu eklendi
- `CrmValidators.cs` — CreateInvoiceValidator, AddPaymentValidator, CreateCommentValidator, CreateClientRequestValidator eklendi

**Eklenen Dosyalar (Frontend):**
- `frontend/src/services/invoiceService.js`
- `frontend/src/services/commentService.js`
- `frontend/src/services/clientRequestService.js`
- `frontend/src/hooks/useInvoices.js`
- `frontend/src/hooks/useComments.js`
- `frontend/src/hooks/useClientRequests.js`
- `frontend/src/pages/InvoicesPage.jsx` — 4 KPI karti, sekme filtresi, fatura tablosu
- `frontend/src/pages/InvoiceDetailPage.jsx` — kalem yonetimi, odeme gecmisi, yorum bolumu
- `frontend/src/pages/DashboardHome.jsx` — KPI kartlari, hizli aksiyonlar, son projeler
- `frontend/src/components/invoices/InvoiceModal.jsx` — dinamik kalem satirlari
- `frontend/src/components/comments/CommentSection.jsx` — mesajlasma tarzı polimorfik yorum UI
- `frontend/src/components/tasks/ClientRequestModal.jsx` — musteri istek gonderme modali

**Degistirilen Dosyalar (Frontend):**
- `App.jsx` — DashboardHome, InvoicesPage, InvoiceDetailPage route'lari eklendi
- `DashboardLayout.jsx` — "Faturalar" menü ogesi eklendi (FileText ikonu, FreelancerOnly)
- `TaskModal.jsx` — etiket UI (predefined palette + serbest metin), CommentSection sekme entegrasyonu
- `KanbanBoard.jsx` — "Bekleyen Istekler" sekmesi, tag chip'leri, ClientRequest review butonlari
- `TimeTrackerPage.jsx` — canli senkronizasyon gostergesi (yesil/sari/kirmizi nokta)

### Hafta 5'te Yapilan Degisiklikler (Ozet — 7 Nisan 2026)

**Eklenen Dosyalar:**
- `backend/FreelancerSaaS.Core/Entities/TimeEntry.cs` — yeni entity
- `backend/FreelancerSaaS.API/Controllers/TimeEntryController.cs` — 7 endpoint
- `backend/FreelancerSaaS.Infrastructure/Migrations/..._AddTimeTrackingModule.cs` — migration uygulanmis
- `frontend/src/services/timeEntryService.js`
- `frontend/src/hooks/useTimeEntries.js`
- `frontend/src/pages/TimeTrackerPage.jsx`
- `mobile/src/services/timeEntryApi.js`
- `mobile/src/screens/tasks/TimeTrackerScreen.js`

**Degistirilen Dosyalar:**
- `CrmDtos.cs` — 6 yeni DTO (StartTimeEntryRequest, StopTimeEntryRequest, CreateManualTimeEntryRequest, UpdateTimeEntryRequest, TimeEntryResponse, TimeSummaryResponse, DailySummary)
- `ICustomerRepository.cs` — `ITimeEntryRepository` eklendi
- `ICrmServices.cs` — `ITimeEntryService` eklendi
- `CrmRepositories.cs` — `TimeEntryRepository` eklendi
- `CrmServices.cs` — `TimeEntryService` eklendi
- `ApplicationDbContext.cs` — `TimeEntries` DbSet, HasQueryFilter, entity config eklendi
- `CrmValidators.cs` — StartTimeEntryValidator, CreateManualTimeEntryValidator, UpdateTimeEntryValidator eklendi
- `Program.cs` — ITimeEntryRepository + ITimeEntryService DI kayitlari eklendi
- `DashboardLayout.jsx` — "Zaman Takibi" menü öğesi eklendi (FreelancerOnly)
- `App.jsx` — `/dashboard/time-tracker` route eklendi
- `MainTabNavigator.js` — "Süre" tab'i eklendi

**Onemli Kararlar (Hafta 5):**
- Kronometre mantigi **tamamen frontend'de** (`useState` + `setInterval`) — backend sadece Start/Stop aninda kayit yapar
- `TimeEntry.UserId` FK'si eklendi — dogrudan kullanici sahipligi (ProjectTask->Project->Customer->User zinciri yerine daha hizli)
- `GET /running` 204 No Content doner (kayit yoksa) — frontend `catch` ile null'a cevirir
- `Duration` saniye cinsinden integer olarak saklanir — frontend `formatDuration` ile HH:MM:SS'e cevrilir
- `useRunningEntry` hook'u her 10 saniyede bir refetch yapar (`refetchInterval: 10_000`)
- Manuel kayit icin datetime-local input kullanilir, ISO 8601 formatinda backend'e gonderilir
- `TimeSummaryResponse.daily` dizisi son 5 gunu listeler, gunluk toplam saniye verir
- Mobilde `TimeTrackerScreen` ayri bir Tab olarak konumlandirildi (ProjectStack disinda)

**Hafta 5 Son Duzeltmeleri (25 Nisan 2026):**
- `ApplicationDbContext`: `User.Email` ve `Customer.Email/TaxNumber` unique index'leri soft-delete filtreli hale getirildi (`HasFilter("IsDeleted = false")`)
- `TimeEntryService.StartAsync`: `Done` statusundeki goreve kronometre baslatilmasi engellendi
- `TimeEntryService.CreateManualAsync`: Manuel kayit girisinde cakisma (overlap) kontrolu eklendi
- Migration: `AddSoftDeleteUniqueIndexes` olusturuldu ve uygulanmis

### Alinmis Kritik Kararlar

| # | Karar | Neden | Etki Alani |
|---|-------|-------|------------|
| 1 | Entity adi `ProjectTask` (Task degil) | C# `System.Threading.Tasks.Task` sinifi ile namespace cakismasini onlemek icin | Backend Core, Infrastructure, API |
| 2 | Tailwind v4 — `tailwind.config.js` YOK | Proje Tailwind v4 ile kuruldu; config `@theme` + `@tailwindcss/vite` plugin ile yapiliyor | Frontend tumu |
| 3 | Soft Delete — fiziksel silme YOK | `Remove()` cagrisi `IsDeleted=true` yapar; `HasQueryFilter` otomatik filtreler | DbContext, tum Entity'ler |
| 4 | Drag & Drop icin harici kutuphane kullanilmadi | HTML5 native DnD API yeterli bulundu; bundle boyutu sifir artis | KanbanBoard.jsx |
| 5 | `PATCH /api/tasks/reorder` — toplu guncelleme | Surukle-birak sonrasi tek API cagrisiyla tum kolon/sira guncellemesi | ProjectTaskController, ProjectTaskService |
| 6 | CORS `AllowAll` kaldirildi | Guvenlik — production'da origin kisitlamasi zorunlu | Program.cs, appsettings.json |
| 7 | Client rolu POST/PUT/DELETE'den engellendi | `[Authorize(Policy="FreelancerOnly")]` — bir client kendi verisi disina erisme veya yaratma yapamaz | CustomerController, ProjectController, ProjectTaskController |
| 8 | Milestone artik BaseEntity'den turetiliyor | Tutarlilik — audit trail (CreatedAt, UpdatedAt) ve soft delete destegi | Milestone.cs, ApplicationDbContext |
| 9 | `GenericRepository<T>` pattern | Tum repository'ler bu base'den turetilir; yeni entity eklendiginde sadece ozel metodlar yazilir | Infrastructure katmani |
| 10 | React Query invalidation key'leri | `['project-tasks', projectId]` — her gorev sorgusunda projectId ile namespace'lendi | useProjectTasks.js |
| 11 | `TimeEntry.UserId` dogrudan FK | Veri izolasyonu icin ProjectTask->Project->Customer->User zincirinden daha hizli; her sorguda join azalir | TimeEntry.cs, TimeEntryRepository |
| 12 | Kronometre mantigi frontend'de | Backend sadece kayit eder; `setInterval` 1sn'de elapsed hesaplar; `useRunningEntry` 10sn'de refetch yapar | TimeTrackerPage.jsx, useTimeEntries.js |
| 13 | `Duration` saniye (integer) olarak saklanir | Kolay toplama/ozet hesabi; frontend formatDuration ile HH:MM:SS gosterir | TimeEntry.cs, CrmDtos.cs |
| 14 | `Comment` entity polimorfik FK yapisi | Hem ProjectTaskId hem InvoiceId nullable FK olarak tutulur; ValidasyonKurali: ikisinden biri MUTLAKA dolu olmali; boylece tek entity/controller ile hem gorev hem fatura yorumlari yonetilir | Comment.cs, CommentController.cs, CrmDtos.cs |
| 15 | Yorum endpoint'lerinde `[Authorize]`, `FreelancerOnly` degil | Client rolu da yorum yazabilmeli (fatura onay notu, proje geri bildirimi); yazma/silme yetkisi roller tarafindan degil, yorum sahipligine (UserId) gore kontrol edilir | CommentController.cs, CommentService |
| 16 | `InvoiceStatus` enum'a ClientApproved ve RevisionRequested eklendi | Musterinin fatura onaylamasi veya itiraz etmesi icin backend durum altyapisi; bu iki durum otomatik yorum birakma mekanizmasiyla entegre calisir | Invoice.cs, InvoiceService |
| 17 | Client Portal ayri route prefix `/client-portal/*` alir | Freelancer dashboard'u ile Client portal'i tamamen ayri layout ve navigasyon agaclari; mevcut `DashboardLayout` ve `ProtectedRoute` korunur, Client icin `ClientPortalLayout` eklenir | App.jsx, ClientPortalLayout.jsx |
| 18 | Soft Delete uyumlu unique index | Silinmis musteri/kullanicinin e-postasi yeniden kaydedilebilmeli; `HasFilter("IsDeleted = false")` bunu saglar — aksi halde EF Core unique constraint hatalari firetirir | ApplicationDbContext.cs |
| 19 | Done goreve kronometre yasagi | Tamamlanmis goreve zaman kaydi is mantigina aykiridirı; `StartAsync`'te `ProjectTaskStatus.Done` kontrolu eklendi — `ArgumentException` firlatir | TimeEntryService (CrmServices.cs) |
| 20 | Manuel kayit overlap kontrolu | Ayni zaman araligiyla iki kayit girilmesi veri tutarsizligi yaratir; `CreateManualAsync`'te cakisma kontrolu servis katmaninda yapilir | TimeEntryService (CrmServices.cs) |
| 21 | `ProjectTaskTag` ayri entity (JSON degil) | Her tag'in rengi var; ayri entity sorgu ve validasyon icin daha temiz; Cascade delete ile gorev silindiginde tag'ler de silinir | ProjectTaskTag.cs, CrmDtos.cs |
| 22 | `ClientRequest` ayri entity | Freelancer onaylamadan gorev olusturmamali; ara durum (Pending/Approved/Rejected) gerekli; AI ozetleme bu ara adimda yapilir | ClientRequest.cs, ClientRequestService |
| 23 | AI ozetleme backend'de yapilir | API key guvenligi; frontend'e key gonderilmez; fallback: API erisilemezse mesajin ilk 300 karakteri kullanilir | AIService.cs, IAIService.cs |
| 24 | Claude API — `claude-haiku-4-5-20251001` modeli | Hiz ve maliyet optimizasyonu; ozet gorevi icin yeterli; backend'de HttpClient ile cagirilir | AIService.cs |
| 25 | `ClientRequestController` yeni dosya | `ProjectTaskController` ile karismasin; ayri sorumluluk — client istekleri tamamen farkli is akisi | ClientRequestController.cs |
| 26 | Etiket rengi predefined palette (8 renk) | Sonsuz renk secici yerine tutarli tasarim sistemi; hex kodlari sabit liste olarak frontend'de tanimli | TaskModal.jsx |
| 27 | UI guncellemesi mevcut sayfa dosyalari uzerinde yapilir | Routing degismez; sadece JSX icerigi guncellenir; yeni sayfa olusturulmaz | KanbanBoard.jsx, ProjectsPage.jsx vb. |
| 28 | `ClientRequest.ApprovedTaskId` nullable FK | Onaylanmadan once gorev yok; onaylandiktan sonra olusturulan `ProjectTask`'in ID'si bu alana yazilir; takip icin gerekli | ClientRequest.cs |
| 29 | `Customer.ClientUserId` nullable FK | Bir musterinin sisteme kayitli Client hesabiyla iliskilendirilmesi; nullable cunku her musterinin portal hesabi olmayabilir; SetNull on delete | Customer.cs, ApplicationDbContext.cs |
| 30 | Client Portal `/client-portal/*` tamamen ayri route agaci | Freelancer dashboard ve Client portal farkli UX; ayri layout, ayri navigasyon, ayri renk temi (mor vs marka rengi); `ProtectedRoute allowedRoles=['Client']` ile izole | App.jsx, ClientPortalLayout.jsx |
| 31 | `ClientPortalService` ayri servis (Freelancer servislerini KULLANMAZ) | Veri izolasyonu: `FindCustomerAsync(clientUserId)` her metotta calisir; client baska musterinin verisine erisemez; dogrudan `_context` sorgusu ile filtrelenir | ClientPortalService (CrmServices.cs) |
| 32 | Login sonrasi rol bazli yonlendirme | `data.role === 'Client'` → `/client-portal`; diger durum → `/dashboard`; iki arayuzun birbirinden haberi olmamasi icin | LoginPage.jsx |
| 33 | Fatura onay/revizyon PATCH endpoint'i `/api/client-portal/invoices/{id}/action` | Mevcut `/api/invoices/{id}/client-action` Freelancer'in `requestingUserRole` kontrolune dayanir; Client Portal'da ayri endpoint ile daha sade ve izole akis | ClientPortalController.cs, ClientPortalService |

### Mimari Kurallar (Her Haftada Gecerli)
1. **Yeni entity** → `BaseEntity`'den turet → `ApplicationDbContext`'e `HasQueryFilter` ekle → Migration olustur
2. **Yeni servis** → Interface `Core/Interfaces`'e → Impl `Infrastructure/Services`'e → DI `Program.cs`'e
3. **Yeni controller** → Yazma endpoint'leri `[Authorize(Policy="FreelancerOnly")]` → Okuma endpoint'leri `[Authorize]`
4. **Frontend yeni modul** → `service.js` → `hook.js` (React Query) → `Modal.jsx` → `Page.jsx` → `App.jsx`'e route

### Hafta 7 icin Baslangic Noktalari (Guncellendi — 26 Nisan 2026)
- Hafta 6'da hazirlanan Comment ve Fatura Onay altyapisi Hafta 7 Client Portal'da kullanilacak
- `ClientPortalLayout.jsx` — `frontend/src/layouts/` — Freelancer DashboardLayout'undan bagimsiz
- `ClientProtectedRoute.jsx` — JWT'deki `role == "Client"` kontrolu
- `/client-portal/*` route agaci `App.jsx`'e eklenir
- Client Portal sayfalari: `ClientHomePage`, `ClientProjectsPage`, `ClientProjectDetailPage`, `ClientInvoicesPage`, `ClientInvoiceDetailPage`
- Client Portal'da `ClientRequestModal.jsx` kullanilacak (Hafta 6'da hazirlandi)
- Client, `InvoiceDetailPage`'de `ClientActionRequest` ile fatura onaylayabilir/itiraz edebilir (backend hazir)
- Mobil: `InvoiceListScreen`, `InvoiceDetailScreen`, `MainTabNavigator`'a `InvoiceStack` eklenmeli

### Dikkat Edilecekler (Tekrarlanan Hatalar)
- `CrmDtos.cs` tek dosyada tum DTO'lari barindirir — yeni modullerin DTO'lari bu dosyaya eklenmeli
- `CrmRepositories.cs` tek dosyada tum repository'leri barindirir — ayni sekilde eklenmeli  
- `CrmServices.cs` tek dosyada tum service'leri barindirir — TimeEntryService ve CommentService de burada
- `CrmValidators.cs` tek dosyada tum validator'leri barindirir
- Tarih alanlari backend'e ISO 8601 string olarak gonderilir (`"YYYY-MM-DDTHH:MM:SSZ"`); `DateTime.TryParse` ile `DateTimeStyles.RoundtripKind` kullan
- Enum'lar veritabaninda `HasConversion<string>()` ile string olarak saklanir
- `TimeEntry` gibi `UserId` FK'si olan entity'lerde `GetById` sonrasi mutlaka `entry.UserId != userId` kontrolu yap
- `Comment` entity'sinde polimorfik FK dogrulamasi: `ProjectTaskId == null && InvoiceId == null` ise BadRequest firlatilmali — hem validator'da hem service'de kontrol edilmeli
- `CommentController` endpoint'lerinde `[Authorize]` kullanilir, `[Authorize(Policy="FreelancerOnly")]` KULLANILMAZ — Client rolü de yorum yazabilir
- `Comment.UserId` dogrudan JWT'den alinir (body'den gelmez) — kimin yorum yaptigini client manipüle edemez
- Kronometre elapsed hesabi: `setInterval` icinde `Date.now() - new Date(running.startTime).getTime()` ile yapilir; `useRunningEntry` her 10sn'de refetch ederek StartTime'i gunceller — throttling durumunda bile sapma maksimum 10sn ile sinirli kalir
- `TimeEntry` manuel girisinde overlap kontrolu servis katmaninda yapilir — validator sadece format kontrolu yapar; cakisma varsa `400 Bad Request` doner
- `ProjectTaskStatus.Done` statusundeki goreve `StartAsync` cagrisi `ArgumentException` firlatir → `400 Bad Request`; frontend bu hatay gostermelidir
- `User.Email` ve `Customer.Email/TaxNumber` unique index'leri artik soft-delete filtrelidir; silinen kayitlarin e-postasi yeniden kullanilabilir
- `ProjectTaskTag` entity'sinde `ProjectTaskId` FK zorunlu; gorev silinince tag'ler Cascade ile silinir — ayri `DELETE /tags/{id}` endpoint'i YAZILMAZ; tag'ler her zaman gorev guncelleme ile birlikte yonetilir (gorev update'te tag listesi toplu replace edilir)
- `ClientRequest` olusturulurken `SummarizeAsync` cagrisi yapilamaz veya hata verirse `SummarizedTodo = request.Message.Substring(0, Math.Min(300, request.Message.Length))` fallback uygulanir — 400/500 donulmez, istek yine de olusturulur
- `ClientRequestController`'da `POST /api/client-requests` endpoint'i `[Authorize]` kullanir (FreelancerOnly DEGIL) — client rolu da istek gonderebilir; ancak `PATCH /review` sadece FreelancerOnly
- Anthropic API cagrisi `appsettings.json`'daki `AnthropicSettings:ApiKey` ile yapilir; key yoksa veya bossa `AIService` log uyarisi verir ve fallback metni doner — uygulama calismayi durdurmaz
- Etiket guncelleme stratejisi: `PUT /api/tasks/{id}` body'sinde `Tags` listesi geliyorsa mevcut tag'ler silinip yeniden olusturulur (replace); tag listesi null geliyorsa tag'lere dokunulmaz; bos liste geliyorsa tum tag'ler silinir
- `ClientPortalService.FindCustomerAsync(clientUserId)` her public metotta cagrilir — Client'in baska musterinin datasina erisimi bu kontrol ile engellenir
- `Customer.ClientUserId` nullable UUID — frontend `CustomerModal`'dan "Musteri Portal Kullanici ID" alani ile set edilir; UUID validasyonu Zod ile yapilir
- Client Portal fatura aksiyonu `/api/client-portal/invoices/{id}/action` — `action: 'approve'` veya `action: 'request-revision'`; sadece `Sent` statusteki faturalarda anlamlidir (backend kontrolsuz — frontend buton sadece Sent durumunda gosterilir)
- `TagResponse.Label` alani `Name` degil — CrmDtos.cs'de `Label` field ismi kullaniliyor; `ProjectTaskTag` entity'sinde de `Label` var

---

---

## 1. Projenin Amaci

SoloSync, freelancer'larin asagidaki is sureclerini tek bir platformda birlestirmeyi hedefler:

- **Musteri Yonetimi (CRM):** Musterileri ekleme, duzenleme, silme ve listeleme
- **Proje Takibi:** Projelerin durumunu, butcesini ve kilometre taslarini yonetme
- **Kanban Tahtasi:** Gorevleri surukle-birak ile yonetme; etiket sistemi (Hafta 4 + 6F)
- **Zaman Takibi:** Kronometre modulu ile calisan saat hesaplama (Hafta 5)
- **Faturalandirma:** Musteri bazli fatura olusturma ve odeme takibi (Hafta 6A)
- **Musteri Istek Akisi:** Client mesaj gonderir → AI ozetler → Freelancer Kanban'da onaylar → goreve donusur (Hafta 6G)
- **Musteri Portali:** Musterilerin kendi projelerini gorebilecegi ve istek gonderebilecegi arayuz (Hafta 7)

---

## 2. Kullanici Rolleri ve Yetkilendirme

Sistemde `UserRole` enum'u ile tanimlanan iki temel aktore vardir:

### Freelancer (Role = 1)
- Sistemin **tam yetkili** kullanicisi
- Musteri ekleme/duzenleme/silme
- Proje ve milestone CRUD islemleri
- Gorev olusturma, Kanban yonetimi
- Fatura kesme, zaman takibi
- Tum verilere kendi UserId'si uzerinden erisim

### Client / Musteri (Role = 2)
- Freelancer tarafindan sisteme eklenir
- **Salt okunur (Read-Only)** erisim
- Yalnizca kendisine atanmis projeleri, milestone'lari ve faturalari gorur
- POST, PUT, DELETE endpoint'lerine erisimi **engellenmistir** (`FreelancerOnly` policy)
- **Veri izolasyonu** en kritik kuraldir — bir musteri diger musterilerin verisini goremez

### Veri Izolasyonu Mekanizmasi
Backend'deki tum sorgulara JWT'den gelen `UserId` ile filtreleme uygulanir:
```csharp
private Guid GetUserId() =>
    Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

// Service katmaninda:
.Where(x => x.UserId == currentUserId)
```

---

## 3. Teknoloji Yigini (Tech Stack)

### 3.1 Backend (.NET Web API)

| Teknoloji | Versiyon | Amac |
|-----------|----------|------|
| .NET Core | 10.0 | Web API framework |
| Entity Framework Core | 10.0.3 | ORM (Code-First) |
| PostgreSQL (Npgsql) | 10.0.0 | Veritabani |
| BCrypt.Net-Next | 4.1.0 | Sifre hashleme |
| JWT Bearer Auth | 10.0.5 | Token tabanli kimlik dogrulama |
| FluentValidation | 11.3.1 | Input validasyonu |
| Serilog | 10.0.0 | Yapisal loglama (Console + File) |
| Swashbuckle | 10.1.4 | Swagger/OpenAPI dokumantasyonu |

**Mimari:** Clean Architecture (3 katman)
- `FreelancerSaaS.Core` — Entity'ler, DTO'lar, Interface'ler (sifir bagimlillik)
- `FreelancerSaaS.Infrastructure` — DbContext, Repository'ler, Service implementasyonlari
- `FreelancerSaaS.API` — Controller'lar, Middleware, Validator'ler, Program.cs

### 3.2 Frontend (React / Vite)

| Teknoloji | Versiyon | Amac |
|-----------|----------|------|
| React | 19.2.0 | UI framework |
| Vite | 7.3.1 | Build araci |
| Tailwind CSS | 4.2.1 | Utility-first CSS (`@tailwindcss/vite` plugin, `tailwind.config.js` YOK) |
| React Router DOM | 7.13.2 | SPA routing |
| TanStack React Query | 5.96.2 | Server state yonetimi |
| Axios | 1.14.0 | HTTP client (JWT interceptor ile) |
| React Hook Form | 7.72.0 | Form yonetimi |
| Zod | 4.3.6 | Schema validasyon |
| Lucide React | 0.577.0 | Ikon kutuphanesi |

> **ONEMLI KURAL:** Tailwind v4 kullaniliyor. `tailwind.config.js` dosyasi YOKTUR.
> Konfigurasyonlar `@tailwindcss/vite` eklentisi ve `index.css` icindeki `@theme` direktifi ile yapilir.

### 3.3 Mobil (React Native / Expo)

| Teknoloji | Versiyon | Amac |
|-----------|----------|------|
| React Native | 0.81.5 | Mobil framework |
| Expo | 54.0.0 | Managed workflow |
| React Navigation | 7.x | Navigasyon (Bottom Tabs + Native Stack) |
| Expo SecureStore | 15.0.8 | Sifrelenmis token saklama |
| Axios | 1.14.0 | HTTP client |
| React Native Picker | 2.11.1 | Dropdown secim bileiseni |

---

## 4. Proje Klasor Yapisi

```
SoloSync/
├── backend/
│   ├── FreelancerSaaS.API/                      # Web API Katmani
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs                 # Register, Login, Refresh Token
│   │   │   ├── CustomerController.cs             # Musteri CRUD [Authorize]
│   │   │   ├── ProjectController.cs              # Proje & Milestone CRUD [Authorize]
│   │   │   ├── ProjectTaskController.cs          # Gorev CRUD + Reorder [Authorize]
│   │   │   ├── TimeEntryController.cs            # Zaman takibi CRUD [Authorize] — Hafta 5
│   │   │   ├── InvoiceController.cs              # Fatura CRUD [Authorize] — Hafta 6A
│   │   │   ├── CommentController.cs              # Yorum CRUD [Authorize] — Hafta 6C
│   │   │   ├── ClientRequestController.cs        # Musteri istekleri [Authorize] — Hafta 6G
│   │   │   └── HealthController.cs               # Saglik kontrolu
│   │   ├── Middleware/
│   │   │   └── GlobalExceptionMiddleware.cs      # Merkezi hata yakalama
│   │   ├── Validators/
│   │   │   └── CrmValidators.cs                  # FluentValidation kurallari
│   │   ├── Program.cs                            # DI, JWT, CORS, Pipeline konfigurasyonu
│   │   ├── appsettings.json                      # Baglanti dizesi, JWT ayarlari, CORS
│   │   └── FreelancerSaaS.API.csproj
│   │
│   ├── FreelancerSaaS.Core/                      # Domain Katmani (Sifir Bagimlillik)
│   │   ├── Entities/
│   │   │   ├── BaseEntity.cs                     # Id, CreatedAt, UpdatedAt, IsDeleted
│   │   │   ├── User.cs                           # Kullanici (BaseEntity)
│   │   │   ├── UserRole.cs                       # Enum: Freelancer=1, Client=2
│   │   │   ├── Customer.cs                       # Musteri (BaseEntity)
│   │   │   ├── Project.cs                        # Proje (BaseEntity) + ProjectStatus enum
│   │   │   ├── Milestone.cs                      # Kilometre tasi (BaseEntity)
│   │   │   ├── ProjectTask.cs                    # Gorev (BaseEntity) + ProjectTaskStatus + ProjectTaskPriority enum
│   │   │   ├── ProjectTaskTag.cs                 # Gorev etiketi (BaseEntity) — Hafta 6F
│   │   │   └── ClientRequest.cs                  # Musteri istegi (BaseEntity) — Hafta 6G
│   │   ├── DTOs/
│   │   │   ├── AuthDtos.cs                       # Register/Login/Refresh/Auth response
│   │   │   └── CrmDtos.cs                        # Customer/Project/Milestone DTO'lari
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs                   # Auth servis kontrati
│   │   │   ├── ICrmServices.cs                   # Customer, Project & ProjectTask servis kontratlari
│   │   │   ├── ICustomerRepository.cs            # Musteri, Proje & ProjectTask repository kontratlari
│   │   │   ├── IGenericRepository.cs             # Generic CRUD repository
│   │   │   └── IAIService.cs                     # AI ozetleme servis kontrati — Hafta 6G
│   │   └── FreelancerSaaS.Core.csproj
│   │
│   └── FreelancerSaaS.Infrastructure/            # Veri Erisim Katmani
│       ├── Data/
│       │   └── ApplicationDbContext.cs            # EF Core DbContext + Soft Delete + Query Filter
│       ├── Migrations/                            # 4 migration dosyasi
│       │   ├── InitialAuth.cs
│       │   ├── AddCrmEntities.cs
│       │   ├── AddCrmModule.cs
│       │   └── RestrictCustomerProjectDelete.cs
│       ├── Repositories/
│       │   ├── GenericRepository.cs               # Temel CRUD islemleri
│       │   └── CrmRepositories.cs                 # Customer & Project repository'leri
│       ├── Services/
│       │   ├── AuthService.cs                     # JWT uretimi, BCrypt hashleme
│       │   ├── CrmServices.cs                     # Musteri & Proje is mantigi
│       │   └── AIService.cs                       # Claude API HTTP client entegrasyonu — Hafta 6G
│       └── FreelancerSaaS.Infrastructure.csproj
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx                       # Landing sayfasi
│   │   │   ├── LoginPage.jsx                      # Giris formu (Zod + Hook Form)
│   │   │   ├── RegisterPage.jsx                   # Kayit formu
│   │   │   ├── CustomersPage.jsx                  # Musteri listesi + CRUD (UI guncelleme — Hafta 6H)
│   │   │   ├── ProjectsPage.jsx                   # Proje kartlari Grid (UI guncelleme — Hafta 6H)
│   │   │   ├── ProjectDetailPage.jsx              # Proje detay + Milestone (UI guncelleme — Hafta 6H)
│   │   │   ├── KanbanBoard.jsx                    # 4 kolonlu Kanban + Bekleyen Istekler sekmesi (Hafta 6G, 6H)
│   │   │   ├── TimeTrackerPage.jsx                # Kronometre + zaman kayitlari (UI guncelleme — Hafta 6H)
│   │   │   ├── InvoicesPage.jsx                   # Fatura listesi + CRUD — Hafta 6A
│   │   │   ├── InvoiceDetailPage.jsx              # Fatura detay + aksiyon — Hafta 6A
│   │   │   └── DashboardHome.jsx                  # Ana sayfa KPI + ozet — Hafta 6E
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx                 # Auth guard
│   │   │   ├── customers/
│   │   │   │   └── CustomerModal.jsx              # Musteri olustur/duzenle modal
│   │   │   ├── projects/
│   │   │   │   └── ProjectModal.jsx               # Proje olustur/duzenle modal
│   │   │   ├── tasks/
│   │   │   │   ├── TaskModal.jsx                  # Gorev olustur/duzenle modal (etiket destegi ile — Hafta 6F)
│   │   │   │   └── ClientRequestModal.jsx         # Musteri istek gonderme modali — Hafta 6G
│   │   │   ├── invoices/
│   │   │   │   └── InvoiceModal.jsx               # Fatura olustur/duzenle modal — Hafta 6A
│   │   │   └── comments/
│   │   │       └── CommentSection.jsx             # Polimorfik yorum bileseni — Hafta 6C
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx                # Sidebar + Header + Outlet
│   │   ├── hooks/
│   │   │   ├── useCustomers.js                    # React Query - Musteri hook'lari
│   │   │   ├── useProjects.js                     # React Query - Proje hook'lari
│   │   │   ├── useProjectTasks.js                 # React Query - Gorev hook'lari (etiket destegi ile — Hafta 6F)
│   │   │   ├── useTimeEntries.js                  # React Query - Zaman takibi hook'lari — Hafta 5
│   │   │   ├── useInvoices.js                     # React Query - Fatura hook'lari — Hafta 6A
│   │   │   ├── useComments.js                     # React Query - Yorum hook'lari — Hafta 6C
│   │   │   └── useClientRequests.js               # React Query - Musteri istekleri hook'lari — Hafta 6G
│   │   ├── services/
│   │   │   ├── api.js                             # Axios instance + JWT interceptor
│   │   │   ├── authService.js                     # Auth API cagrilari
│   │   │   ├── customerService.js                 # Musteri API cagrilari
│   │   │   ├── projectService.js                  # Proje API cagrilari
│   │   │   ├── taskService.js                     # Gorev API cagrilari (etiket destegi ile — Hafta 6F)
│   │   │   ├── timeEntryService.js                # Zaman takibi API cagrilari — Hafta 5
│   │   │   ├── invoiceService.js                  # Fatura API cagrilari — Hafta 6A
│   │   │   ├── commentService.js                  # Yorum API cagrilari — Hafta 6C
│   │   │   └── clientRequestService.js            # Musteri istekleri API cagrilari — Hafta 6G
│   │   ├── store/
│   │   │   └── authStore.jsx                      # React Context (useAuth)
│   │   ├── App.jsx                                # Routing konfigurasyonu
│   │   ├── main.jsx                               # React giris noktasi
│   │   └── index.css                              # Tailwind v4 @import + @theme
│   ├── vite.config.js                             # Vite + @tailwindcss/vite + react
│   ├── package.json
│   └── .env.example                               # VITE_API_URL
│
└── mobile/
    ├── src/
    │   ├── navigation/
    │   │   ├── AppNavigator.js                    # Root: Auth vs Main
    │   │   ├── AuthStack.js                       # Login/Register stack
    │   │   └── MainTabNavigator.js                # Bottom tabs + nested stacks
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── LoginScreen.js
    │   │   │   └── RegisterScreen.js
    │   │   ├── customers/
    │   │   │   ├── CustomerListScreen.js
    │   │   │   └── CustomerFormScreen.js
    │   │   ├── projects/
    │   │   │   ├── ProjectListScreen.js
    │   │   │   ├── ProjectDetailScreen.js
    │   │   │   └── ProjectFormScreen.js
    │   │   ├── main/
    │   │   │   ├── HomeScreen.js
    │   │   │   └── SettingsScreen.js
    │   │   └── tasks/
    │   │       ├── TaskListScreen.js              # Duruma gore gruplanmis gorev listesi
    │   │       └── TaskFormScreen.js              # Gorev olustur/duzenle formu
    │   └── services/
    │       ├── api.js                             # Axios + SecureStore interceptor
    │       ├── customerApi.js                     # Musteri API
    │       ├── projectApi.js                      # Proje API
    │       └── taskApi.js                         # Gorev API
    ├── App.js                                     # Expo giris noktasi
    ├── app.json                                   # Expo konfigurasyonu
    ├── package.json
    └── .env.example                               # EXPO_PUBLIC_API_URL (LAN IP gerekir)
```

---

## 5. Veritabani Yapisi ve Entity Iliskileri

### 5.1 Entity-Relationship Diagrami

```
User (BaseEntity)
│  Id, FirstName, LastName, Email*, PasswordHash, Role, ProfilePictureUrl,
│  IsActive, RefreshToken, RefreshTokenExpiryTime
│
├── 1:N (UserId FK, RestrictDelete)
│
Customer (BaseEntity)
│  Id, UserId, CompanyName, ContactName, Email, Phone, TaxNumber,
│  BillingAddress, IsActive
│
├── 1:N (CustomerId FK, RestrictDelete)
│
Project (BaseEntity)
│  Id, CustomerId, Name, Description, Status, StartDate, EndDate, Budget
│
├── 1:N (ProjectId FK, CascadeDelete)
│
Milestone (BaseEntity)
   Id, ProjectId, Title, Description, DueDate, IsCompleted, Order
```

### 5.2 BaseEntity (Ortak Alanlar)
Tum entity'ler `BaseEntity`'den turetilir:
```
Id        : Guid      (Primary Key, otomatik UUID)
CreatedAt : DateTime   (UTC, olusturma zamani)
UpdatedAt : DateTime?  (UTC, son guncelleme)
IsDeleted : bool       (Soft delete bayragi, varsayilan false)
```

### 5.3 Silme Davranislari
| Iliski | Davranis | Aciklama |
|--------|----------|----------|
| User -> Customer | Restrict | Musterisi olan kullanici silinemez |
| Customer -> Project | Restrict | Projesi olan musteri silinemez |
| Project -> Milestone | Cascade | Proje silindiginde milestone'lar otomatik silinir |

### 5.4 Soft Delete Mekanizmasi
- `ApplicationDbContext` icinde `HasQueryFilter(e => !e.IsDeleted)` tum entity'lere uygulanir
- `SaveChanges` override edilmistir — `Remove()` cagrisi fiziksel silme yerine `IsDeleted = true` yapar
- Silinen kayitlar normal sorgularda otomatik hariclenir

### 5.5 ProjectStatus Enum
```
Pending    = 1   (Beklemede)
InProgress = 2   (Devam Ediyor)
InRevision = 3   (Revizyon)
Completed  = 4   (Tamamlandi)
```

### 5.6 UserRole Enum
```
Freelancer = 1
Client     = 2
```

---

## 6. API Endpoint'leri

### 6.1 Authentication (Herkese Acik)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Yeni kullanici kaydi |
| POST | `/api/auth/login` | Giris (JWT + Refresh Token doner) |
| POST | `/api/auth/refresh-token` | Token yenileme |

### 6.2 Musteri Yonetimi (Authorize gerekli)

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| GET | `/api/customers` | Tum roller | Kullanicinin musterilerini listele |
| GET | `/api/customers/{id}` | Tum roller | Musteri detayi |
| POST | `/api/customers` | **FreelancerOnly** | Yeni musteri olustur |
| PUT | `/api/customers/{id}` | **FreelancerOnly** | Musteri guncelle |
| DELETE | `/api/customers/{id}` | **FreelancerOnly** | Musteri sil |

### 6.3 Proje Yonetimi (Authorize gerekli)

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| GET | `/api/projects` | Tum roller | Projeleri listele |
| GET | `/api/projects/{id}` | Tum roller | Proje detayi |
| POST | `/api/projects` | **FreelancerOnly** | Yeni proje olustur |
| PUT | `/api/projects/{id}` | **FreelancerOnly** | Proje guncelle |
| DELETE | `/api/projects/{id}` | **FreelancerOnly** | Proje sil |
| GET | `/api/projects/{id}/milestones` | Tum roller | Milestone'lari listele |
| POST | `/api/projects/milestones` | **FreelancerOnly** | Milestone ekle |
| PATCH | `/api/projects/milestones/{id}/toggle` | **FreelancerOnly** | Milestone tamamla/geri al |

### 6.4 Gorev Yonetimi — Kanban (Authorize gerekli) — Hafta 4

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| GET | `/api/tasks?projectId=` | Tum roller | Projeye ait gorevleri listele |
| GET | `/api/tasks/{id}` | Tum roller | Gorev detayi |
| POST | `/api/tasks` | **FreelancerOnly** | Yeni gorev olustur |
| PUT | `/api/tasks/{id}` | **FreelancerOnly** | Gorev guncelle |
| DELETE | `/api/tasks/{id}` | **FreelancerOnly** | Gorev sil (soft delete) |
| PATCH | `/api/tasks/reorder` | **FreelancerOnly** | Toplu kolon/sira guncelleme (Drag & Drop) |

### 6.5 Zaman Takibi (Authorize gerekli) — Hafta 5

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| GET | `/api/time-entries?projectTaskId=&from=&to=` | Tum roller | Zaman kayitlarini listele (filtreli) |
| GET | `/api/time-entries/running` | Tum roller | Aktif (calisan) kaydı getir — 204 doner yoksa |
| GET | `/api/time-entries/summary?from=&to=` | Tum roller | Gunluk dagilim + toplam sure ozeti |
| POST | `/api/time-entries/start` | **FreelancerOnly** | Kronometreyi baslat |
| POST | `/api/time-entries/{id}/stop` | **FreelancerOnly** | Kronometreyi durdur |
| POST | `/api/time-entries/manual` | **FreelancerOnly** | Manuel zaman kaydi olustur |
| PUT | `/api/time-entries/{id}` | **FreelancerOnly** | Kaydi guncelle |
| DELETE | `/api/time-entries/{id}` | **FreelancerOnly** | Kaydi sil (soft delete) |

### 6.6 Fatura Yonetimi (Authorize gerekli) — Hafta 6

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| GET | `/api/invoices` | Tum roller | Faturalari listele (durum filtresi desteklenir) |
| GET | `/api/invoices/{id}` | Tum roller | Fatura detayi + kalemler + odeme gecmisi |
| POST | `/api/invoices` | **FreelancerOnly** | Yeni fatura olustur |
| PUT | `/api/invoices/{id}` | **FreelancerOnly** | Fatura guncelle |
| DELETE | `/api/invoices/{id}` | **FreelancerOnly** | Fatura sil (soft delete) |
| POST | `/api/invoices/{id}/items` | **FreelancerOnly** | Fatura kalemi ekle |
| DELETE | `/api/invoices/{id}/items/{itemId}` | **FreelancerOnly** | Fatura kalemi sil |
| POST | `/api/invoices/{id}/payments` | **FreelancerOnly** | Odeme kaydi ekle |
| PATCH | `/api/invoices/{id}/send` | **FreelancerOnly** | Faturayı Gönderildi durumuna al |
| PATCH | `/api/invoices/{id}/client-action` | **[Authorize]** (Client veya Freelancer) | Client onay/itiraz; Freelancer odeme onayi |

### 6.7 Yorumlar (Authorize gerekli) — Hafta 6

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| GET | `/api/comments?projectTaskId=` | Tum roller | Goreve ait yorumlari getir |
| GET | `/api/comments?invoiceId=` | Tum roller | Faturaya ait yorumlari getir |
| POST | `/api/comments` | **[Authorize]** (Client ve Freelancer) | Yorum ekle — JWT'den UserId alinir |
| PUT | `/api/comments/{id}` | **[Authorize]** (sadece yorum sahibi) | Yorumu guncelle |
| DELETE | `/api/comments/{id}` | **[Authorize]** (sadece yorum sahibi) | Yorumu sil (soft delete) |

### 6.9 Gorev Etiketleri (Authorize gerekli) — Hafta 6F

> Etiket yonetimi gorev CRUD ile entegre calisir; ayri tag endpoint'i YOKTUR.
> `POST /api/tasks` ve `PUT /api/tasks/{id}` body'sine `tags: [{label, color}]` eklenerek yonetilir.

### 6.10 Musteri Istekleri (Authorize gerekli) — Hafta 6G

| Method | Endpoint | Rol Kisitlamasi | Aciklama |
|--------|----------|----------------|----------|
| POST | `/api/client-requests` | **[Authorize]** (Client veya Freelancer) | Istek olustur — AI ozetleme otomatik yapilir |
| GET | `/api/client-requests?projectId=&status=` | **[Authorize]** | Projeye ait istekleri listele |
| PATCH | `/api/client-requests/{id}/review` | **FreelancerOnly** | Onayla (approve) veya reddet (reject) — onayda gorev otomatik olusturulur |

### 6.11 Saglik Kontrolu (degismez)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | `/api/health` | API saglik kontrolu |

---

---

## 7. Kimlik Dogrulama ve Guvenlik

### 7.1 JWT Token Akisi
```
1. Kullanici register/login olur -> AuthService JWT uretir
2. AccessToken (kisa omurlu, 60 dk): localStorage (web) / SecureStore (mobil)
3. RefreshToken (7 gun omurlu): Her kullanilda yenilenir (rotation)
4. Axios Interceptor: Her istege "Authorization: Bearer <token>" ekler
5. 401 Yaniti: Otomatik refresh token ile yenileme denenir
6. Refresh basarisiz: Login'e yonlendir, storage temizle
```

### 7.2 Sifre Guvenligi
- **BCrypt.Net** ile salted hash
- Sifre asla duz metin olarak saklanmaz
- Login'de `BCrypt.Verify()` ile dogrulama

### 7.3 Authorization Policy'leri
```csharp
options.AddPolicy("FreelancerOnly", policy => policy.RequireRole("Freelancer"));
options.AddPolicy("ClientOnly",     policy => policy.RequireRole("Client"));
```

### 7.4 CORS Konfigurasyonu
- `appsettings.json` icindeki `CorsSettings:AllowedOrigins` dizisinden okunur
- Production'da sadece tanimli origin'ler kabul edilir + `AllowCredentials`
- Development'ta origin listesi bossa fallback olarak `AllowAnyOrigin`

### 7.5 Global Exception Handling
`GlobalExceptionMiddleware` tum exception'lari yakalar ve tutarli JSON formatinda doner:
```
UnauthorizedAccessException -> 401
ArgumentException           -> 400
KeyNotFoundException        -> 404
Diger                       -> 500
```

---

## 8. Frontend Mimarisi (Detay)

### 8.1 Routing Yapisi (App.jsx)
```
/                                    -> HomePage (Landing)
/login                               -> LoginPage
/register                            -> RegisterPage
/dashboard                           -> DashboardLayout (ProtectedRoute)
  /dashboard                         -> DashboardHome (Hos geldiniz)
  /dashboard/clients                 -> CustomersPage
  /dashboard/projects                -> ProjectsPage
  /dashboard/projects/:id            -> ProjectDetailPage
  /dashboard/projects/:id/kanban     -> KanbanBoard (Hafta 4)
  /dashboard/settings                -> Settings (placeholder)
*                                    -> Navigate to /
```

### 8.2 State Yonetimi
- **Auth State:** React Context (`useAuth` hook) — login, logout, isAuthenticated
- **Server State:** TanStack React Query — musteri/proje verileri, cache, invalidation
- **Form State:** React Hook Form + Zod schema validasyon
- **Redux/Zustand YOK** — basit ve yeterli mimari

### 8.3 Axios Interceptor Ozellikleri
- Her istege otomatik `Bearer` token ekleme
- 401'de refresh token ile sessizce yenileme
- Birden fazla basarisiz istek icin kuyruk mekanizmasi (`failedQueue`)
- Ag hatasi durumunda anlamli hata mesaji
- Sonsuz dongu korunmasi (refresh endpoint'i icin)

### 8.4 Tailwind CSS v4 Kurallari
- `@tailwindcss/vite` plugin'i `vite.config.js`'de tanimli
- `tailwind.config.js` dosyasi **YOKTUR ve OLUSTURULMAMALIDIR**
- Tema ozellestirmesi `index.css` icinde `@theme` direktifi ile yapilir
- Ozel renkler: `brand-50` ile `brand-900` arasi palette tanimli
- Font: Inter (Google Fonts)

### 8.5 DashboardLayout
- Acilip kapanabilen sidebar (64px / 256px)
- Rol bazli nav filtreleme (Client "Musteriler" menusunu goremez)
- Kullanici profil basharfi + cikis butonu
- `<Outlet />` ile nested route render

---

## 9. Mobil Uygulama Mimarisi (Detay)

### 9.1 Navigasyon Yapisi
```
AppNavigator (Root)
├── AuthStack (token yoksa)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainTabNavigator (token varsa)
    ├── Home Tab        -> HomeScreen
    ├── Customers Tab   -> CustomerStack
    │   ├── CustomerListScreen
    │   ├── CustomerFormScreen
    │   └── CustomerDetail
    ├── Projects Tab    -> ProjectStack
    │   ├── ProjectListScreen
    │   ├── ProjectDetailScreen
    │   └── ProjectFormScreen
    └── Settings Tab    -> SettingsScreen
```

### 9.2 Token Yonetimi (SecureStore)
- `expo-secure-store` ile platform sifreleme (iOS Keychain / Android Keystore)
- Web'deki localStorage'dan cok daha guvenli
- Ayni interceptor mantigi: 401 -> refresh -> basarisizsa login'e yonlendir

### 9.3 Web'den Farklar
- SecureStore vs localStorage
- Bottom Tab navigasyon vs Sidebar
- React Native UI (StyleSheet) vs HTML/Tailwind
- LAN IP adresi gereksinimi (development icin)

---

## 10. Tamamlanan Haftalar (Detayli)

### Hafta 1: Kurulum ve Clean Architecture Iskeleti
- [x] Backend proje yapisinin olusturulmasi (Core, Infrastructure, API)
- [x] Frontend projesinin olusturulmasi (Vite + React 19)
- [x] Mobil projenin olusturulmasi (Expo 54)
- [x] Klasor yapilarinin ayarlanmasi
- [x] Git repository kurulumu

### Hafta 2: Kimlik Dogrulama ve Veritabani Temeli
- [x] `User` entity'si (Id, Email, PasswordHash, Role, RefreshToken)
- [x] PostgreSQL baglantisi ve `ApplicationDbContext`
- [x] `BaseEntity` (Id, CreatedAt, UpdatedAt, IsDeleted)
- [x] `AuthService` (Register, Login, RefreshToken)
- [x] `AuthController` endpoint'leri
- [x] JWT token uretimi (AccessToken + RefreshToken rotasyonu)
- [x] BCrypt sifre hashleme
- [x] Frontend: Login/Register sayfarlari (Zod + Hook Form)
- [x] Frontend: Axios interceptor (JWT + refresh mekanizmasi)
- [x] Frontend: AuthContext (useAuth hook)
- [x] Frontend: ProtectedRoute bileseni
- [x] Mobil: Login/Register ekranlari
- [x] Mobil: SecureStore token yonetimi
- [x] Mobil: Axios interceptor

### Hafta 3: Musteri (CRM) ve Proje Yonetimi
- [x] `Customer` entity'si (CompanyName, ContactName, Email, Phone, TaxNumber...)
- [x] `Project` entity'si (Name, Description, Status, Budget, StartDate, EndDate)
- [x] `Milestone` entity'si (Title, DueDate, IsCompleted, Order)
- [x] Veritabani iliskileri (User -> Customer -> Project -> Milestone)
- [x] Delete constraint'leri (Restrict + Cascade)
- [x] `GenericRepository<T>` pattern
- [x] `CustomerRepository` ve `ProjectRepository`
- [x] `CustomerService` ve `ProjectService` is mantigi
- [x] `CustomerController` CRUD endpoint'leri
- [x] `ProjectController` CRUD + Milestone endpoint'leri
- [x] FluentValidation kurallari (CrmValidators)
- [x] Serilog loglama (Console + gunluk dosya)
- [x] GlobalExceptionMiddleware
- [x] Frontend: CustomersPage (tablo, arama, skeleton loader)
- [x] Frontend: CustomerModal (olustur/duzenle)
- [x] Frontend: ProjectsPage (kart grid, durum badge'leri)
- [x] Frontend: ProjectDetailPage (milestone listesi)
- [x] Frontend: ProjectModal (olustur/duzenle)
- [x] Frontend: useCustomers ve useProjects hook'lari (React Query)
- [x] Frontend: DashboardLayout (sidebar, rol bazli nav)
- [x] Mobil: Musteri listeleme ve form ekranlari
- [x] Mobil: Proje listeleme, detay ve form ekranlari

### Hafta 3 Sonrasi Iyilestirmeler (Darbogaz Duzeltmleri)
- [x] Milestone entity'si `BaseEntity`'den turetildi (CreatedAt, UpdatedAt, IsDeleted)
- [x] Soft Delete global query filter eklendi (tum entity'ler)
- [x] `SaveChanges` override — `Remove()` artik `IsDeleted = true` yapar
- [x] CORS `AllowAll` kaldirildi -> `AllowSpecificOrigins` (appsettings'ten konfigurasyon)
- [x] Client rolu icin yazma endpoint'lerine `[Authorize(Policy = "FreelancerOnly")]` eklendi

---

## 11. Haftalik Yol Haritasi (Gelecek Planlar)

### Hafta 4: Kanban Board & Gorev Yonetimi ✅ TAMAMLANDI
**Hedef:** Proje bazli gorev yonetimi ve surukle-birak Kanban tahtasi

**Backend:**
- [x] `ProjectTask` entity'si — `BaseEntity`'den turetildi (C# `Task` sinifi ile cakismamasi icin `ProjectTask` adi secildi)
  - Id, ProjectId, Title, Description, Status (enum: Todo=1, InProgress=2, Review=3, Done=4)
  - Priority (Low=1, Medium=2, High=3, Urgent=4), DueDate, Order
- [x] `ProjectTaskRepository` — `GenericRepository<ProjectTask>` + `GetByProjectIdAsync`, `GetByIdWithProjectAsync`
- [x] `ProjectTaskService` — CRUD + `ReorderTasksAsync` (toplu kolon/sira guncelleme)
- [x] `ProjectTaskController` — `GET /api/tasks?projectId=`, `POST`, `PUT`, `DELETE`, `PATCH /reorder`
- [x] FluentValidation — `CreateProjectTaskValidator`, `UpdateProjectTaskValidator`
- [x] `IProjectTaskRepository` ve `IProjectTaskService` interface'leri eklendi
- [x] `ApplicationDbContext`'e `ProjectTasks` DbSet + `HasQueryFilter` + `HasConversion<string>` eklendi
- [x] `Program.cs`'e DI kaydi eklendi
- [x] `Project` entity'sine `ICollection<ProjectTask> Tasks` navigation property eklendi
- [x] Tum yazma endpoint'leri `[Authorize(Policy = "FreelancerOnly")]` ile korunuyor

**Frontend:**
- [x] `taskService.js` — Axios servisi (getByProject, create, update, remove, reorder)
- [x] `useProjectTasks.js` — React Query hook'lari (useProjectTasks, useCreateTask, useUpdateTask, useDeleteTask, useReorderTasks)
- [x] `KanbanBoard.jsx` — 4 kolonlu Kanban tahtas (Todo / Devam Ediyor / Inceleme / Tamamlandi)
  - HTML5 native Drag & Drop API kullanildi (ekstra kutuphane YOK)
  - Her kolonda gorev karti: suruklenebilir, oncelik rengi, son tarih, hover action'lar
  - Her kolonun basliginda `+` butonu (o kolona direkt gorev ekle)
  - `PATCH /reorder` ile optimistik kolon gecisi
- [x] `TaskModal.jsx` — Gorev olustur/duzenle modali (Zod + React Hook Form)
- [x] `ProjectDetailPage.jsx`'e "Kanban Board" butonu eklendi
- [x] `App.jsx`'e `/dashboard/projects/:id/kanban` route'u eklendi

**Mobil:**
- [x] `taskApi.js` — Axios servisi
- [x] `TaskListScreen.js` — Duruma gore gruplanmis gorev listesi, durum degistirme butonlari, uzun bas silme
- [x] `TaskFormScreen.js` — Gorev olustur/duzenle formu (Picker ile)
- [x] `MainTabNavigator.js`'e `TaskList` ve `TaskForm` screen'leri eklendi (ProjectStack icinde)
- [x] `ProjectDetailScreen.js`'e "Gorevler (Kanban)" butonu eklendi

---

### Hafta 5: Zaman Takibi (Time Tracking) ✅ TAMAMLANDI
**Hedef:** Goreve bagli kronometre modulu ile calisan saat hesaplama

**Backend:**
- [x] `TimeEntry` entity'si — `BaseEntity`'den turetildi
  - `ProjectTaskId (FK)`, `UserId (FK)`, `StartTime`, `EndTime`, `Duration` (saniye, int?), `Description`
  - `UserId` dogrudan FK olarak eklendi (hizli veri izolasyonu icin)
- [x] `ITimeEntryRepository` — `ICustomerRepository.cs` icerisine eklendi
- [x] `ITimeEntryService` — `ICrmServices.cs` icerisine eklendi
- [x] `TimeEntryRepository` — `CrmRepositories.cs` icerisine eklendi
  - `GetByUserIdAsync(userId, projectTaskId?, from?, to?)` — filtreli listeleme
  - `GetRunningEntryAsync(userId)` — EndTime == null sorgusu
  - `GetByIdWithTaskAsync(id)` — Task + Project include
- [x] `TimeEntryService` — `CrmServices.cs` icerisine eklendi
  - `StartAsync` — calisan kayit varsa hata firlatir
  - `StopAsync` — EndTime set eder, Duration hesaplar
  - `CreateManualAsync` — gecmis tarihli el ile kayit
  - `UpdateAsync`, `DeleteAsync`
  - `GetSummaryAsync` — gunluk dagilim + toplam saniye
- [x] `TimeEntryController` — `GET`, `GET /running`, `GET /summary`, `POST /start`, `POST /{id}/stop`, `POST /manual`, `PUT /{id}`, `DELETE /{id}`
- [x] FluentValidation — `StartTimeEntryValidator`, `CreateManualTimeEntryValidator`, `UpdateTimeEntryValidator`
- [x] `ApplicationDbContext`'e `TimeEntries` DbSet + `HasQueryFilter` + entity config eklendi
- [x] `Program.cs`'e DI kaydi eklendi
- [x] Migration: `AddTimeTrackingModule` — olusturuldu ve uygulanmis

**Frontend:**
- [x] `timeEntryService.js` — Axios servisi (getEntries, getRunning, getSummary, start, stop, createManual, update, remove)
- [x] `useTimeEntries.js` — React Query hook'lari
  - `useRunningEntry` — 10sn refetchInterval ile canli takip
  - `useStartTimer`, `useStopTimer`, `useCreateManualEntry`, `useDeleteTimeEntry`
- [x] `TimeTrackerPage.jsx` — tam ozellikli kronometre sayfasi
  - Proje/gorev secimi → Baslat butonu
  - Calisan kayit varsa buyuk kronometre goruntuleme (elapsed HH:MM:SS)
  - Bugün / Bu Hafta ozet kartlari
  - Gunluk dagilim listesi (son 5 gun)
  - Tüm kayitlar listesi (tamamlanmis + aktif)
  - Manuel kayit modalı (datetime-local input)
- [x] `DashboardLayout.jsx`'e "Zaman Takibi" menü öğesi eklendi (FreelancerOnly)
- [x] `App.jsx`'e `/dashboard/time-tracker` route'u eklendi

**Mobil:**
- [x] `timeEntryApi.js` — Axios servisi
- [x] `TimeTrackerScreen.js` — kronometre ekrani
  - Proje/gorev Picker secimi
  - Baslat/Durdur butonu
  - Bugunku toplam sure ozeti
  - Son 20 kayit listesi (silme destegi)
- [x] `MainTabNavigator.js`'e "Süre" tab'i eklendi (ayri Tab, ProjectStack disinda)

**Hafta 5 Son Duzeltmeleri (25 Nisan 2026):**
- [x] Soft Delete uyumlu unique index'ler (`User.Email`, `Customer.Email/TaxNumber`) — `AddSoftDeleteUniqueIndexes` migration uygulanmis
- [x] Done statusundeki goreve kronometre baslatma validasyonu (`TimeEntryService.StartAsync`)
- [x] Manuel kayit overlap (cakisma) kontrolu (`TimeEntryService.CreateManualAsync`)

---

### Hafta 6: Finans, Fatura Yonetimi, Yorumlar ve İletişim Altyapısı ✅ TAMAMLANDI
**Hedef:** Musteri bazli fatura olusturma, odeme takibi, cift yonlu yorum sistemi ve kronometre senkronizasyon gostergesi

---

#### 6A — Fatura (Invoice) Altyapisi

**Backend:**
- [x] `InvoiceStatus` enum — `BaseEntity` degil, enum: `Draft=1, Sent=2, Paid=3, Overdue=4, ClientApproved=5, RevisionRequested=6`
- [x] `PaymentMethod` enum: `BankTransfer=1, CreditCard=2, Cash=3, Other=4`
- [x] `Invoice` entity'si — `BaseEntity`'den turet
  - `UserId (FK)`, `CustomerId (FK)`, `InvoiceNumber (string)`, `IssueDate`, `DueDate`, `TotalAmount (decimal)`, `Status (enum)`
  - Navigation: `ICollection<InvoiceItem> Items`, `ICollection<Payment> Payments`
- [x] `InvoiceItem` entity'si — `BaseEntity`'den turet
  - `InvoiceId (FK)`, `Description (string)`, `Quantity (decimal)`, `UnitPrice (decimal)`, `Amount (decimal, hesaplanan: Qty*Price)`
- [x] `Payment` entity'si — `BaseEntity`'den turet
  - `InvoiceId (FK)`, `Amount (decimal)`, `PaymentDate`, `Method (enum)`, `Notes (string?)`
- [x] DTO'lari `CrmDtos.cs`'e ekle:
  - `CreateInvoiceRequest` (CustomerId, IssueDate, DueDate, Items listesi)
  - `UpdateInvoiceRequest`, `InvoiceResponse` (Items ve Payments ile birlikte)
  - `InvoiceItemRequest`, `InvoiceItemResponse`
  - `AddPaymentRequest`, `PaymentResponse`
  - `ClientActionRequest` — `Action ("approve"|"request-revision")`, `Note (string?)`
- [x] `IInvoiceRepository` → `ICustomerRepository.cs`'e ekle
- [x] `IInvoiceService` → `ICrmServices.cs`'e ekle
- [x] `InvoiceRepository` → `CrmRepositories.cs`'e ekle
  - `GetByUserIdAsync(userId, status?)` — Items + Payments + Customer include
  - `GetByIdWithDetailsAsync(id)` — tum navigation ile
- [x] `InvoiceService` → `CrmServices.cs`'e ekle
  - `GetInvoicesAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`
  - `AddItemAsync`, `RemoveItemAsync` — kalem ekle/cikar, TotalAmount otomatik hesaplama
  - `AddPaymentAsync` — odeme kaydi
  - `SendInvoiceAsync` — Draft → Sent durumu
  - `ClientActionAsync` — Client: approve/revision; yorum otomatik birakilir; Freelancer: Paid'e cekebilir
  - `GenerateInvoiceNumber(userId)` — `INV-{YIL}-{sira}` formati, DB'den son numarayi sorgular
- [x] `InvoiceController.cs` olustur — tum endpoint'ler (6.6 tablosuna bakın)
- [x] Validator'lari `CrmValidators.cs`'e ekle: `CreateInvoiceValidator`, `AddPaymentValidator`, `ClientActionValidator`
- [x] `ApplicationDbContext`'e `Invoices`, `InvoiceItems`, `Payments` DbSet + `HasQueryFilter` + entity config
- [x] `Program.cs`'e DI kayitlari
- [x] Migration: `AddInvoiceModule`

**Frontend:**
- [x] `invoiceService.js` — `frontend/src/services/`
- [x] `useInvoices.js` — `frontend/src/hooks/` (React Query)
- [x] `InvoicesPage.jsx` — `frontend/src/pages/`
  - Durum filtreleme sekmeleri: Tümü / Taslak / Gönderildi / Ödendi / Gecikmiş
  - Fatura tablosu: numara, müşteri, tutar, son ödeme tarihi, durum rozeti
  - `ClientApproved` → yeşil rozet; `RevisionRequested` → turuncu rozet
  - "Yeni Fatura" butonu `InvoiceModal.jsx` açar
- [x] `InvoiceDetailPage.jsx` — `frontend/src/pages/`
  - Fatura başlık bilgileri, kalem tablosu, ödeme geçmişi
  - **Aksiyon Çubuğu** (Freelancer için): Gönder, Ödendi İşaretle
  - `ClientApproved` veya `RevisionRequested` durumlarına göre renk/mesaj değişimi
  - `<CommentSection invoiceId={invoice.id} />` entegrasyonu (6C'den gelir)
- [x] `InvoiceModal.jsx` — `frontend/src/components/invoices/`
  - Dinamik kalem satırları (Ekle/Kaldır), otomatik toplam hesaplama
  - Müşteri seçimi, tarihler, durum
- [x] `App.jsx`'e `/dashboard/invoices` ve `/dashboard/invoices/:id` route'ları ekle
- [x] `DashboardLayout.jsx`'e "Faturalar" menü öğesi ekle (FreelancerOnly)

**Mobil:**
- [x] `invoiceApi.js` — `mobile/src/services/`
- [x] `InvoiceListScreen.js` — `mobile/src/screens/invoices/`
  - Durum rozetleri, müşteri adı, tutar, son ödeme tarihi
- [x] `InvoiceDetailScreen.js` — `mobile/src/screens/invoices/`
  - Kalem listesi, ödeme geçmişi, aksiyon butonları
- [x] `MainTabNavigator.js`'e `InvoiceStack` tab'ı ekle

---

#### 6B — Kronometre Canli Senkronizasyon Gostergesi

**Sorun:** Tarayıcı sekmesi arka plana atıldığında `setInterval` throttle edilebilir ve saniye kayması oluşabilir.

**Mevcut Durum:** Elapsed hesabı zaten `Date.now() - new Date(running.startTime).getTime()` ile yapılıyor (Hafta 5'te doğru implemente edildi). Her 10sn'de `useRunningEntry` backend'den `StartTime`'ı alır ve elapsed sıfırlanır — maksimum sapma 10sn ile sınırlıdır.

**Yapilacak Ekstra (gorsel iyilestirme):**
- [x] `TimeTrackerPage.jsx` icindeki calisan kayit paneline kucuk bir "Canli Baglanti" indikatoru eklenir
  - `useRunningEntry` hook'undan `isFetching` ve `isError` state'leri okunur
  - `isFetching === true` → sari yanip sonen nokta + "Senkronize ediliyor..."
  - `isError === true` → kirmizi nokta + "Baglanti hatasi — sure kaydediliyor"
  - Normal durum → yesil nokta + "Sunucu ile senkronize"
  - **Etkilenen dosya:** `frontend/src/pages/TimeTrackerPage.jsx`

---

#### 6C — Yorum (Comment) Modulu

**Amac:** Freelancer ve Client'in gorevler ve faturalar uzerinde karsilikli mesajlasabilmesi.

**Backend:**
- [x] `Comment` entity'si — `BaseEntity`'den turet
  - `UserId (FK → User)`, `ProjectTaskId (Guid? nullable FK → ProjectTask)`, `InvoiceId (Guid? nullable FK → Invoice)`
  - `Content (string, max 2000)`
  - **Kural:** `ProjectTaskId` ve `InvoiceId`'den en az biri dolu olmali; ikisi de dolu olamaz (validator'da zorunlu)
- [x] DTO'lari `CrmDtos.cs`'e ekle:
  - `CreateCommentRequest` — `ProjectTaskId?`, `InvoiceId?`, `Content`
  - `UpdateCommentRequest` — `Content`
  - `CommentResponse` — `Id`, `Content`, `UserId`, `AuthorFullName`, `AuthorRole`, `CreatedAt`, `UpdatedAt`, `ProjectTaskId?`, `InvoiceId?`
- [x] `ICommentRepository` → `ICustomerRepository.cs`'e ekle
  - `GetByProjectTaskIdAsync(taskId)` — User include
  - `GetByInvoiceIdAsync(invoiceId)` — User include
  - `GetByIdWithUserAsync(id)`
- [x] `ICommentService` → `ICrmServices.cs`'e ekle
- [x] `CommentRepository` → `CrmRepositories.cs`'e ekle
- [x] `CommentService` → `CrmServices.cs`'e ekle
  - `GetByTaskAsync(taskId, requestingUserId)` — yetki: gorev sahibi freelancer veya atanmis client
  - `GetByInvoiceAsync(invoiceId, requestingUserId)` — yetki: fatura sahibi veya ilgili musteri
  - `CreateAsync(request, userId)` — UserId JWT'den alinir, body'den gelmez
  - `UpdateAsync(id, request, userId)` — sadece yorum sahibi guncelleyebilir
  - `DeleteAsync(id, userId)` — sadece yorum sahibi silebilir
- [x] `ApplicationDbContext`'e `Comments` DbSet + `HasQueryFilter` + entity config
  - `ProjectTask → Comment`: Cascade delete (gorev silinince yorumlar silinir)
  - `Invoice → Comment`: Cascade delete
  - `User → Comment`: Restrict (kullanici silinemez yorumu varsa)
- [x] `Program.cs`'e DI kayitlari
- [x] `CommentController.cs` — **YENI DOSYA** (proje kuralina istisna, bu modül icin ayri controller zorunlu)
  - `GET /api/comments` → `[Authorize]`
  - `POST /api/comments` → `[Authorize]` (**FreelancerOnly DEGIL** — Client da yazabilir)
  - `PUT /api/comments/{id}` → `[Authorize]`
  - `DELETE /api/comments/{id}` → `[Authorize]`
- [x] `CreateCommentValidator` → `CrmValidators.cs`'e ekle
  - `Content`: bos olamaz, max 2000 karakter
  - `ProjectTaskId` ve `InvoiceId`: ikisi de null olamaz; ikisi de dolu olamaz (xor validasyon)
- [x] Migration: `AddCommentModule`

**Frontend:**
- [x] `commentService.js` — `frontend/src/services/`
  - `getByTask(taskId)`, `getByInvoice(invoiceId)`, `create(data)`, `update(id, data)`, `remove(id)`
- [x] `useComments.js` — `frontend/src/hooks/`
  - `useComments({ taskId?, invoiceId? })` — koşullu fetch
  - `useAddComment()`, `useUpdateComment()`, `useDeleteComment()`
  - Invalidation: `['comments', taskId]` veya `['comments', 'invoice', invoiceId]`
- [x] `CommentSection.jsx` — `frontend/src/components/comments/`
  - Props: `taskId?: string`, `invoiceId?: string`
  - **Mesajlasma tarzı UI:**
    - Oturumu acik kullanicinin mesajlari: **sag tarafta**, brand rengi baloncuk
    - Diger kullanicilarin mesajlari: **sol tarafta**, gri baloncuk
    - Her mesajda: yazar adi, rol rozeti (`Freelancer` → brand rengi, `Müşteri` → gri), tarih/saat
    - Kendi mesajlarina hover'da "Duzenle" ve "Sil" ikonlari cikar
  - Alt kisim: `<textarea>` + Gonder butonu (Enter ile de gonderilebilir, Shift+Enter yeni satir)
  - Bos durum: "Henüz yorum yok. İlk yorumu siz yapın." mesaji
  - Yükleniyor: skeleton loader (3 satir)
- [x] `TaskModal.jsx`'e entegrasyon (`frontend/src/components/tasks/TaskModal.jsx`)
  - Mevcut modal genisletilir: gorev formu + alt kisimda tab veya ayirici ile `<CommentSection taskId={task.id} />`
  - Yeni gorev olusturulurken yorum bolumu gizlenir (task.id yok)
- [x] `InvoiceDetailPage.jsx`'e entegrasyon: sayfanin alt bolumine `<CommentSection invoiceId={invoice.id} />`

**Mobil:**
- [x] `commentApi.js` — `mobile/src/services/`
- [x] `CommentScreen.js` — `mobile/src/screens/tasks/`
  - Props (navigasyon param): `{ taskId?, invoiceId?, title }`
  - Sohbet tarzı liste (`FlatList`, en yeni en alta)
  - Yorum ekleme: alt sabit TextInput + Gönder butonu
  - Kendi yorumuna uzun bas → silme seçeneği
- [x] `TaskListScreen.js` veya `TaskFormScreen.js`'e "Yorumlar" butonu ekle → `CommentScreen`'e navigate

---

#### 6D — Fatura Onay Mekanizmasi (Client Aksiyon)

**Amac:** Client'in tamamen pasif olmaktan cikmasi; fatura onaylayabilmesi veya itiraz edebilmesi.

**Backend (InvoiceService'e eklenti):**
- [x] `ClientActionAsync(invoiceId, action, note, requestingUserId, requestingUserRole)` metodu:
  - Rol `Client` ve `action == "approve"` → `Status = ClientApproved`
  - Rol `Client` ve `action == "request-revision"` → `Status = RevisionRequested` + `CommentService.CreateAsync` ile otomatik yorum: *"[Revizyon Talebi]: {note}"*
  - Rol `Freelancer` ve `action == "mark-paid"` → `Status = Paid` (fatura odendi isareti)
  - Diger kombinasyonlar → `UnauthorizedAccessException`
- [x] `ClientActionRequest` DTO'su zaten 6A'da ekleniyor

**Frontend:**
- [x] `InvoiceDetailPage.jsx` — **Aksiyon Cubu u**:
  - Freelancer gorunumu:
    - Durum `Draft` iken: "Gönder" butonu (Sent'e alır)
    - Durum `ClientApproved` iken: "Ödendi İşaretle" butonu (Paid'e alır)
    - Durum `RevisionRequested` iken: turuncu banner "Müşteri revizyon talep etti" + "Taslağa Al" butonu
  - Client gorunumu **(Hafta 7 Client Portal'da tam sayfa olarak implemente edilir, burada yalnizca backend + hook altyapisi hazirlanır):**
    - Durum `Sent` iken: "Onayla" (yesil) ve "Revizyon İste" (turuncu) butonlari + isteğe baglinotextarea
    - Durum `ClientApproved` iken: "✓ Onayladınız" mesaji (readonly)
    - Durum `RevisionRequested` iken: "Revizyon talebiniz alındı" mesaji (readonly)
- [x] `useClientAction()` hook'u `useInvoices.js`'e eklenir

---

#### 6E — Dashboard Home İyileştirme (Hafta 6 Sonu)

**Amac:** Dashboard ana sayfasini anlamli KPI kartlari ve hizli aksiyon butonu ile zenginlestirme.

**Frontend:**
- [x] `DashboardHome` bileşeni (`App.jsx` içindeki inline component yerine ayrı dosya): `frontend/src/pages/DashboardHome.jsx`
  - **Üst kısım:** "Hoş geldiniz" mesajı + hızlı aksiyon butonları: "Yeni Proje" ve "Süre Başlat"
  - **KPI Kartları:**
    - "Bu Ayki Bekleyen Gelir" — `GET /api/invoices?status=Sent` toplamı
    - "Aktif Projeler" — `GET /api/projects?status=InProgress` sayısı
    - "Gecikmiş Faturalar" — `GET /api/invoices?status=Overdue` sayısı
  - **Orta alan:** Son 3 proje kartı (ProjectsPage'den veri) + Bugünün zaman özeti (TimeTrackerPage'den `useTimeSummary`)
  - Veriler `useProjects`, `useInvoices`, `useTimeSummary` hook'larından okunur
- [x] `App.jsx`'te `DashboardHome` import'u güncellenir

---

---

### 6F — Gorev Etiket (Tag/Label) Sistemi — Hafta 6
**Hedef:** Gorevlere renkli etiket ekleme; etiketler Kanban karti uzerinde chip olarak goruntulenir.

**Backend:**
- [x] `ProjectTaskTag` entity'si — `BaseEntity`'den turet
  - `ProjectTaskId (FK)`, `Label (string, max 50)`, `Color (string, hex renk kodu)`, `Order (int)`
  - `ProjectTask → ProjectTaskTag`: Cascade delete
- [x] DTO'lari `CrmDtos.cs`'e ekle:
  - `TagRequest`: `Label`, `Color`
  - `TagResponse`: `Id`, `Label`, `Color`
  - `CreateProjectTaskRequest` ve `UpdateProjectTaskRequest`'e `Tags: List<TagRequest>?` ekle
  - `ProjectTaskResponse`'a `Tags: List<TagResponse>` ekle
- [x] `ProjectTaskService`'e tag yonetimi: gorev olusturma/guncelleme sirasinda tag'ler kaydedilir (null ise dokunulur, bos liste ise silinir, dolu ise replace yapilir)
- [x] `ApplicationDbContext`'e `ProjectTaskTags` DbSet + `HasQueryFilter` + entity config
- [x] Migration: `AddTaskTagsModule`

**Frontend:**
- [x] `TaskModal.jsx` guncelle — Etiket ekleme bolumu:
  - Predefined palette: 8 renk chip (mavi, yesil, kirmizi, sari, mor, turuncu, pembe, gri)
  - Serbest metin + renk secimi → "Ekle" ile tag listesine eklenir, her tag yaninda "x" ile silinir
  - Tag'ler form submit edildiginde backend'e gonderilir
- [x] `KanbanBoard.jsx` guncelle — Gorev kartinda etiketler:
  - Kartin alt kisminda renkli chip'ler (`<span style={{backgroundColor: tag.color}}>`)
  - Etiket yoksa alan gizlenir
- [x] `taskService.js` guncelle — tag'leri iceren request/response destegi
- [x] `useProjectTasks.js` guncelle — yeni response semasina uyum

---

### 6G — Musteri Istek / Bekleyen Gorev Akisi (Client Request Flow) — Hafta 6
**Hedef:** Client'in projeyle ilgili uzun bir mesaj gondermesi → AI ozetlemesi → Freelancer'in Kanban'da onaylamasi → goreve donusmesi.

#### 6G-1 — Backend: ClientRequest Entity ve Endpoints

- [x] `ClientRequest` entity'si — `BaseEntity`'den turet:
  - `ProjectId (FK)`, `CustomerId (FK)`, `OriginalMessage (string, max 5000)`
  - `SummarizedTodo (string, max 500)` — AI'in urettigi kisa TODO
  - `Status` enum: `Pending=1, Approved=2, Rejected=3`
  - `ApprovedTaskId (Guid? nullable FK → ProjectTask)` — onaylaninca olusturulan gorev ID'si
  - `RequestedAt (DateTime)`, `ReviewedAt (DateTime?)`
- [x] DTO'lari `CrmDtos.cs`'e ekle:
  - `CreateClientRequestRequest`: `ProjectId`, `Message`
  - `ClientRequestResponse`: tum alanlar + `ProjectName`, `CustomerName`
  - `ReviewClientRequestRequest`: `Action ("approve"|"reject")`, `Tags: List<TagRequest>?`
- [x] `IClientRequestRepository` → `ICustomerRepository.cs`'e ekle
  - `GetPendingByProjectIdAsync(projectId)` — Kanban "Bekleyen Istekler" icin
  - `GetByProjectIdAsync(projectId, status?)` — tum istekler
- [x] `IClientRequestService` → `ICrmServices.cs`'e ekle
- [x] `ClientRequestRepository` → `CrmRepositories.cs`'e ekle
- [x] `ClientRequestService` → `CrmServices.cs`'e ekle
  - `CreateAsync(request, customerId)` — istek olusturur + `SummarizeAsync` cagirir
  - `ApproveAsync(requestId, tags, freelancerId)` — `ProjectTask` olusturur (otomatik "musteri-istegi" etiketi + freelancer'in ekledigi etiketler), `Status = Approved`, `ApprovedTaskId` set edilir
  - `RejectAsync(requestId, freelancerId)` — `Status = Rejected`
- [x] `ClientRequestController.cs` — **YENI DOSYA**:
  - `POST /api/client-requests` → `[Authorize]`
  - `GET /api/client-requests?projectId=&status=` → `[Authorize]`
  - `PATCH /api/client-requests/{id}/review` → `[Authorize(Policy="FreelancerOnly")]`
- [x] `CreateClientRequestValidator` → `CrmValidators.cs`'e ekle
- [x] `ApplicationDbContext`'e `ClientRequests` DbSet + `HasQueryFilter` + entity config
- [x] `Program.cs`'e DI kayitlari
- [x] Migration: `AddClientRequestModule`

#### 6G-2 — Claude API Entegrasyonu (AI Ozetleme)

- [x] `IAIService` → `Core/Interfaces/IAIService.cs` — `SummarizeClientRequestAsync(string message) → Task<string>`
- [x] `AIService.cs` → `Infrastructure/Services/AIService.cs`
  - `HttpClient` ile `https://api.anthropic.com/v1/messages` endpoint'ine POST
  - Model: `claude-haiku-4-5-20251001`
  - Prompt: *"Asagidaki musteri mesajini freelancer icin kisa, net, Turkce bir gorev aciklamasina (max 150 kelime) donustur. Sadece gorev aciklamasini yaz, baska bir sey yazma. Musteri mesaji: {message}"*
  - Hata durumunda (API erisilemez): `SummarizedTodo = message.Substring(0, Math.Min(300, message.Length))` fallback — exception firlatilmaz
- [x] `appsettings.json`'a `AnthropicSettings:ApiKey` ve `AnthropicSettings:Model` ekle
- [x] `Program.cs`'e DI kaydi: `services.AddHttpClient<IAIService, AIService>()`

#### 6G-3 — Frontend: Bekleyen Istekler Sekmesi

- [x] `clientRequestService.js` — `frontend/src/services/`:
  - `getByProject(projectId, status?)`, `create(data)`, `review(id, data)`
- [x] `useClientRequests.js` — `frontend/src/hooks/`:
  - `useClientRequests(projectId, status)`, `useCreateClientRequest()`, `useReviewClientRequest()`
- [x] `KanbanBoard.jsx` guncelle — sekme sistemi:
  - **Sekme 1:** "Gorev Tahtasi" (mevcut Kanban — degismez)
  - **Sekme 2:** "Bekleyen Istekler (N)" — N badge ile bekleyen sayi
    - Her istek karti: ozetlenmis TODO metni, musteri adi, tarih, "Orijinal Mesaji Goster" toggle
    - Kart altinda: "Onayla" (yesil) + "Reddet" (kirmizi) butonlari
    - Onaylama aninda etiket ekleme alani (6F'teki tag UI'i yeniden kullanilir)
- [x] `ClientRequestModal.jsx` — `frontend/src/components/tasks/`:
  - Client tarafinin istek gonderdigi modal (Hafta 7 Client Portal'da kullanilacak; simdiden hazirlanir)
  - `<textarea>` (max 5000 karakter) + proje secimi + "Gonder" butonu
  - Gonderim sonrasi: "Isteginiz iletildi, freelancer inceleyecek" mesaji

---

### 6H — UI Guncellemesi (Screenshot'a Uyum) — Hafta 6
**Hedef:** Tum frontend sayfalari paylasilmis screenshot'lardaki tasarima kavusturulur. Routing degismez; mevcut dosyalar guncellenir.

#### 6H-1 — Projeler Sayfasi (`frontend/src/pages/ProjectsPage.jsx`)
- [x] Breadcrumb: "SoloSync / Projeler"
- [x] Sekme filtresi: Tumu (N) | Devam ediyor (N) | Revizyon (N) | Beklemede (N) | Tamamlandi (N) — sayilar dinamik, her proje durumuna gore hesaplanir
- [x] Sag ust: iki view-toggle icon (grid/liste) — baslangicta grid aktif
- [x] Kart grid (3 sutun, responsive): proje adi + durum rozeti (renkli nokta) | musteri adi | ilerleme cubugu + % | Butce + Gorev X/Y + tarih araligi

#### 6H-2 — Musteriler Sayfasi (`frontend/src/pages/CustomersPage.jsx`)
- [x] Ozet alt baslik: "X musteri · Y aktif proje" (dinamik)
- [x] "Disa aktar" butonu (ileride islevsel olacak, simdilik placeholder)
- [x] Sekme filtresi: Tumu | Aktif | Pasif
- [x] Tablo sutunlari: Sirket (avatar + sirket adi + "Musteri oldugu zaman: {tarih}") | Yetkili | Iletisim (email + telefon) | Vergi No | Proje sayisi (mavi badge) | Durum (nokta + metin) | `...` menu
- [x] Her satir sonunda uc nokta (`...`) acilir menu (Duzenle / Sil)

#### 6H-3 — Zaman Takibi Sayfasi (`frontend/src/pages/TimeTrackerPage.jsx`)
- [x] Kronometre paneli: "HAZIR" / "CALISIYOR" durum etiketi + buyuk dijital saat + proje/gorev dropdown'lari + "Kronometreyi Baslat/Durdur" butonu
- [x] 3 ozet kart: Bugun (HH:MM:SS + kayit sayisi) | Bu hafta (saat + gecen haftaya kiyas %) | Bu hafta hak edis (TL + saatlik ortalama)
- [x] Son kayitlar tablosu: Gorev | Proje | Sure | Tarih araligi | `...` menu
- [x] Sag panel: "Son 5 gun" dikey bar chart (css ile, ekstra kutuphane olmadan — her gun icin genislik orantili bar)

#### 6H-4 — Faturalar Sayfasi (`frontend/src/pages/InvoicesPage.jsx`) — 6A ile birlikte
- [x] 4 ust ozet kart: Toplam tahsilat | Bekleyen | Gecikemis (kirmizi) | Taslaklar
- [x] Sekme filtresi: Tumu | Taslak | Gonderildi | Onaylandi | Odendi | Gecikemis
- [x] Fatura tablosu: No | Musteri (renkli avatar) | Tarih | Vade (gecikemis ise kirmizi) | Tutar | Durum rozeti | `...` menu

#### 6H-5 — Proje Detay Sayfasi (`frontend/src/pages/ProjectDetailPage.jsx`)
- [x] Breadcrumb: "< Projeler" linki + proje adi (buyuk, bold) + durum rozeti + musteri adi + tarih araligi
- [x] Sag ust: "Kanban" + "Duzenle" + "+ Gorev ekle" butonlari
- [x] 4 ozet kart: Ilerleme % + cubuk | Butce (toplam + harcanan %) | Gorevler (X/Y kalan) | Kilometre taslari (X/Y tamamlandi)
- [x] Kilometre Taslari bolumu: her tas icin checkbox + baslik + tarih; tamamlananlar ustuu cizili ve yesil
- [x] Detaylar paneli (sag kolon): Musteri (avatar + link) | Aciklama | Etiketler (proje etiketleri, sadece metin bazli) | Olusturulma + son guncelleme tarihleri

#### 6H-6 — Kanban Board (`frontend/src/pages/KanbanBoard.jsx`)
- [x] Breadcrumb: "< {ProjeAdi}" linki + "Kanban Tahtasi" baslik + "X gorev" alt baslik
- [x] Sag ust: "Filtrele" + "+ Gorev ekle" butonlari
- [x] 4 kolon: Yapilacak (gri nokta) | Devam Ediyor (mavi nokta) | Inceleme (sari nokta) | Tamamlandi (yesil nokta) — her kolon basliginda sayi + "+" butonu
- [x] Gorev karti yeniligi: gorev adi (bold) | etiket chip'ler (6F'ten) | alt bar: tarih + oncelik rozeti + kullanici avatar (sag kose)
- [x] **Sekme sistemi** (6G'den): "Gorev Tahtasi" | "Bekleyen Istekler (N)"

---

### Hafta 7: Musteri Portali (Client Portal)
**Hedef:** Client rolu icin ozel, guvenlı, kısmen interaktif portal — proje takibi, fatura onaylama, yorum yapma

**Not:** Comment modülü (6C) ve Fatura Onay altyapısı (6D) Hafta 6'da hazır olur; Hafta 7'de bunlar Client Portal arayüzüne entegre edilir.

---

#### 7A — Layout ve Routing Altyapisi

**Frontend:**
- [x] `ClientPortalLayout.jsx` — `frontend/src/layouts/`
  - Freelancer `DashboardLayout`'undan bagimsiz; daha sade sidebar
  - Sidebar menüsü: "Özet", "Projelerim", "Faturalarım"
  - Header'da müşteri logosu/adı ve çıkış butonu
  - **NOT:** Mevcut `DashboardLayout` dokunulmaz; sadece `ClientPortalLayout` eklenir
- [x] `ClientProtectedRoute.jsx` — mevcut `ProtectedRoute allowedRoles={['Client']}` ile çözüldü, ayrı component gerekmedi
- [x] `App.jsx`'e `/client-portal/*` route ağacı eklendi:
  ```
  /client-portal                 → ClientPortalLayout (ProtectedRoute allowedRoles=['Client'])
    /client-portal               → ClientHomePage (index)
    /client-portal/projects      → ClientProjectsPage
    /client-portal/projects/:id  → ClientProjectDetailPage
    /client-portal/invoices      → ClientInvoicesPage
    /client-portal/invoices/:id  → ClientInvoiceDetailPage
    /client-portal/messages      → ClientMessagesPage
  ```
- [x] `AppNavigator.js` güncellenir: token var + role == Client → `/client-portal/home`'a yönlendir
- [x] Mobil: `ClientTabNavigator.js` — `mobile/src/navigation/`
  - `AppNavigator.js`'de role'e göre `MainTabNavigator` veya `ClientTabNavigator` render edilir
  - Sekmeler: "Özet", "Projelerim", "Faturalarım"

---

#### 7B — Müşteri Özet Sayfası (/client-portal/home)

**Frontend:**
- [x] `ClientHomePage.jsx` — `frontend/src/pages/client-portal/`
  - "Hoş geldiniz, {müşteri adı}" başlığı
  - KPI kartları: aktif proje, bekleyen fatura, tamamlanan proje, toplam fatura tutarı
  - Son projeler listesi (progress bar ile)
  - Son faturalar listesi
- **Veri kaynakları:** `useMyProfile`, `useMyProjects`, `useMyInvoices` (özel client-portal hook'ları)

**Mobil:**
- [x] `ClientHomeScreen.js` — `mobile/src/screens/client/`

---

#### 7C — Projelerim (/client-portal/projects ve /:id)

**Frontend:**
- [x] `ClientProjectsPage.jsx` — `frontend/src/pages/client-portal/`
  - Freelancer `ProjectsPage`'den farklı: sadece bu müşteriye atanmış projeler, "Ekle/Sil" butonları yok
  - Grid kart yapısı, durum rozeti, bütçe bilgisi (salt okunur)
  - Tümü / Aktif / Tamamlanan tab filtresi
- [x] `ClientProjectDetailPage.jsx` — `frontend/src/pages/client-portal/`
  - Proje bilgileri + Kilometre Taşları / Görevler / İsteklerim sekmeleri
  - Kanban panosu görünmez; görevler salt okunur liste olarak gösterilir
  - Milestone listesi: tamamlananlar yeşil işaretli, progress bar

**Mobil:**
- [x] `ClientProjectListScreen.js`, `ClientProjectDetailScreen.js` — `mobile/src/screens/client/`

---

#### 7D — Faturalarım (/client-portal/invoices ve /:id)

**Frontend:**
- [x] `ClientInvoicesPage.jsx` — `frontend/src/pages/client-portal/`
  - Fatura tablosu: numara, tutar, son ödeme tarihi, durum
  - Durum rozetleri: Ödendi → yeşil, Gecikmiş → kırmızı, Revizyon Talep Edildi → turuncu, Client Onayladı → açık yeşil
  - "Yeni Fatura" butonu yok (salt okunur liste)
  - Durum tab filtresi
- [x] `ClientInvoiceDetailPage.jsx` — `frontend/src/pages/client-portal/`
  - Fatura başlık, kalemler (salt okunur tablo), ödeme geçmişi
  - **Aksiyon Çubuğu:**
    - Durum `Sent` → "Onayla" (yeşil) + "Revizyon İste" (turuncu)
    - Durum `ClientApproved` → "✓ Onayladınız" (readonly banner)
    - Durum `RevisionRequested` → "Revizyon talebiniz alındı" (readonly banner)
  - `<CommentSection invoiceId={invoice.id} />` entegrasyonu — fatura tartışması

**Mobil:**
- [x] `ClientInvoiceListScreen.js`, `ClientInvoiceDetailScreen.js` — `mobile/src/screens/client/`
  - Aksiyon butonları (Onayla / Revizyon İste) dahil

---

---

#### 7E — Client Istek Gonderme Entegrasyonu (Hafta 6G'den tamamlanan altyapi kullanilir)

**Hedef:** Client Portal'a "Istek Gonder" butonu entegre edilir; client kendi projesiyle ilgili istek gonderebilir ve istek durumlarini takip edebilir.

**Frontend:**
- [x] `ClientProjectDetailPage.jsx`'e "İstek Gönder" butonu — form inline (modal değil); istek gönderme + durum takibi "İsteklerim" sekmesinde
- [x] `ClientProjectDetailPage.jsx`'e "Gönderdiğim İstekler" listesi (durum: Beklemede / Onaylandı / Reddedildi)
- [x] `ClientPortalLayout.jsx`'e "İsteklerim" nav item eklendi (bekleyen istek sayisi badge'i ile)
- [x] `ClientHomePage.jsx`'e "Bekleyen İstekler" uyarı bantı eklendi
- [x] Backend: `ProjectResponse.PendingRequestCount` eklendi (DTO + GetMyProjectsAsync)

**Mobil:**
- [x] `mobile/src/services/clientPortalApi.js` — tüm client-portal API çağrıları
- [x] `mobile/src/navigation/AppNavigator.js` — role-based routing (Client → ClientTabNavigator)
- [x] `mobile/src/screens/auth/LoginScreen.js` — `userRole` SecureStore'a kaydediliyor
- [x] `mobile/src/navigation/ClientTabNavigator.js` — 3 sekmeli mor temalı navigasyon
- [x] `mobile/src/screens/client/ClientHomeScreen.js` — özet ekranı
- [x] `mobile/src/screens/client/ClientProjectListScreen.js` — proje listesi + filtre + arama
- [x] `mobile/src/screens/client/ClientProjectDetailScreen.js` — km taşları + görevler + istek gönderme
- [x] `mobile/src/screens/client/ClientInvoiceListScreen.js` — fatura listesi
- [x] `mobile/src/screens/client/ClientInvoiceDetailScreen.js` — fatura detay + Onayla/Revizyon İste

---

#### 7F — Mobil Freelancer Tarafı İyileştirmeleri (14 Mayıs 2026)

**Hedef:** Freelancer mobil deneyimini zenginleştirme, sekme ikonlarını ekleme, müşteri detay ekranı oluşturma ve uygulama çökmelerini giderme.

**Yeni Dosyalar (Mobil):**
- [x] `mobile/src/screens/customers/CustomerDetailScreen.js` — Tam özellikli müşteri detay ekranı
  - Büyük avatar + şirket adı + iletişim kişisi + aktif/pasif rozeti
  - İstatistik kartları: Toplam Proje / Aktif Proje / Tamamlandı
  - İletişim bilgileri (e-posta linke tıklanınca `mailto:`, telefon tıklanınca `tel:` açılır)
  - Vergi numarası + fatura adresi bilgileri
  - Müşteriye ait proje kartları (durum rozeti + progress bar + milestone sayacı)
  - **Düzenle** butonu → `CustomerForm` ekranına gider
  - **Sil** butonu → onay Alert'i sonrası `customerApi.remove(id)` çağrısı

**Değiştirilen Dosyalar (Mobil):**
- [x] `mobile/src/navigation/MainTabNavigator.js`
  - Tüm sekme butonlarına emoji ikonu eklendi: 🏠 Ana Sayfa / 👥 Müşteriler / 📋 Projeler / ⏱ Süre / ⚙️ Ayarlar
  - `CustomerDetail` route'u `CustomerListScreen`'den `CustomerDetailScreen`'e yeniden bağlandı
  - Sekme başlığı dinamik hale getirildi: `route.params?.customer?.companyName ?? 'Müşteri Detayı'`
  - `tabBarLabelStyle` ve `tabBarStyle.height` iyileştirmeleri
- [x] `mobile/src/screens/main/HomeScreen.js` — Komple yeniden yazıldı
  - Karşılama başlığı: "Merhaba 👋 + İsim" + avatar butonu (çıkış)
  - KPI grid (2×2): Aktif Proje / Tamamlandı / Müşteri / Toplam Proje
  - Hızlı İşlemler satırı: Yeni Proje / Müşteri Ekle / Süre Takibi
  - "Devam Eden Projeler" bölümü: son 3 aktif/bekleyen proje mini kartları (progress bar dahil)
  - Çıkış butonu kırmızı kenarlıklı, altta
  - `Promise.all` yerine güvenli `try/catch` ile `Promise.all` (her servis bağımsız hata yakalanabilir)
- [x] `mobile/src/screens/customers/CustomerListScreen.js`
  - `navigation.navigate('CustomerDetail', { customer: item })` → `{ customerId: item.id, customer: item }` olarak güncellendi (CustomerDetailScreen hem ID hem anlık data alıyor)
- [x] `mobile/src/screens/comments/CommentScreen.js` — Çökme nedenleri giderildi
  - `useEffect` içindeki `navigation.setOptions` → `useLayoutEffect` ile değiştirildi (stale closure çökmesi engellendi)
  - Tüm callback'lere `useCallback` eklendi; dependency array eksiksiz hale getirildi
  - `Array.isArray(data)` guard eklendi (backend'den dizi dışında yanıt gelirse çökme engellendi)
  - `KeyboardAvoidingView` `keyboardVerticalOffset` iyileştirmesi
- [x] `mobile/src/services/api.js` — Kritik çökme düzeltmesi
  - `import { DeviceEventEmitter } from 'react-native'` eklendi
  - Refresh token başarısız olduğunda: `user` ve `userRole` de SecureStore'dan siliniyor; `DeviceEventEmitter.emit('logout')` çağrılıyor → `AppNavigator` state'i sıfırlanıyor → kullanıcı login ekranına yönlendiriliyor
  - Önceki davranış: Token siliniyor ama uygulama state'i resetlenmiyordu → her API çağrısında 401 → sonsuz döngü çökmesi

**Çökme Kök Nedenleri Analizi:**
1. **useEffect + navigation.setOptions stale closure** — `CommentScreen`'de `navigation` dep eksikti → düzeltme: `useLayoutEffect`
2. **Refresh token sonrası state sıfırlanmıyor** — `api.js`'de `DeviceEventEmitter.emit('logout')` eksikti → düzeltme eklendi
3. **`CustomerDetail` yanlış bileşene bağlıydı** — `MainTabNavigator`'da `CustomerListScreen` kullanılıyordu → `CustomerDetailScreen` ile değiştirildi
4. **`Promise.all` zinciri** — Eski `HomeScreen`'de tek catch bloğu tüm veri yüklemesini durduruyordu → yeni HomeScreen ayrı try/catch

---

### Hafta 7G: Mobil Freelancer — Ana Sayfa + Faturalar (14 Mayis 2026)
**Hedef:** Web freelancer fatura senaryosu ve ana sayfa KPI'larinin mobilde tamamlanmasi; alt menunun sistem jest alanindan korunmasi

- [X] Freelancer bottom tab `useSafeAreaInsets` ile yukari alindi (telefon home indicator ile cakisma azaltildi)
- [X] Client mobil tab bar ayni safe-area yaklasimiyla guncellendi
- [X] Ana sayfa KPI: gecikmis faturalar, bugunku calisma (saat + sagda kucuk «sa»), mevcut proje/musteri KPI'lari korundu
- [X] Son projeler bolumu + «Tumu Gor» → Projeler sekmesi; son 5 proje (tum durumlar)
- [X] Ana sayfa «Cikis Yap» ve header cikis kaldirildi; avatar → Ayarlar; cikis yalniz Ayarlar'dan
- [X] Yeni alt sekme Faturalar: liste (durum filtreleri), yeni fatura formu, detay (gonder, taslak sil, kalem CRUD taslakta, odeme ekle, ClientApproved → odendi isaretle, yorumlar)

---

### Hafta 8: UI/UX Sprint — Dashboard, PDF Export, Analiz, İstekler ✅ TAMAMLANDI
**Tamamlanma:** 23 Mayis 2026

**Backend Degisiklikleri:**
- [x] `ProjectResponse`'a `TotalTaskCount`, `CompletedTaskCount`, `ProgressPercentage` alanlari eklendi (`CrmDtos.cs`)
- [x] `ProjectRepository` sorgularina `.Include(p => p.Tasks)` eklendi (`CrmRepositories.cs`)
- [x] `MapToResponse(Project)` task sayim ve ilerleme hesabi guncellendi (`CrmServices.cs`)
- [x] `IProjectRepository`'e `GetAllTasksByUserIdAsync` eklendi
- [x] `IProjectService`'e `GetDashboardTasksAsync` eklendi
- [x] `GET /api/projects/tasks/dashboard` endpoint'i eklendi (`ProjectController.cs`)
- [x] `getDashboardTasks` frontend servis metodu + `useAllProjectTasks` hook eklendi

**Web Frontend Degisiklikleri:**
- [x] `DashboardHome.jsx` — tam yenileme: KPI widget'lari, task board, son faturalar, aktivite feed, light tema korundu
- [x] `ProjectDetailPage.jsx` — breadcrumb, 4 KPI karti (gorev sayisi, tamamlanan, ilerleme, butce), iki sutunlu layout
- [x] `TimeTrackerPage.jsx` — proje bazli gruplama (acilir/kapanir), Kayitlar + Analiz sekmesi, cubuk grafik, gorev detay tablosu
- [x] `InvoiceDetailPage.jsx` — PDF export; jsPDF/autoTable kaldirildi, HTML print-window yaklasimiyla degistirildi (Turkce karakter sorunu giderildi)
- [x] `RequestsPage.jsx` — yeni placeholder sayfa: KPI kartlari, yakinda banneri, demo liste
- [x] `DashboardLayout.jsx` — Istekler nav ogesi eklendi (Freelancer-only, Send ikonu)
- [x] `App.jsx` — `/dashboard/requests` route eklendi

**Mobil Degisiklikleri:**
- [x] `ProjectDetailScreen.js` — 4 KPI karti + detaylar bolumu eklendi
- [x] `TimeTrackerScreen.js` — proje bazli gruplama, Kayitlar + Analiz sekmesi, cubuk grafik, gorev detay tablosu; duplicate key hatasi duzeltildi (`key={t.name}` → `key={projectId_id_index}`)
- [x] `InvoiceDetailScreen.js` — `expo-print` + `expo-sharing` ile PDF export; tam HTML sablonu, native paylasim diyalogu
- [x] `RequestsScreen.js` — yeni placeholder ekran: KPI kartlari, yakinda banneri, demo liste
- [x] `MainTabNavigator.js` — Istekler tab eklendi (📨 ikonu)
- [x] `expo-print` + `expo-sharing` paketleri kuruldu

**Duzeltilen Hatalar:**
- [x] Web PDF Turkce karakter bozulmasi — jsPDF Helvetica font UTF-8 desteklemiyor; HTML `window.print()` ile cozuldu
- [x] Mobil `TimeTrackerScreen` duplicate key — gorev ismi key olarak kullaniliyordu; `projectId + taskId + index` uclusune geicldi

---

### Hafta 9: Analitik Dashboard
**Hedef:** Grafik ve KPI'larla is performansi gorsellestirme

**Not:** Temel KPI kartları (Bekleyen Gelir, Aktif Projeler, Gecikmiş Faturalar, son projeler, günün zaman özeti) Hafta 6E'de `DashboardHome.jsx` ile hazırlanır. Hafta 9'da bu veriler grafiklerle zenginleştirilir.

- [ ] Recharts entegrasyonu
- [ ] `DashboardHome.jsx` gelistirme — Hafta 6E'de olusan KPI kartlarinin grafik versiyonlari
- [ ] Gelir ozeti grafigi (aylik/yillik) — `InvoiceService`'den veri
- [ ] Proje durum dagilimi (pie chart) — `ProjectService`'den veri
- [ ] Zaman dagilimi grafigi — `TimeEntryService.GetSummaryAsync`'ten veri
- [ ] Detayli KPI kartlari: ortalama proje suresi, en karli musteri, saatlik ucreti vb.
- [ ] Mobil ozet ekrani — mevcut `HomeScreen.js` grafik eklentisi ile zenginlestirilir

---

### Hafta 10: Mobil Gelistirmeler
**Hedef:** Mobil uygulamanin cilalanmasi ve push notification

- [ ] Push Notification altyapisi
- [ ] UI/UX iyilestirmeleri
- [ ] Offline veri cache'leme (AsyncStorage / SQLite)
- [ ] Profil fotografi yukleme
- [ ] Karanlik mod destegi

---

### Hafta 11: Test, Optimizasyon ve Refactoring
**Hedef:** Kod kalitesi, performans ve guvenilirlik

- [ ] Backend unit testleri (xUnit)
- [ ] Frontend bilesne testleri (Vitest + Testing Library)
- [ ] API entegrasyon testleri
- [ ] Performans optimizasyonu (lazy loading, code splitting)
- [ ] Veritabani indeksleri ve sorgu optimizasyonu
- [ ] Guvenlik denetimi (OWASP Top 10)
- [ ] Kod refactoring ve teknik borc temizligi

---

### Hafta 12: Deployment ve Canliya Alma
**Hedef:** Uygulamanin production ortamina tasinmasi

- [ ] Docker konteynerizasyonu (backend + PostgreSQL)
- [ ] Frontend deploy (Vercel veya Netlify)
- [ ] Backend deploy (AWS / DigitalOcean / Railway)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Domain ve SSL sertifikasi
- [ ] Veritabani yedekleme stratejisi
- [ ] Monitoring ve alerting (Sentry, Grafana)
- [ ] Mobil uygulama build (EAS Build)

---

## 12. Onemli Kurallar ve Konvansiyonlar

### 12.1 Kod Yazim Kurallari
1. **C# Task Cakismasi:** Entity adi olarak `Task` KULLANILMAZ. `ProjectTask` veya `AppTask` kullanilir.
2. **Tailwind v4:** `tailwind.config.js` OLUSTURULMAZ. Tema `@theme` ile `index.css` icinde tanimlanir.
3. **Veri Izolasyonu:** Her backend GET/PUT/DELETE'de UserId dogrulamasi ZORUNLUDUR.
4. **Dosya Yolu:** Kod degisiklikleri her zaman tam dosya yolu ile belirtilir (orn: `frontend/src/pages/Projects/KanbanBoard.jsx`).
5. **Soft Delete:** Entity silme islemleri fiziksel degil, `IsDeleted = true` ile yapilir.

### 12.2 Guvenlik Kurallari
1. Sifre asla duz metin saklanmaz (BCrypt hash)
2. JWT secret key en az 32 karakter olmali
3. Refresh token her kullaninda rotate edilir
4. CORS origin listesi production'da kisitli olmali
5. Client rolu yazma islemlerinden `FreelancerOnly` policy ile engellenir
6. Global exception middleware hassas hata detaylarini gizler

### 12.3 Veritabani Kurallari
1. Tum entity'ler `BaseEntity`'den turetilir
2. `IsDeleted` global query filter tum entity'lerde aktif
3. Foreign key delete davranislari dogru ayarlanmali (Restrict vs Cascade)
4. Tarihler UTC olarak saklanir
5. Migration'lar sirayla uygulanmali

---

## 13. Gelistirme Ortami Kurulumu

### 13.1 Backend
```bash
cd backend
dotnet restore
# appsettings.json'da PostgreSQL baglanti dizesini ayarla
dotnet ef database update --project FreelancerSaaS.Infrastructure --startup-project FreelancerSaaS.API
dotnet run --project FreelancerSaaS.API
# API: http://localhost:5024
# Swagger: http://localhost:5024/swagger
```

### 13.2 Frontend
```bash
cd frontend
npm install
# .env dosyasi olustur: VITE_API_URL=http://localhost:5024/api
npm run dev
# UI: http://localhost:5173
```

### 13.3 Mobil
```bash
cd mobile
npm install
# .env dosyasi olustur: EXPO_PUBLIC_API_URL=http://<LAN_IP>:5024/api
npx expo start
```

### 13.4 Ortam Degiskenleri

**Backend (appsettings.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=<SIFRE>"
  },
  "JwtSettings": {
    "SecretKey": "<EN_AZ_32_KARAKTER>",
    "Issuer": "FreelancerSaaS",
    "Audience": "FreelancerSaaSUsers",
    "TokenExpirationMins": "60"
  },
  "CorsSettings": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
  }
}
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5024/api
```

**Mobil (.env):**
```
EXPO_PUBLIC_API_URL=http://192.168.1.100:5024/api
```

---

## 14. NuGet ve NPM Bagimliliklari

### Backend NuGet Paketleri
| Paket | Versiyon | Katman |
|-------|----------|--------|
| BCrypt.Net-Next | 4.1.0 | Infrastructure |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.5 | Infrastructure + API |
| Microsoft.EntityFrameworkCore | 10.0.3 | Infrastructure |
| Microsoft.EntityFrameworkCore.Tools | 10.0.3 | Infrastructure |
| Microsoft.EntityFrameworkCore.Design | 10.0.5 | API |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.0 | Infrastructure |
| System.IdentityModel.Tokens.Jwt | 8.17.0 | Infrastructure |
| FluentValidation.AspNetCore | 11.3.1 | API |
| Serilog.AspNetCore | 10.0.0 | API |
| Serilog.Sinks.Console | 6.1.1 | API |
| Serilog.Sinks.File | 7.0.0 | API |
| Swashbuckle.AspNetCore | 10.1.4 | API |

### Frontend NPM Paketleri
| Paket | Versiyon | Amac |
|-------|----------|------|
| react | 19.2.0 | UI framework |
| react-dom | 19.2.0 | DOM render |
| react-router-dom | 7.13.2 | Routing |
| @tanstack/react-query | 5.96.2 | Server state |
| axios | 1.14.0 | HTTP client |
| react-hook-form | 7.72.0 | Form yonetimi |
| @hookform/resolvers | 5.2.2 | Zod resolver |
| zod | 4.3.6 | Schema validasyon |
| lucide-react | 0.577.0 | Ikonlar |
| tailwindcss | 4.2.1 | CSS framework |
| @tailwindcss/vite | 4.2.2 | Vite plugin |
| vite | 7.3.1 | Build araci |

### Mobil NPM Paketleri
| Paket | Versiyon | Amac |
|-------|----------|------|
| react-native | 0.81.5 | Mobil framework |
| expo | 54.0.0 | Managed workflow |
| @react-navigation/native | 7.1.33 | Navigasyon |
| @react-navigation/native-stack | 7.14.4 | Stack nav |
| @react-navigation/bottom-tabs | 7.15.9 | Tab nav |
| expo-secure-store | 15.0.8 | Token saklama |
| axios | 1.14.0 | HTTP client |
| @react-native-picker/picker | 2.11.1 | Dropdown |

---

*Bu dokuman SoloSync projesinin kapsamli teknik referansidir. Her haftanin sonunda Bolum 0 (HAFIZA) ve Bolum 10 (Tamamlanan Haftalar) mutlaka guncellenmelidir.*

*Son guncelleme: 14 Mayis 2026 — 7F (Mobil Freelancer Tarafı İyileştirmeleri) eklendi: HomeScreen zenginlestirildi, sekme ikonları düzeltildi, CustomerDetailScreen olusturuldu, cokme nedenlerı giderildi.*
