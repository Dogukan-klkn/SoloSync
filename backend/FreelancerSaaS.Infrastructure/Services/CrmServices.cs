using FreelancerSaaS.Core.DTOs;
using FreelancerSaaS.Core.Entities;
using FreelancerSaaS.Core.Interfaces;
using FreelancerSaaS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repo;

        public CustomerService(ICustomerRepository repo) => _repo = repo;

        public async Task<IEnumerable<CustomerResponse>> GetCustomersAsync(Guid userId, string? search = null)
        {
            var customers = await _repo.GetByUserIdAsync(userId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLowerInvariant();
                customers = customers.Where(c =>
                    c.CompanyName.ToLower().Contains(search) ||
                    c.ContactName.ToLower().Contains(search) ||
                    c.Email.ToLower().Contains(search));
            }

            return customers.Select(MapToResponse);
        }

        public async Task<CustomerResponse?> GetCustomerByIdAsync(Guid id, Guid userId)
        {
            var c = await _repo.GetByIdWithProjectsAsync(id);
            if (c == null || c.UserId != userId) return null;
            return MapToResponse(c);
        }

        public async Task<CustomerResponse> CreateCustomerAsync(CreateCustomerRequest req, Guid userId)
        {
            var customer = new Customer
            {
                UserId         = userId,
                CompanyName    = req.CompanyName,
                ContactName    = req.ContactName,
                Email          = req.Email,
                Phone          = req.Phone,
                TaxNumber      = req.TaxNumber,
                BillingAddress = req.BillingAddress,
            };
            await _repo.AddAsync(customer);
            await _repo.SaveChangesAsync();
            return MapToResponse(customer);
        }

        public async Task<CustomerResponse> UpdateCustomerAsync(Guid id, UpdateCustomerRequest req, Guid userId)
        {
            var customer = await _repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Müşteri bulunamadı.");
            if (customer.UserId != userId) throw new UnauthorizedAccessException();

            customer.CompanyName    = req.CompanyName;
            customer.ContactName    = req.ContactName;
            customer.Email          = req.Email;
            customer.Phone          = req.Phone;
            customer.TaxNumber      = req.TaxNumber;
            customer.BillingAddress = req.BillingAddress;
            customer.IsActive       = req.IsActive;
            customer.UpdatedAt      = DateTime.UtcNow;

            _repo.Update(customer);
            await _repo.SaveChangesAsync();
            return MapToResponse(customer);
        }

        public async Task DeleteCustomerAsync(Guid id, Guid userId)
        {
            var customer = await _repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Müşteri bulunamadı.");
            if (customer.UserId != userId) throw new UnauthorizedAccessException();
            _repo.Remove(customer);
            await _repo.SaveChangesAsync();
        }

        private static CustomerResponse MapToResponse(Customer c) => new()
        {
            Id             = c.Id,
            CompanyName    = c.CompanyName,
            ContactName    = c.ContactName,
            Email          = c.Email,
            Phone          = c.Phone,
            TaxNumber      = c.TaxNumber,
            BillingAddress = c.BillingAddress,
            IsActive       = c.IsActive,
            CreatedAt      = c.CreatedAt,
            ProjectCount   = c.Projects?.Count ?? 0,
        };
    }

    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository  _projectRepo;
        private readonly ICustomerRepository _customerRepo;
        private readonly ApplicationDbContext _context;

        public ProjectService(
            IProjectRepository projectRepo,
            ICustomerRepository customerRepo,
            ApplicationDbContext context)
        {
            _projectRepo  = projectRepo;
            _customerRepo = customerRepo;
            _context      = context;
        }

        public async Task<IEnumerable<ProjectResponse>> GetProjectsAsync(Guid userId, Guid? customerId = null)
        {
            var projects = customerId.HasValue
                ? await _projectRepo.GetByCustomerIdAsync(customerId.Value)
                : await _projectRepo.GetProjectsByUserIdAsync(userId);

            // Güvenlik: sadece kendi müşterilere ait projeler
            return projects
                .Where(p => p.Customer.UserId == userId)
                .Select(MapToResponse);
        }

        public async Task<ProjectResponse?> GetProjectByIdAsync(Guid id, Guid userId)
        {
            var p = await _projectRepo.GetByIdWithMilestonesAsync(id);
            if (p == null || p.Customer.UserId != userId) return null;
            return MapToResponse(p);
        }

        public async Task<ProjectResponse> CreateProjectAsync(CreateProjectRequest req, Guid userId)
        {
            // Müşterinin bu kullanıcıya ait olduğunu doğrula
            var customer = await _customerRepo.GetByIdAsync(req.CustomerId)
                ?? throw new KeyNotFoundException("Müşteri bulunamadı.");
            if (customer.UserId != userId) throw new UnauthorizedAccessException();

            var project = new Project
            {
                CustomerId  = req.CustomerId,
                Name        = req.Name,
                Description = req.Description,
                Status      = (ProjectStatus)req.Status,
                // "YYYY-MM-DD" string → UTC DateTime?
                StartDate   = ParseDate(req.StartDate),
                EndDate     = ParseDate(req.EndDate),
                Budget      = req.Budget,
            };
            await _projectRepo.AddAsync(project);
            await _projectRepo.SaveChangesAsync();

            project.Customer = customer;
            return MapToResponse(project);
        }

        public async Task<ProjectResponse> UpdateProjectAsync(Guid id, UpdateProjectRequest req, Guid userId)
        {
            var project = await _projectRepo.GetByIdWithMilestonesAsync(id)
                ?? throw new KeyNotFoundException("Proje bulunamadı.");
            if (project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            project.Name        = req.Name;
            project.Description = req.Description;
            project.Status      = (ProjectStatus)req.Status;
            // "YYYY-MM-DD" string → UTC DateTime?
            project.StartDate   = ParseDate(req.StartDate);
            project.EndDate     = ParseDate(req.EndDate);
            project.Budget      = req.Budget;
            project.UpdatedAt   = DateTime.UtcNow;

            _projectRepo.Update(project);
            await _projectRepo.SaveChangesAsync();
            return MapToResponse(project);
        }

        public async Task DeleteProjectAsync(Guid id, Guid userId)
        {
            var project = await _projectRepo.GetByIdWithMilestonesAsync(id)
                ?? throw new KeyNotFoundException("Proje bulunamadı.");
            if (project.Customer.UserId != userId) throw new UnauthorizedAccessException();
            _projectRepo.Remove(project);
            await _projectRepo.SaveChangesAsync();
        }

        public async Task<IEnumerable<MilestoneResponse>> GetMilestonesAsync(Guid projectId, Guid userId)
        {
            var project = await _projectRepo.GetByIdWithMilestonesAsync(projectId)
                ?? throw new KeyNotFoundException("Proje bulunamadı.");
            if (project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            // Tasks'ları milestone bazında çek (dinamik progress için)
            var milestoneTasks = await _context.ProjectTasks
                .Where(t => t.ProjectId == projectId && t.MilestoneId != null)
                .Select(t => new { t.MilestoneId, t.Status })
                .ToListAsync();

            return project.Milestones.OrderBy(m => m.Order).Select(m =>
            {
                var tasks = milestoneTasks.Where(t => t.MilestoneId == m.Id).ToList();
                return MapMilestone(m, tasks.Count, tasks.Count(t => t.Status == ProjectTaskStatus.Done));
            });
        }

        public async Task<MilestoneResponse> AddMilestoneAsync(CreateMilestoneRequest req, Guid userId)
        {
            var project = await _projectRepo.GetByIdWithMilestonesAsync(req.ProjectId)
                ?? throw new KeyNotFoundException("Proje bulunamadı.");
            if (project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            var milestone = new Milestone
            {
                ProjectId   = req.ProjectId,
                Title       = req.Title,
                Description = req.Description,
                DueDate     = ParseDate(req.DueDate),
                Order       = req.Order,
            };
            await _context.Milestones.AddAsync(milestone);
            await _context.SaveChangesAsync();
            return MapMilestone(milestone, 0, 0);
        }

        /// <summary>
        /// "2026-04-04" gibi date-only string'i UTC DateTime'a çevirir.
        /// Boş veya geçersiz ise null döner — exception fırlatmaz.
        /// </summary>
        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return DateTime.TryParse(value, out var dt)
                ? DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                : null;
        }

        private static ProjectResponse MapToResponse(Project p) => new()
        {
            Id                      = p.Id,
            CustomerId              = p.CustomerId,
            CustomerName            = p.Customer?.CompanyName ?? string.Empty,
            Name                    = p.Name,
            Description             = p.Description,
            Status                  = p.Status.ToString(),
            StatusValue             = (int)p.Status,
            StartDate               = p.StartDate,
            EndDate                 = p.EndDate,
            Budget                  = p.Budget,
            CreatedAt               = p.CreatedAt,
            MilestoneCount          = p.Milestones?.Count ?? 0,
            // Milestone tamamlanma sayısı artık task-bazlı değil; sadece count tutuyoruz
            CompletedMilestoneCount = p.Milestones?.Count(m => m.Tasks.Any() && m.Tasks.All(t => t.Status == ProjectTaskStatus.Done)) ?? 0,
        };

        private static MilestoneResponse MapMilestone(Milestone m, int totalTasks, int completedTasks)
        {
            var pct = totalTasks > 0 ? (int)Math.Round((double)completedTasks / totalTasks * 100) : 0;
            return new()
            {
                Id                 = m.Id,
                Title              = m.Title,
                Description        = m.Description,
                DueDate            = m.DueDate,
                Order              = m.Order,
                TotalTasks         = totalTasks,
                CompletedTasks     = completedTasks,
                ProgressPercentage = pct,
            };
        }
    }

    public class ProjectTaskService : IProjectTaskService
    {
        private readonly IProjectTaskRepository _taskRepo;
        private readonly IProjectRepository     _projectRepo;
        private readonly ApplicationDbContext    _context;

        public ProjectTaskService(
            IProjectTaskRepository taskRepo,
            IProjectRepository projectRepo,
            ApplicationDbContext context)
        {
            _taskRepo    = taskRepo;
            _projectRepo = projectRepo;
            _context     = context;
        }

        public async Task<IEnumerable<ProjectTaskResponse>> GetTasksByProjectAsync(Guid projectId, Guid userId)
        {
            var project = await _projectRepo.GetByIdWithMilestonesAsync(projectId)
                ?? throw new KeyNotFoundException("Proje bulunamadı.");
            if (project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            var tasks = await _taskRepo.GetByProjectIdAsync(projectId);
            return tasks.Select(MapToResponse);
        }

        public async Task<ProjectTaskResponse?> GetTaskByIdAsync(Guid id, Guid userId)
        {
            var task = await _taskRepo.GetByIdWithProjectAsync(id);
            if (task == null || task.Project.Customer.UserId != userId) return null;
            return MapToResponse(task);
        }

        public async Task<ProjectTaskResponse> CreateTaskAsync(CreateProjectTaskRequest req, Guid userId)
        {
            var project = await _projectRepo.GetByIdWithMilestonesAsync(req.ProjectId)
                ?? throw new KeyNotFoundException("Proje bulunamadı.");
            if (project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            var task = new ProjectTask
            {
                ProjectId   = req.ProjectId,
                MilestoneId = req.MilestoneId,
                Title       = req.Title,
                Description = req.Description,
                Status      = (ProjectTaskStatus)req.Status,
                Priority    = (ProjectTaskPriority)req.Priority,
                DueDate     = ParseDate(req.DueDate),
                Order       = req.Order,
            };
            await _taskRepo.AddAsync(task);
            await _taskRepo.SaveChangesAsync();

            await SyncTagsAsync(task.Id, req.Tags);

            var created = await _taskRepo.GetByIdWithProjectAsync(task.Id) ?? task;
            created.Project = project;
            return MapToResponse(created);
        }

        public async Task<ProjectTaskResponse> UpdateTaskAsync(Guid id, UpdateProjectTaskRequest req, Guid userId)
        {
            var task = await _taskRepo.GetByIdWithProjectAsync(id)
                ?? throw new KeyNotFoundException("Görev bulunamadı.");
            if (task.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            task.MilestoneId = req.MilestoneId;
            task.Title       = req.Title;
            task.Description = req.Description;
            task.Status      = (ProjectTaskStatus)req.Status;
            task.Priority    = (ProjectTaskPriority)req.Priority;
            task.DueDate     = ParseDate(req.DueDate);
            task.Order       = req.Order;
            task.UpdatedAt   = DateTime.UtcNow;

            _taskRepo.Update(task);
            await _taskRepo.SaveChangesAsync();

            await SyncTagsAsync(task.Id, req.Tags);

            var updated = await _taskRepo.GetByIdWithProjectAsync(task.Id) ?? task;
            return MapToResponse(updated);
        }

        public async Task DeleteTaskAsync(Guid id, Guid userId)
        {
            var task = await _taskRepo.GetByIdWithProjectAsync(id)
                ?? throw new KeyNotFoundException("Görev bulunamadı.");
            if (task.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();
            _taskRepo.Remove(task);
            await _taskRepo.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProjectTaskResponse>> ReorderTasksAsync(List<ReorderTaskRequest> items, Guid userId)
        {
            if (items.Count == 0) return [];

            var taskIds = items.Select(i => i.Id).ToList();
            var tasks = await _context.ProjectTasks
                .Include(t => t.Project).ThenInclude(p => p.Customer)
                .Where(t => taskIds.Contains(t.Id))
                .ToListAsync();

            foreach (var task in tasks)
            {
                if (task.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();

                var item = items.First(i => i.Id == task.Id);
                task.Status    = (ProjectTaskStatus)item.Status;
                task.Order     = item.Order;
                task.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return tasks.OrderBy(t => t.Status).ThenBy(t => t.Order).Select(MapToResponse);
        }

        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return DateTime.TryParse(value, out var dt)
                ? DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                : null;
        }

        private static ProjectTaskResponse MapToResponse(ProjectTask t) => new()
        {
            Id            = t.Id,
            ProjectId     = t.ProjectId,
            MilestoneId   = t.MilestoneId,
            Title         = t.Title,
            Description   = t.Description,
            Status        = t.Status.ToString(),
            StatusValue   = (int)t.Status,
            Priority      = t.Priority.ToString(),
            PriorityValue = (int)t.Priority,
            DueDate       = t.DueDate,
            Order         = t.Order,
            CreatedAt     = t.CreatedAt,
            Tags          = t.Tags.Select(tag => new TagResponse
            {
                Id    = tag.Id,
                Label = tag.Label,
                Color = tag.Color,
            }).ToList(),
        };

        private async Task SyncTagsAsync(Guid taskId, List<TagRequest>? tags)
        {
            if (tags == null) return;

            var existing = await _context.ProjectTaskTags
                .Where(t => t.ProjectTaskId == taskId)
                .ToListAsync();

            _context.ProjectTaskTags.RemoveRange(existing);
            await _context.SaveChangesAsync();

            for (int i = 0; i < tags.Count; i++)
            {
                _context.ProjectTaskTags.Add(new ProjectTaskTag
                {
                    ProjectTaskId = taskId,
                    Label         = tags[i].Label,
                    Color         = tags[i].Color,
                    Order         = i,
                });
            }
            await _context.SaveChangesAsync();
        }
    }

    public class TimeEntryService : ITimeEntryService
    {
        private readonly ITimeEntryRepository   _entryRepo;
        private readonly IProjectTaskRepository _taskRepo;

        public TimeEntryService(ITimeEntryRepository entryRepo, IProjectTaskRepository taskRepo)
        {
            _entryRepo = entryRepo;
            _taskRepo  = taskRepo;
        }

        public async Task<TimeEntryResponse> StartAsync(StartTimeEntryRequest req, Guid userId)
        {
            // Zaten çalışan bir kayıt varsa hata fırlat
            var running = await _entryRepo.GetRunningEntryAsync(userId);
            if (running != null)
                throw new ArgumentException("Zaten çalışan bir zaman kaydı var. Önce onu durdurun.");

            var task = await _taskRepo.GetByIdWithProjectAsync(req.ProjectTaskId)
                ?? throw new KeyNotFoundException("Görev bulunamadı.");
            if (task.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();
            if (task.Status == ProjectTaskStatus.Done)
                throw new ArgumentException("Tamamlanmış bir göreve zaman kaydı başlatılamaz.");

            var entry = new TimeEntry
            {
                ProjectTaskId = req.ProjectTaskId,
                UserId        = userId,
                StartTime     = DateTime.UtcNow,
                Description   = req.Description,
            };
            await _entryRepo.AddAsync(entry);
            await _entryRepo.SaveChangesAsync();

            entry.ProjectTask = task;
            return MapToResponse(entry);
        }

        public async Task<TimeEntryResponse> StopAsync(Guid entryId, StopTimeEntryRequest req, Guid userId)
        {
            var entry = await _entryRepo.GetByIdWithTaskAsync(entryId)
                ?? throw new KeyNotFoundException("Zaman kaydı bulunamadı.");
            if (entry.UserId != userId) throw new UnauthorizedAccessException();
            if (entry.EndTime != null) throw new ArgumentException("Bu kayıt zaten durdurulmuş.");

            entry.EndTime    = DateTime.UtcNow;
            entry.Duration   = (int)(entry.EndTime.Value - entry.StartTime).TotalSeconds;
            entry.Description = req.Description ?? entry.Description;
            entry.UpdatedAt  = DateTime.UtcNow;

            _entryRepo.Update(entry);
            await _entryRepo.SaveChangesAsync();
            return MapToResponse(entry);
        }

        public async Task<TimeEntryResponse> CreateManualAsync(CreateManualTimeEntryRequest req, Guid userId)
        {
            var task = await _taskRepo.GetByIdWithProjectAsync(req.ProjectTaskId)
                ?? throw new KeyNotFoundException("Görev bulunamadı.");
            if (task.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            var start = ParseDateTime(req.StartTime)
                ?? throw new ArgumentException("Geçersiz başlangıç zamanı.");
            var end = ParseDateTime(req.EndTime)
                ?? throw new ArgumentException("Geçersiz bitiş zamanı.");
            if (end <= start) throw new ArgumentException("Bitiş zamanı başlangıçtan sonra olmalıdır.");

            // Çakışma (overlap) kontrolü: aynı kullanıcının bu aralıkta tamamlanmış kaydı varsa reddet
            var candidates = await _entryRepo.GetByUserIdAsync(userId, null, start, end);
            bool hasOverlap = candidates.Any(e =>
                e.EndTime != null &&
                e.StartTime < end &&
                e.EndTime > start);
            if (hasOverlap)
                throw new ArgumentException("Bu zaman aralığında zaten bir kayıt bulunuyor. Çakışan kayıtlar eklenemez.");

            var entry = new TimeEntry
            {
                ProjectTaskId = req.ProjectTaskId,
                UserId        = userId,
                StartTime     = start,
                EndTime       = end,
                Duration      = (int)(end - start).TotalSeconds,
                Description   = req.Description,
            };
            await _entryRepo.AddAsync(entry);
            await _entryRepo.SaveChangesAsync();

            entry.ProjectTask = task;
            return MapToResponse(entry);
        }

        public async Task<TimeEntryResponse> UpdateAsync(Guid id, UpdateTimeEntryRequest req, Guid userId)
        {
            var entry = await _entryRepo.GetByIdWithTaskAsync(id)
                ?? throw new KeyNotFoundException("Zaman kaydı bulunamadı.");
            if (entry.UserId != userId) throw new UnauthorizedAccessException();

            var start = ParseDateTime(req.StartTime)
                ?? throw new ArgumentException("Geçersiz başlangıç zamanı.");
            var end = ParseDateTime(req.EndTime)
                ?? throw new ArgumentException("Geçersiz bitiş zamanı.");
            if (end <= start) throw new ArgumentException("Bitiş zamanı başlangıçtan sonra olmalıdır.");

            entry.StartTime   = start;
            entry.EndTime     = end;
            entry.Duration    = (int)(end - start).TotalSeconds;
            entry.Description = req.Description;
            entry.UpdatedAt   = DateTime.UtcNow;

            _entryRepo.Update(entry);
            await _entryRepo.SaveChangesAsync();
            return MapToResponse(entry);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var entry = await _entryRepo.GetByIdWithTaskAsync(id)
                ?? throw new KeyNotFoundException("Zaman kaydı bulunamadı.");
            if (entry.UserId != userId) throw new UnauthorizedAccessException();
            _entryRepo.Remove(entry);
            await _entryRepo.SaveChangesAsync();
        }

        public async Task<IEnumerable<TimeEntryResponse>> GetEntriesAsync(
            Guid userId, Guid? projectTaskId = null, string? from = null, string? to = null)
        {
            var entries = await _entryRepo.GetByUserIdAsync(
                userId,
                projectTaskId,
                ParseDateTime(from),
                ParseDateTime(to));

            return entries.Select(MapToResponse);
        }

        public async Task<TimeEntryResponse?> GetRunningEntryAsync(Guid userId)
        {
            var entry = await _entryRepo.GetRunningEntryAsync(userId);
            return entry == null ? null : MapToResponse(entry);
        }

        public async Task<TimeSummaryResponse> GetSummaryAsync(Guid userId, string? from = null, string? to = null)
        {
            var fromDate = ParseDateTime(from);
            var toDate   = ParseDateTime(to);
            var entries  = await _entryRepo.GetByUserIdAsync(userId, null, fromDate, toDate);

            // Sadece tamamlanmış kayıtlar özete dahil edilir
            var completed = entries.Where(e => e.Duration.HasValue).ToList();

            var daily = completed
                .GroupBy(e => e.StartTime.Date)
                .Select(g => new DailySummary
                {
                    Date         = g.Key.ToString("yyyy-MM-dd"),
                    TotalSeconds = g.Sum(e => e.Duration!.Value),
                })
                .OrderBy(d => d.Date)
                .ToList();

            return new TimeSummaryResponse
            {
                TotalSeconds = completed.Sum(e => e.Duration!.Value),
                Daily        = daily,
            };
        }

        private static DateTime? ParseDateTime(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return DateTime.TryParse(value, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt)
                ? DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                : null;
        }

        private static TimeEntryResponse MapToResponse(TimeEntry e) => new()
        {
            Id            = e.Id,
            ProjectTaskId = e.ProjectTaskId,
            TaskTitle     = e.ProjectTask?.Title ?? string.Empty,
            ProjectId     = e.ProjectTask?.ProjectId ?? Guid.Empty,
            ProjectName   = e.ProjectTask?.Project?.Name ?? string.Empty,
            StartTime     = e.StartTime,
            EndTime       = e.EndTime,
            Duration      = e.Duration,
            Description   = e.Description,
            IsRunning     = e.EndTime == null,
            CreatedAt     = e.CreatedAt,
        };
    }

    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _repo;
        private readonly ICommentService    _commentService;
        private readonly ApplicationDbContext _context;

        public InvoiceService(IInvoiceRepository repo, ICommentService commentService, ApplicationDbContext context)
        {
            _repo           = repo;
            _commentService = commentService;
            _context        = context;
        }

        public async Task<IEnumerable<InvoiceResponse>> GetInvoicesAsync(Guid userId, string? status = null)
        {
            var invoices = await _repo.GetByUserIdAsync(userId, status);
            return invoices.Select(MapToResponse);
        }

        public async Task<InvoiceResponse?> GetByIdAsync(Guid id, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(id);
            if (invoice == null || invoice.UserId != userId) return null;
            return MapToResponse(invoice);
        }

        public async Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest req, Guid userId)
        {
            var year = DateTime.UtcNow.Year;
            var seq  = await _repo.GetLastInvoiceSequenceAsync(userId, year) + 1;
            var num  = $"INV-{year}-{seq:D4}";

            var invoice = new Invoice
            {
                UserId        = userId,
                CustomerId    = req.CustomerId,
                InvoiceNumber = num,
                IssueDate     = ParseDate(req.IssueDate) ?? DateTime.UtcNow.Date,
                DueDate       = ParseDate(req.DueDate) ?? DateTime.UtcNow.AddDays(30).Date,
                Status        = InvoiceStatus.Draft,
            };

            await _repo.AddAsync(invoice);
            await _repo.SaveChangesAsync();

            foreach (var item in req.Items)
            {
                var invItem = new InvoiceItem
                {
                    InvoiceId   = invoice.Id,
                    Description = item.Description,
                    Quantity    = item.Quantity,
                    UnitPrice   = item.UnitPrice,
                    Amount      = Math.Round(item.Quantity * item.UnitPrice, 2),
                };
                _context.InvoiceItems.Add(invItem);
            }

            invoice.TotalAmount = req.Items.Sum(i => Math.Round(i.Quantity * i.UnitPrice, 2));
            _repo.Update(invoice);
            await _context.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(invoice.Id) ?? invoice);
        }

        public async Task<InvoiceResponse> UpdateAsync(Guid id, UpdateInvoiceRequest req, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(id)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");
            if (invoice.UserId != userId) throw new UnauthorizedAccessException();

            invoice.CustomerId = req.CustomerId;
            invoice.IssueDate  = ParseDate(req.IssueDate) ?? invoice.IssueDate;
            invoice.DueDate    = ParseDate(req.DueDate) ?? invoice.DueDate;
            invoice.Status     = (InvoiceStatus)req.Status;
            invoice.UpdatedAt  = DateTime.UtcNow;
            _repo.Update(invoice);
            await _repo.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(id) ?? invoice);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(id)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");
            if (invoice.UserId != userId) throw new UnauthorizedAccessException();
            _repo.Remove(invoice);
            await _repo.SaveChangesAsync();
        }

        public async Task<InvoiceResponse> AddItemAsync(Guid invoiceId, InvoiceItemRequest req, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(invoiceId)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");
            if (invoice.UserId != userId) throw new UnauthorizedAccessException();

            var item = new InvoiceItem
            {
                InvoiceId   = invoiceId,
                Description = req.Description,
                Quantity    = req.Quantity,
                UnitPrice   = req.UnitPrice,
                Amount      = Math.Round(req.Quantity * req.UnitPrice, 2),
            };
            _context.InvoiceItems.Add(item);
            invoice.TotalAmount = invoice.Items.Sum(i => i.Amount) + item.Amount;
            invoice.UpdatedAt   = DateTime.UtcNow;
            _repo.Update(invoice);
            await _context.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(invoiceId) ?? invoice);
        }

        public async Task<InvoiceResponse> RemoveItemAsync(Guid invoiceId, Guid itemId, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(invoiceId)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");
            if (invoice.UserId != userId) throw new UnauthorizedAccessException();

            var item = invoice.Items.FirstOrDefault(i => i.Id == itemId)
                ?? throw new KeyNotFoundException("Fatura kalemi bulunamadı.");

            _context.InvoiceItems.Remove(item);
            invoice.TotalAmount = invoice.Items.Where(i => i.Id != itemId).Sum(i => i.Amount);
            invoice.UpdatedAt   = DateTime.UtcNow;
            _repo.Update(invoice);
            await _context.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(invoiceId) ?? invoice);
        }

        public async Task<InvoiceResponse> AddPaymentAsync(Guid invoiceId, AddPaymentRequest req, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(invoiceId)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");
            if (invoice.UserId != userId) throw new UnauthorizedAccessException();

            var payment = new Payment
            {
                InvoiceId   = invoiceId,
                Amount      = req.Amount,
                PaymentDate = ParseDate(req.PaymentDate) ?? DateTime.UtcNow.Date,
                Method      = (PaymentMethod)req.Method,
                Notes       = req.Notes,
            };
            _context.Payments.Add(payment);
            invoice.UpdatedAt = DateTime.UtcNow;
            _repo.Update(invoice);
            await _context.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(invoiceId) ?? invoice);
        }

        public async Task<InvoiceResponse> SendInvoiceAsync(Guid invoiceId, Guid userId)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(invoiceId)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");
            if (invoice.UserId != userId) throw new UnauthorizedAccessException();
            if (invoice.Status != InvoiceStatus.Draft)
                throw new ArgumentException("Yalnızca taslak faturalar gönderilebilir.");

            invoice.Status    = InvoiceStatus.Sent;
            invoice.UpdatedAt = DateTime.UtcNow;
            _repo.Update(invoice);
            await _repo.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(invoiceId) ?? invoice);
        }

        public async Task<InvoiceResponse> ClientActionAsync(
            Guid invoiceId, ClientActionRequest req, Guid requestingUserId, string requestingUserRole)
        {
            var invoice = await _repo.GetByIdWithDetailsAsync(invoiceId)
                ?? throw new KeyNotFoundException("Fatura bulunamadı.");

            var action = req.Action.ToLowerInvariant();

            if (requestingUserRole == "Client")
            {
                if (action == "approve")
                {
                    invoice.Status = InvoiceStatus.ClientApproved;
                }
                else if (action == "request-revision")
                {
                    invoice.Status = InvoiceStatus.RevisionRequested;
                    if (!string.IsNullOrWhiteSpace(req.Note))
                    {
                        await _commentService.CreateAsync(new CreateCommentRequest
                        {
                            InvoiceId = invoiceId,
                            Content   = $"[Revizyon Talebi]: {req.Note}",
                        }, requestingUserId);
                    }
                }
                else
                {
                    throw new UnauthorizedAccessException("Geçersiz işlem.");
                }
            }
            else if (requestingUserRole == "Freelancer")
            {
                if (action == "mark-paid")
                {
                    if (invoice.UserId != requestingUserId) throw new UnauthorizedAccessException();
                    invoice.Status = InvoiceStatus.Paid;
                }
                else
                {
                    throw new UnauthorizedAccessException("Geçersiz işlem.");
                }
            }
            else
            {
                throw new UnauthorizedAccessException();
            }

            invoice.UpdatedAt = DateTime.UtcNow;
            _repo.Update(invoice);
            await _repo.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(invoiceId) ?? invoice);
        }

        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            return DateTime.TryParse(value, out var dt)
                ? DateTime.SpecifyKind(dt.Date, DateTimeKind.Utc)
                : null;
        }

        private static InvoiceResponse MapToResponse(Invoice inv) => new()
        {
            Id            = inv.Id,
            CustomerId    = inv.CustomerId,
            CustomerName  = inv.Customer?.CompanyName ?? string.Empty,
            InvoiceNumber = inv.InvoiceNumber,
            IssueDate     = inv.IssueDate,
            DueDate       = inv.DueDate,
            TotalAmount   = inv.TotalAmount,
            Status        = inv.Status.ToString(),
            StatusValue   = (int)inv.Status,
            CreatedAt     = inv.CreatedAt,
            Items = inv.Items.Select(i => new InvoiceItemResponse
            {
                Id          = i.Id,
                Description = i.Description,
                Quantity    = i.Quantity,
                UnitPrice   = i.UnitPrice,
                Amount      = i.Amount,
            }).ToList(),
            Payments = inv.Payments.Select(p => new PaymentResponse
            {
                Id          = p.Id,
                Amount      = p.Amount,
                PaymentDate = p.PaymentDate,
                Method      = p.Method.ToString(),
                Notes       = p.Notes,
                CreatedAt   = p.CreatedAt,
            }).ToList(),
        };
    }

    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _repo;

        public CommentService(ICommentRepository repo) => _repo = repo;

        public async Task<IEnumerable<CommentResponse>> GetByTaskAsync(Guid taskId, Guid requestingUserId)
        {
            var comments = await _repo.GetByProjectTaskIdAsync(taskId);
            return comments.Select(MapToResponse);
        }

        public async Task<IEnumerable<CommentResponse>> GetByInvoiceAsync(Guid invoiceId, Guid requestingUserId)
        {
            var comments = await _repo.GetByInvoiceIdAsync(invoiceId);
            return comments.Select(MapToResponse);
        }

        public async Task<CommentResponse> CreateAsync(CreateCommentRequest req, Guid userId)
        {
            if (req.ProjectTaskId == null && req.InvoiceId == null)
                throw new ArgumentException("ProjectTaskId veya InvoiceId dolu olmalıdır.");
            if (req.ProjectTaskId != null && req.InvoiceId != null)
                throw new ArgumentException("Aynı anda hem görev hem fatura yorumu oluşturulamaz.");

            var comment = new Comment
            {
                UserId        = userId,
                ProjectTaskId = req.ProjectTaskId,
                InvoiceId     = req.InvoiceId,
                Content       = req.Content,
            };
            await _repo.AddAsync(comment);
            await _repo.SaveChangesAsync();

            var created = await _repo.GetByIdWithUserAsync(comment.Id) ?? comment;
            return MapToResponse(created);
        }

        public async Task<CommentResponse> UpdateAsync(Guid id, UpdateCommentRequest req, Guid userId)
        {
            var comment = await _repo.GetByIdWithUserAsync(id)
                ?? throw new KeyNotFoundException("Yorum bulunamadı.");
            if (comment.UserId != userId) throw new UnauthorizedAccessException("Yalnızca kendi yorumunuzu düzenleyebilirsiniz.");

            comment.Content   = req.Content;
            comment.UpdatedAt = DateTime.UtcNow;
            _repo.Update(comment);
            await _repo.SaveChangesAsync();
            return MapToResponse(comment);
        }

        public async Task DeleteAsync(Guid id, Guid userId)
        {
            var comment = await _repo.GetByIdWithUserAsync(id)
                ?? throw new KeyNotFoundException("Yorum bulunamadı.");
            if (comment.UserId != userId) throw new UnauthorizedAccessException("Yalnızca kendi yorumunuzu silebilirsiniz.");
            _repo.Remove(comment);
            await _repo.SaveChangesAsync();
        }

        private static CommentResponse MapToResponse(Comment c) => new()
        {
            Id             = c.Id,
            Content        = c.Content,
            UserId         = c.UserId,
            AuthorFullName = c.User != null ? $"{c.User.FirstName} {c.User.LastName}" : string.Empty,
            AuthorRole     = c.User?.Role.ToString() ?? string.Empty,
            ProjectTaskId  = c.ProjectTaskId,
            InvoiceId      = c.InvoiceId,
            CreatedAt      = c.CreatedAt,
            UpdatedAt      = c.UpdatedAt,
        };
    }

    public class ClientRequestService : IClientRequestService
    {
        private readonly IClientRequestRepository _repo;
        private readonly IProjectTaskRepository   _taskRepo;
        private readonly IAIService               _ai;
        private readonly ApplicationDbContext     _context;

        public ClientRequestService(
            IClientRequestRepository repo,
            IProjectTaskRepository taskRepo,
            IAIService ai,
            ApplicationDbContext context)
        {
            _repo     = repo;
            _taskRepo = taskRepo;
            _ai       = ai;
            _context  = context;
        }

        public async Task<IEnumerable<ClientRequestResponse>> GetByProjectAsync(Guid projectId, Guid userId, string? status = null)
        {
            var requests = await _repo.GetByProjectIdAsync(projectId, status);
            return requests.Select(MapToResponse);
        }

        public async Task<ClientRequestResponse> CreateAsync(CreateClientRequestRequest req, Guid userId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId);

            var summarized = await _ai.SummarizeClientRequestAsync(req.Message);

            var request = new ClientRequest
            {
                ProjectId       = req.ProjectId,
                CustomerId      = customer?.Id ?? Guid.Empty,
                OriginalMessage = req.Message,
                SummarizedTodo  = summarized,
                Status          = ClientRequestStatus.Pending,
                RequestedAt     = DateTime.UtcNow,
            };
            await _repo.AddAsync(request);
            await _repo.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(request.Id) ?? request);
        }

        public async Task<ClientRequestResponse> ApproveAsync(Guid requestId, List<TagRequest>? tags, Guid freelancerId)
        {
            var request = await _repo.GetByIdWithDetailsAsync(requestId)
                ?? throw new KeyNotFoundException("İstek bulunamadı.");

            var task = new ProjectTask
            {
                ProjectId   = request.ProjectId,
                Title       = request.SummarizedTodo,
                Description = request.OriginalMessage[..Math.Min(500, request.OriginalMessage.Length)],
                Status      = ProjectTaskStatus.Todo,
                Priority    = ProjectTaskPriority.Medium,
                Order       = 0,
            };

            await _taskRepo.AddAsync(task);
            await _taskRepo.SaveChangesAsync();

            // "müşteri-isteği" etiketi + freelancer'ın eklediği etiketler
            var allTags = new List<TagRequest> { new() { Label = "müşteri-isteği", Color = "#6366f1" } };
            if (tags != null) allTags.AddRange(tags);

            for (int i = 0; i < allTags.Count; i++)
            {
                _context.ProjectTaskTags.Add(new ProjectTaskTag
                {
                    ProjectTaskId = task.Id,
                    Label         = allTags[i].Label,
                    Color         = allTags[i].Color,
                    Order         = i,
                });
            }

            request.Status         = ClientRequestStatus.Approved;
            request.ApprovedTaskId = task.Id;
            request.ReviewedAt     = DateTime.UtcNow;
            request.UpdatedAt      = DateTime.UtcNow;
            _repo.Update(request);
            await _context.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(requestId) ?? request);
        }

        public async Task<ClientRequestResponse> RejectAsync(Guid requestId, Guid freelancerId)
        {
            var request = await _repo.GetByIdWithDetailsAsync(requestId)
                ?? throw new KeyNotFoundException("İstek bulunamadı.");

            request.Status     = ClientRequestStatus.Rejected;
            request.ReviewedAt = DateTime.UtcNow;
            request.UpdatedAt  = DateTime.UtcNow;
            _repo.Update(request);
            await _repo.SaveChangesAsync();

            return MapToResponse(await _repo.GetByIdWithDetailsAsync(requestId) ?? request);
        }

        private static ClientRequestResponse MapToResponse(ClientRequest r) => new()
        {
            Id              = r.Id,
            ProjectId       = r.ProjectId,
            ProjectName     = r.Project?.Name ?? string.Empty,
            CustomerId      = r.CustomerId,
            CustomerName    = r.Customer?.CompanyName ?? string.Empty,
            OriginalMessage = r.OriginalMessage,
            SummarizedTodo  = r.SummarizedTodo,
            Status          = r.Status.ToString(),
            StatusValue     = (int)r.Status,
            ApprovedTaskId  = r.ApprovedTaskId,
            RequestedAt     = r.RequestedAt,
            ReviewedAt      = r.ReviewedAt,
        };
    }
}
