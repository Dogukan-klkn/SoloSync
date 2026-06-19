using FreelancerSaaS.Core.Entities;
using FreelancerSaaS.Core.Interfaces;
using FreelancerSaaS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.Infrastructure.Repositories
{
    public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
    {
        public CustomerRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Customer>> GetByFreelancerIdAsync(Guid freelancerId) =>
            await _context.FreelancerCustomers
                .Include(fc => fc.Customer).ThenInclude(c => c.Projects)
                .Where(fc => fc.FreelancerId == freelancerId)
                .Select(fc => fc.Customer)
                .OrderBy(c => c.CompanyName)
                .ToListAsync();

        public async Task<Customer?> GetByIdWithProjectsAsync(Guid id) =>
            await _context.Customers
                .Include(c => c.Projects)
                .FirstOrDefaultAsync(c => c.Id == id);

        public async Task<Customer?> GetByEmailAsync(string email) =>
            await _context.Customers
                .Include(c => c.FreelancerCustomers)
                .FirstOrDefaultAsync(c => c.Email == email);

        public async Task<bool> IsLinkedToFreelancerAsync(Guid customerId, Guid freelancerId) =>
            await _context.FreelancerCustomers
                .AnyAsync(fc => fc.CustomerId == customerId && fc.FreelancerId == freelancerId);
    }

    public class ProjectRepository : GenericRepository<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Project>> GetByCustomerIdAsync(Guid customerId) =>
            await _context.Projects
                .Include(p => p.Customer)
                .Include(p => p.Milestones)
                .Include(p => p.Tasks)
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

        public async Task<Project?> GetByIdWithMilestonesAsync(Guid id) =>
            await _context.Projects
                .Include(p => p.Customer).ThenInclude(c => c.FreelancerCustomers)
                .Include(p => p.Milestones.OrderBy(m => m.Order))
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IEnumerable<Project>> GetProjectsByUserIdAsync(Guid userId) =>
            await _context.Projects
                .Include(p => p.Customer).ThenInclude(c => c.FreelancerCustomers)
                .Include(p => p.Milestones)
                .Include(p => p.Tasks)
                .Where(p => p.Customer.FreelancerCustomers.Any(fc => fc.FreelancerId == userId))
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<ProjectTask>> GetAllTasksByUserIdAsync(Guid userId) =>
            await _context.ProjectTasks
                .Include(t => t.Project).ThenInclude(p => p.Customer).ThenInclude(c => c.FreelancerCustomers)
                .Include(t => t.Tags)
                .Where(t => t.Project.Customer.FreelancerCustomers.Any(fc => fc.FreelancerId == userId)
                         && t.Project.Status != ProjectStatus.Completed)
                .OrderBy(t => t.Status)
                .ThenByDescending(t => t.CreatedAt)
                .Take(30)
                .ToListAsync();
    }

    public class ProjectTaskRepository : GenericRepository<ProjectTask>, IProjectTaskRepository
    {
        public ProjectTaskRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<ProjectTask>> GetByProjectIdAsync(Guid projectId) =>
            await _context.ProjectTasks
                .Include(t => t.Project).ThenInclude(p => p.Customer).ThenInclude(c => c.FreelancerCustomers)
                .Include(t => t.Tags.OrderBy(tag => tag.Order))
                .Where(t => t.ProjectId == projectId)
                .OrderBy(t => t.Status)
                .ThenBy(t => t.Order)
                .ToListAsync();

        public async Task<ProjectTask?> GetByIdWithProjectAsync(Guid id) =>
            await _context.ProjectTasks
                .Include(t => t.Project).ThenInclude(p => p.Customer).ThenInclude(c => c.FreelancerCustomers)
                .Include(t => t.Tags.OrderBy(tag => tag.Order))
                .FirstOrDefaultAsync(t => t.Id == id);

        public async Task<ProjectTask?> GetByIdWithTagsAsync(Guid id) =>
            await _context.ProjectTasks
                .Include(t => t.Tags.OrderBy(tag => tag.Order))
                .FirstOrDefaultAsync(t => t.Id == id);
    }

    public class TimeEntryRepository : GenericRepository<TimeEntry>, ITimeEntryRepository
    {
        public TimeEntryRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<TimeEntry>> GetByUserIdAsync(
            Guid userId,
            Guid? projectTaskId = null,
            DateTime? from = null,
            DateTime? to = null)
        {
            var query = _context.TimeEntries
                .Include(e => e.ProjectTask)
                    .ThenInclude(t => t.Project)
                .Where(e => e.UserId == userId);

            if (projectTaskId.HasValue)
                query = query.Where(e => e.ProjectTaskId == projectTaskId.Value);

            if (from.HasValue)
                query = query.Where(e => e.StartTime >= from.Value);

            if (to.HasValue)
                query = query.Where(e => e.StartTime < to.Value);

            return await query
                .OrderByDescending(e => e.StartTime)
                .ToListAsync();
        }

        public async Task<TimeEntry?> GetRunningEntryAsync(Guid userId) =>
            await _context.TimeEntries
                .Include(e => e.ProjectTask)
                    .ThenInclude(t => t.Project)
                .FirstOrDefaultAsync(e => e.UserId == userId && e.EndTime == null);

        public async Task<TimeEntry?> GetByIdWithTaskAsync(Guid id) =>
            await _context.TimeEntries
                .Include(e => e.ProjectTask)
                    .ThenInclude(t => t.Project)
                .FirstOrDefaultAsync(e => e.Id == id);
    }

    public class InvoiceRepository : GenericRepository<Invoice>, IInvoiceRepository
    {
        public InvoiceRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId, string? status = null)
        {
            var query = _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .Where(i => i.UserId == userId);

            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<InvoiceStatus>(status, true, out var s))
                query = query.Where(i => i.Status == s);

            return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        }

        public async Task<Invoice?> GetByIdWithDetailsAsync(Guid id) =>
            await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .Include(i => i.Comments).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(i => i.Id == id);

        public async Task<int> GetLastInvoiceSequenceAsync(Guid userId, int year)
        {
            var prefix = $"INV-{year}-";
            var last = await _context.Invoices
                .Where(i => i.UserId == userId && i.InvoiceNumber.StartsWith(prefix))
                .OrderByDescending(i => i.InvoiceNumber)
                .Select(i => i.InvoiceNumber)
                .FirstOrDefaultAsync();

            if (last == null) return 0;
            var seq = last[prefix.Length..];
            return int.TryParse(seq, out var n) ? n : 0;
        }
    }

    public class CommentRepository : GenericRepository<Comment>, ICommentRepository
    {
        public CommentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Comment>> GetByProjectTaskIdAsync(Guid taskId) =>
            await _context.Comments
                .Include(c => c.User)
                .Where(c => c.ProjectTaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<Comment>> GetByInvoiceIdAsync(Guid invoiceId) =>
            await _context.Comments
                .Include(c => c.User)
                .Where(c => c.InvoiceId == invoiceId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

        public async Task<Comment?> GetByIdWithUserAsync(Guid id) =>
            await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id);
    }

    public class ClientRequestRepository : GenericRepository<ClientRequest>, IClientRequestRepository
    {
        public ClientRequestRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<ClientRequest>> GetByProjectIdAsync(Guid projectId, string? status = null)
        {
            var query = _context.ClientRequests
                .Include(r => r.Project)
                .Include(r => r.Customer)
                .Where(r => r.ProjectId == projectId);

            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<ClientRequestStatus>(status, true, out var s))
                query = query.Where(r => r.Status == s);

            return await query.OrderByDescending(r => r.RequestedAt).ToListAsync();
        }

        public async Task<IEnumerable<ClientRequest>> GetAllByFreelancerIdAsync(Guid freelancerId, string? status = null)
        {
            var query = _context.ClientRequests
                .Include(r => r.Project).ThenInclude(p => p.Customer).ThenInclude(c => c.FreelancerCustomers)
                .Include(r => r.Customer)
                .Where(r => r.Project.Customer.FreelancerCustomers.Any(fc => fc.FreelancerId == freelancerId));

            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<ClientRequestStatus>(status, true, out var s))
                query = query.Where(r => r.Status == s);

            return await query.OrderByDescending(r => r.RequestedAt).ToListAsync();
        }

        public async Task<IEnumerable<ClientRequest>> GetPendingByProjectIdAsync(Guid projectId) =>
            await _context.ClientRequests
                .Include(r => r.Project)
                .Include(r => r.Customer)
                .Where(r => r.ProjectId == projectId && r.Status == ClientRequestStatus.Pending)
                .OrderByDescending(r => r.RequestedAt)
                .ToListAsync();

        public async Task<ClientRequest?> GetByIdWithDetailsAsync(Guid id) =>
            await _context.ClientRequests
                .Include(r => r.Project)
                .Include(r => r.Customer)
                .FirstOrDefaultAsync(r => r.Id == id);
    }
}
