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
        Task<IEnumerable<ProjectTask>> GetAllTasksByUserIdAsync(Guid userId);
    }

    public interface IProjectTaskRepository : IGenericRepository<ProjectTask>
    {
        Task<IEnumerable<ProjectTask>> GetByProjectIdAsync(Guid projectId);
        Task<ProjectTask?> GetByIdWithProjectAsync(Guid id);
        Task<ProjectTask?> GetByIdWithTagsAsync(Guid id);
    }

    public interface ITimeEntryRepository : IGenericRepository<TimeEntry>
    {
        Task<IEnumerable<TimeEntry>> GetByUserIdAsync(Guid userId, Guid? projectTaskId = null, DateTime? from = null, DateTime? to = null);
        Task<TimeEntry?> GetRunningEntryAsync(Guid userId);
        Task<TimeEntry?> GetByIdWithTaskAsync(Guid id);
    }

    public interface IInvoiceRepository : IGenericRepository<Invoice>
    {
        Task<IEnumerable<Invoice>> GetByUserIdAsync(Guid userId, string? status = null);
        Task<Invoice?> GetByIdWithDetailsAsync(Guid id);
        Task<int> GetLastInvoiceSequenceAsync(Guid userId, int year);
    }

    public interface ICommentRepository : IGenericRepository<Comment>
    {
        Task<IEnumerable<Comment>> GetByProjectTaskIdAsync(Guid taskId);
        Task<IEnumerable<Comment>> GetByInvoiceIdAsync(Guid invoiceId);
        Task<Comment?> GetByIdWithUserAsync(Guid id);
    }

    public interface IClientRequestRepository : IGenericRepository<ClientRequest>
    {
        Task<IEnumerable<ClientRequest>> GetByProjectIdAsync(Guid projectId, string? status = null);
        Task<IEnumerable<ClientRequest>> GetAllByFreelancerIdAsync(Guid freelancerId, string? status = null);
        Task<IEnumerable<ClientRequest>> GetPendingByProjectIdAsync(Guid projectId);
        Task<ClientRequest?> GetByIdWithDetailsAsync(Guid id);
    }
}
