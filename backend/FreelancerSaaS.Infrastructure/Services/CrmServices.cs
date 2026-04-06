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
            return project.Milestones.OrderBy(m => m.Order).Select(MapMilestone);
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
                // "YYYY-MM-DD" string → UTC DateTime?
                DueDate     = ParseDate(req.DueDate),
                Order       = req.Order,
            };
            await _context.Milestones.AddAsync(milestone);
            await _context.SaveChangesAsync();
            return MapMilestone(milestone);
        }

        public async Task<MilestoneResponse> ToggleMilestoneAsync(Guid milestoneId, Guid userId)
        {
            var milestone = await _context.Milestones
                .Include(m => m.Project).ThenInclude(p => p.Customer)
                .FirstOrDefaultAsync(m => m.Id == milestoneId)
                ?? throw new KeyNotFoundException("Milestone bulunamadı.");
            if (milestone.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            milestone.IsCompleted = !milestone.IsCompleted;
            await _context.SaveChangesAsync();
            return MapMilestone(milestone);
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
            CompletedMilestoneCount = p.Milestones?.Count(m => m.IsCompleted) ?? 0,
        };

        private static MilestoneResponse MapMilestone(Milestone m) => new()
        {
            Id          = m.Id,
            Title       = m.Title,
            Description = m.Description,
            DueDate     = m.DueDate,
            IsCompleted = m.IsCompleted,
            Order       = m.Order,
        };
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
                Title       = req.Title,
                Description = req.Description,
                Status      = (ProjectTaskStatus)req.Status,
                Priority    = (ProjectTaskPriority)req.Priority,
                DueDate     = ParseDate(req.DueDate),
                Order       = req.Order,
            };
            await _taskRepo.AddAsync(task);
            await _taskRepo.SaveChangesAsync();

            task.Project = project;
            return MapToResponse(task);
        }

        public async Task<ProjectTaskResponse> UpdateTaskAsync(Guid id, UpdateProjectTaskRequest req, Guid userId)
        {
            var task = await _taskRepo.GetByIdWithProjectAsync(id)
                ?? throw new KeyNotFoundException("Görev bulunamadı.");
            if (task.Project.Customer.UserId != userId) throw new UnauthorizedAccessException();

            task.Title       = req.Title;
            task.Description = req.Description;
            task.Status      = (ProjectTaskStatus)req.Status;
            task.Priority    = (ProjectTaskPriority)req.Priority;
            task.DueDate     = ParseDate(req.DueDate);
            task.Order       = req.Order;
            task.UpdatedAt   = DateTime.UtcNow;

            _taskRepo.Update(task);
            await _taskRepo.SaveChangesAsync();
            return MapToResponse(task);
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
            Title         = t.Title,
            Description   = t.Description,
            Status        = t.Status.ToString(),
            StatusValue   = (int)t.Status,
            Priority      = t.Priority.ToString(),
            PriorityValue = (int)t.Priority,
            DueDate       = t.DueDate,
            Order         = t.Order,
            CreatedAt     = t.CreatedAt,
        };
    }
}
