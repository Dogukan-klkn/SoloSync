using FreelancerSaaS.Core.DTOs;

namespace FreelancerSaaS.Core.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerResponse>> GetCustomersAsync(Guid userId, string? search = null);
        Task<CustomerResponse?> GetCustomerByIdAsync(Guid id, Guid userId);
        Task<CustomerResponse> CreateCustomerAsync(CreateCustomerRequest request, Guid userId);
        Task<CustomerResponse> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request, Guid userId);
        Task DeleteCustomerAsync(Guid id, Guid userId);
    }

    public interface IProjectService
    {
        Task<IEnumerable<ProjectResponse>> GetProjectsAsync(Guid userId, Guid? customerId = null);
        Task<ProjectResponse?> GetProjectByIdAsync(Guid id, Guid userId);
        Task<ProjectResponse> CreateProjectAsync(CreateProjectRequest request, Guid userId);
        Task<ProjectResponse> UpdateProjectAsync(Guid id, UpdateProjectRequest request, Guid userId);
        Task DeleteProjectAsync(Guid id, Guid userId);
        Task<IEnumerable<MilestoneResponse>> GetMilestonesAsync(Guid projectId, Guid userId);
        Task<MilestoneResponse> AddMilestoneAsync(CreateMilestoneRequest request, Guid userId);
        Task<MilestoneResponse> ToggleMilestoneAsync(Guid milestoneId, Guid userId);
    }

    public interface IProjectTaskService
    {
        Task<IEnumerable<ProjectTaskResponse>> GetTasksByProjectAsync(Guid projectId, Guid userId);
        Task<ProjectTaskResponse?> GetTaskByIdAsync(Guid id, Guid userId);
        Task<ProjectTaskResponse> CreateTaskAsync(CreateProjectTaskRequest request, Guid userId);
        Task<ProjectTaskResponse> UpdateTaskAsync(Guid id, UpdateProjectTaskRequest request, Guid userId);
        Task DeleteTaskAsync(Guid id, Guid userId);
        Task<IEnumerable<ProjectTaskResponse>> ReorderTasksAsync(List<ReorderTaskRequest> items, Guid userId);
    }
}
