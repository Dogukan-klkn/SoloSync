using FreelancerSaaS.Core.Entities;
using FreelancerSaaS.Core.Interfaces;
using FreelancerSaaS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.Infrastructure.Repositories
{
    public class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
    {
        public CustomerRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Customer>> GetByUserIdAsync(Guid userId) =>
            await _context.Customers
                .Include(c => c.Projects)
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.CompanyName)
                .ToListAsync();

        public async Task<Customer?> GetByIdWithProjectsAsync(Guid id) =>
            await _context.Customers
                .Include(c => c.Projects)
                .FirstOrDefaultAsync(c => c.Id == id);
    }

    public class ProjectRepository : GenericRepository<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Project>> GetByCustomerIdAsync(Guid customerId) =>
            await _context.Projects
                .Include(p => p.Customer)
                .Include(p => p.Milestones)
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

        public async Task<Project?> GetByIdWithMilestonesAsync(Guid id) =>
            await _context.Projects
                .Include(p => p.Customer)
                .Include(p => p.Milestones.OrderBy(m => m.Order))
                .FirstOrDefaultAsync(p => p.Id == id);

        public async Task<IEnumerable<Project>> GetProjectsByUserIdAsync(Guid userId) =>
            await _context.Projects
                .Include(p => p.Customer)
                .Include(p => p.Milestones)
                .Where(p => p.Customer.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
    }
}
