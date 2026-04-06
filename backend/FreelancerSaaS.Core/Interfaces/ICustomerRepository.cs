using FreelancerSaaS.Core.Entities;

namespace FreelancerSaaS.Core.Interfaces
{
    public interface ICustomerRepository : IGenericRepository<Customer>
    {
        Task<IEnumerable<Customer>> GetByUserIdAsync(Guid userId);
        Task<Customer?> GetByIdWithProjectsAsync(Guid id);
    }

    public interface IProjectRepository : IGenericRepository<Project>
    {
        Task<IEnumerable<Project>> GetByCustomerIdAsync(Guid customerId);
        Task<Project?> GetByIdWithMilestonesAsync(Guid id);
        Task<IEnumerable<Project>> GetProjectsByUserIdAsync(Guid userId);
    }

    public interface IProjectTaskRepository : IGenericRepository<ProjectTask>
    {
        Task<IEnumerable<ProjectTask>> GetByProjectIdAsync(Guid projectId);
        Task<ProjectTask?> GetByIdWithProjectAsync(Guid id);
    }
}
