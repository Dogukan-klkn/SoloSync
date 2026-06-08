using FreelancerSaaS.Core.DTOs;

namespace FreelancerSaaS.Core.Interfaces
{
    public interface ITimeEntryService
    {
        Task<TimeEntryResponse> StartAsync(StartTimeEntryRequest request, Guid userId);
        Task<TimeEntryResponse> StopAsync(Guid entryId, StopTimeEntryRequest request, Guid userId);
        Task<TimeEntryResponse> CreateManualAsync(CreateManualTimeEntryRequest request, Guid userId);
        Task<TimeEntryResponse> UpdateAsync(Guid id, UpdateTimeEntryRequest request, Guid userId);
        Task DeleteAsync(Guid id, Guid userId);
        Task<IEnumerable<TimeEntryResponse>> GetEntriesAsync(Guid userId, Guid? projectTaskId = null, string? from = null, string? to = null);
        Task<TimeEntryResponse?> GetRunningEntryAsync(Guid userId);
        Task<TimeSummaryResponse> GetSummaryAsync(Guid userId, string? from = null, string? to = null);
    }


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
        Task<IEnumerable<DashboardTaskResponse>> GetDashboardTasksAsync(Guid userId);
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

    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceResponse>> GetInvoicesAsync(Guid userId, string? status = null);
        Task<InvoiceResponse?> GetByIdAsync(Guid id, Guid userId);
        Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request, Guid userId);
        Task<InvoiceResponse> UpdateAsync(Guid id, UpdateInvoiceRequest request, Guid userId);
        Task DeleteAsync(Guid id, Guid userId);
        Task<InvoiceResponse> AddItemAsync(Guid invoiceId, InvoiceItemRequest request, Guid userId);
        Task<InvoiceResponse> RemoveItemAsync(Guid invoiceId, Guid itemId, Guid userId);
        Task<InvoiceResponse> AddPaymentAsync(Guid invoiceId, AddPaymentRequest request, Guid userId);
        Task<InvoiceResponse> SendInvoiceAsync(Guid invoiceId, Guid userId);
        Task<InvoiceResponse> ClientActionAsync(Guid invoiceId, ClientActionRequest request, Guid requestingUserId, string requestingUserRole);
    }

    public interface ICommentService
    {
        Task<IEnumerable<CommentResponse>> GetByTaskAsync(Guid taskId, Guid requestingUserId);
        Task<IEnumerable<CommentResponse>> GetByInvoiceAsync(Guid invoiceId, Guid requestingUserId);
        Task<CommentResponse> CreateAsync(CreateCommentRequest request, Guid userId);
        Task<CommentResponse> UpdateAsync(Guid id, UpdateCommentRequest request, Guid userId);
        Task DeleteAsync(Guid id, Guid userId);
    }

    public interface IClientRequestService
    {
        Task<IEnumerable<ClientRequestResponse>> GetByProjectAsync(Guid projectId, Guid userId, string? status = null);
        Task<IEnumerable<ClientRequestResponse>> GetAllAsync(Guid freelancerId, string? status = null);
        Task<ClientRequestResponse> CreateAsync(CreateClientRequestRequest request, Guid userId);
        Task<ClientRequestResponse> ApproveAsync(Guid requestId, List<TagRequest>? tags, Guid freelancerId);
        Task<ClientRequestResponse> RejectAsync(Guid requestId, Guid freelancerId);
    }

    // Client Portal: müşteri kendi verilerine (proje, fatura, görev, yorum) erişir
    public interface IClientPortalService
    {
        Task<ClientProfileResponse?> GetMyProfileAsync(Guid clientUserId);
        Task<ClientProfileResponse> UpdateMyProfileAsync(Guid clientUserId, UpdateClientProfileRequest request);
        Task<IEnumerable<ProjectResponse>> GetMyProjectsAsync(Guid clientUserId);
        Task<ProjectResponse?> GetMyProjectByIdAsync(Guid projectId, Guid clientUserId);
        Task<IEnumerable<MilestoneResponse>> GetMyMilestonesAsync(Guid projectId, Guid clientUserId);
        Task<IEnumerable<ProjectTaskResponse>> GetMyTasksAsync(Guid projectId, Guid clientUserId);
        Task<IEnumerable<InvoiceResponse>> GetMyInvoicesAsync(Guid clientUserId, string? status = null);
        Task<InvoiceResponse?> GetMyInvoiceByIdAsync(Guid invoiceId, Guid clientUserId);
        Task<InvoiceResponse> ClientInvoiceActionAsync(Guid invoiceId, ClientActionRequest request, Guid clientUserId);
        Task<ClientRequestResponse> SendRequestAsync(CreateClientRequestRequest request, Guid clientUserId);
        Task<ClientRequestAnalysisResult> PreviewRequestAsync(string message, Guid projectId, Guid clientUserId);
        Task<IEnumerable<ClientRequestResponse>> GetMyRequestsAsync(Guid projectId, Guid clientUserId);
    }
}
