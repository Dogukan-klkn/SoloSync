namespace FreelancerSaaS.Core.DTOs
{
    // ─── Customer DTOs ────────────────────────────────────────
    public class CreateCustomerRequest
    {
        public string  CompanyName    { get; set; } = string.Empty;
        public string  ContactName    { get; set; } = string.Empty;
        public string  Email          { get; set; } = string.Empty;
        public string? Phone          { get; set; }
        public string? TaxNumber      { get; set; }
        public string? BillingAddress { get; set; }
        public Guid?   ClientUserId   { get; set; }
    }

    public class UpdateCustomerRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? TaxNumber { get; set; }
        public string? BillingAddress { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid? ClientUserId { get; set; }
    }

    public class CustomerResponse
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? TaxNumber { get; set; }
        public string? BillingAddress { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ProjectCount { get; set; }
        public Guid? ClientUserId { get; set; }
    }

    // Client Portal — müşterinin kendi profilini görmesi için
    public class ClientProfileResponse
    {
        public Guid CustomerId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? BillingAddress { get; set; }
        public string FreelancerName { get; set; } = string.Empty;
        public string FreelancerEmail { get; set; } = string.Empty;
    }

    public class UpdateClientProfileRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? BillingAddress { get; set; }
    }

    // ─── Project DTOs ─────────────────────────────────────────
    public class CreateProjectRequest
    {
        public Guid CustomerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; } = 1;
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? StartDate { get; set; }
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? EndDate { get; set; }
        public decimal? Budget { get; set; }
    }

    public class UpdateProjectRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; }
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? StartDate { get; set; }
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? EndDate { get; set; }
        public decimal? Budget { get; set; }
    }

    public class ProjectResponse
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public int StatusValue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Budget { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int MilestoneCount { get; set; }
        public int CompletedMilestoneCount { get; set; }
        public int TotalTaskCount { get; set; }
        public int CompletedTaskCount { get; set; }
        public int ProgressPercentage { get; set; }
        /// <summary>Yalnızca Client Portal yanıtlarında doldurulur; Freelancer sorgularında 0 döner.</summary>
        public int PendingRequestCount { get; set; }
    }

    // ─── Dashboard Task DTO ───────────────────────────────────
    public class DashboardTaskResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int StatusValue { get; set; }
        public Guid ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public Guid? MilestoneId { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    // ─── Milestone DTOs ───────────────────────────────────────
    public class CreateMilestoneRequest
    {
        public Guid ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? DueDate { get; set; }
        public int Order { get; set; }
    }

    public class MilestoneResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int Order { get; set; }
        // Dinamik hesaplanan alanlar — manuel IsCompleted kaldırıldı
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int ProgressPercentage { get; set; }
    }

    // ─── ProjectTask DTOs ──────────────────────────────────────
    public class CreateProjectTaskRequest
    {
        public Guid ProjectId { get; set; }
        public Guid? MilestoneId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; } = 1;
        public int Priority { get; set; } = 2;
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? DueDate { get; set; }
        public int Order { get; set; }
        public List<TagRequest>? Tags { get; set; }
    }

    public class UpdateProjectTaskRequest
    {
        public Guid? MilestoneId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; }
        public int Priority { get; set; }
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? DueDate { get; set; }
        public int Order { get; set; }
        public List<TagRequest>? Tags { get; set; }
    }

    public class ReorderTaskRequest
    {
        public Guid Id { get; set; }
        public int Status { get; set; }
        public int Order { get; set; }
    }

    public class ProjectTaskResponse
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public Guid? MilestoneId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public int StatusValue { get; set; }
        public string Priority { get; set; } = string.Empty;
        public int PriorityValue { get; set; }
        public DateTime? DueDate { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TagResponse> Tags { get; set; } = [];
    }

    // ─── TimeEntry DTOs ───────────────────────────────────────
    public class StartTimeEntryRequest
    {
        public Guid ProjectTaskId { get; set; }
        public string? Description { get; set; }
    }

    public class StopTimeEntryRequest
    {
        public string? Description { get; set; }
    }

    public class CreateManualTimeEntryRequest
    {
        public Guid ProjectTaskId { get; set; }
        /// <summary>ISO 8601 UTC string. Örn: "2026-04-07T09:00:00Z"</summary>
        public string StartTime { get; set; } = string.Empty;
        /// <summary>ISO 8601 UTC string. Örn: "2026-04-07T11:30:00Z"</summary>
        public string EndTime { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateTimeEntryRequest
    {
        /// <summary>ISO 8601 UTC string.</summary>
        public string StartTime { get; set; } = string.Empty;
        /// <summary>ISO 8601 UTC string.</summary>
        public string EndTime { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class TimeEntryResponse
    {
        public Guid Id { get; set; }
        public Guid ProjectTaskId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public Guid ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        /// <summary>Saniye cinsinden süre.</summary>
        public int? Duration { get; set; }
        public string? Description { get; set; }
        public bool IsRunning { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TimeSummaryResponse
    {
        public int TotalSeconds { get; set; }
        public List<DailySummary> Daily { get; set; } = [];
    }

    public class DailySummary
    {
        public string Date { get; set; } = string.Empty;   // "YYYY-MM-DD"
        public int TotalSeconds { get; set; }
    }

    // ─── Tag DTOs ─────────────────────────────────────────────
    public class TagRequest
    {
        public string Label { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    public class TagResponse
    {
        public Guid   Id    { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
    }

    // ─── Invoice DTOs ─────────────────────────────────────────
    public class CreateInvoiceRequest
    {
        public Guid   CustomerId { get; set; }
        /// <summary>ISO 8601 date string. Örn: "2026-05-01"</summary>
        public string IssueDate  { get; set; } = string.Empty;
        /// <summary>ISO 8601 date string. Örn: "2026-05-31"</summary>
        public string DueDate    { get; set; } = string.Empty;
        public List<InvoiceItemRequest> Items { get; set; } = [];
    }

    public class UpdateInvoiceRequest
    {
        public Guid   CustomerId { get; set; }
        public string IssueDate  { get; set; } = string.Empty;
        public string DueDate    { get; set; } = string.Empty;
        public int    Status     { get; set; }
    }

    public class InvoiceItemRequest
    {
        public string  Description { get; set; } = string.Empty;
        public decimal Quantity    { get; set; }
        public decimal UnitPrice   { get; set; }
    }

    public class AddPaymentRequest
    {
        public decimal Amount      { get; set; }
        /// <summary>ISO 8601 date string.</summary>
        public string  PaymentDate { get; set; } = string.Empty;
        public int     Method      { get; set; } = 1;
        public string? Notes       { get; set; }
    }

    public class ClientActionRequest
    {
        /// <summary>"approve" | "request-revision" | "mark-paid"</summary>
        public string  Action { get; set; } = string.Empty;
        public string? Note   { get; set; }
    }

    public class InvoiceItemResponse
    {
        public Guid    Id          { get; set; }
        public string  Description { get; set; } = string.Empty;
        public decimal Quantity    { get; set; }
        public decimal UnitPrice   { get; set; }
        public decimal Amount      { get; set; }
    }

    public class PaymentResponse
    {
        public Guid     Id          { get; set; }
        public decimal  Amount      { get; set; }
        public DateTime PaymentDate { get; set; }
        public string   Method      { get; set; } = string.Empty;
        public string?  Notes       { get; set; }
        public DateTime CreatedAt   { get; set; }
    }

    public class InvoiceResponse
    {
        public Guid   Id            { get; set; }
        public Guid   CustomerId    { get; set; }
        public string CustomerName  { get; set; } = string.Empty;
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime IssueDate   { get; set; }
        public DateTime DueDate     { get; set; }
        public decimal  TotalAmount { get; set; }
        public string   Status      { get; set; } = string.Empty;
        public int      StatusValue { get; set; }
        public DateTime CreatedAt   { get; set; }
        public List<InvoiceItemResponse> Items    { get; set; } = [];
        public List<PaymentResponse>     Payments { get; set; } = [];
    }

    // ─── Comment DTOs ─────────────────────────────────────────
    public class CreateCommentRequest
    {
        public Guid?  ProjectTaskId { get; set; }
        public Guid?  InvoiceId     { get; set; }
        public string Content       { get; set; } = string.Empty;
    }

    public class UpdateCommentRequest
    {
        public string Content { get; set; } = string.Empty;
    }

    public class CommentResponse
    {
        public Guid   Id             { get; set; }
        public string Content        { get; set; } = string.Empty;
        public Guid   UserId         { get; set; }
        public string AuthorFullName { get; set; } = string.Empty;
        public string AuthorRole     { get; set; } = string.Empty;
        public Guid?  ProjectTaskId  { get; set; }
        public Guid?  InvoiceId      { get; set; }
        public DateTime CreatedAt    { get; set; }
        public DateTime? UpdatedAt   { get; set; }
    }

    // ─── ClientRequest DTOs ───────────────────────────────────
    public class CreateClientRequestRequest
    {
        public Guid   ProjectId { get; set; }
        public string Message   { get; set; } = string.Empty;
    }

    public class ReviewClientRequestRequest
    {
        /// <summary>"approve" | "reject"</summary>
        public string             Action { get; set; } = string.Empty;
        public List<TagRequest>?  Tags   { get; set; }
    }

    public class ClientRequestResponse
    {
        public Guid   Id               { get; set; }
        public Guid   ProjectId        { get; set; }
        public string ProjectName      { get; set; } = string.Empty;
        public Guid   CustomerId       { get; set; }
        public string CustomerName     { get; set; } = string.Empty;
        public string OriginalMessage  { get; set; } = string.Empty;
        public string SummarizedTodo   { get; set; } = string.Empty;
        public string? SuggestedPriority { get; set; }
        public string? ClientPreview     { get; set; }
        public List<string> AiTaskItems  { get; set; } = [];
        public List<string> AiTags       { get; set; } = [];
        public string? AiProvider        { get; set; }
        public bool   IsAiPowered        { get; set; }
        public string Status           { get; set; } = string.Empty;
        public int    StatusValue      { get; set; }
        public Guid?  ApprovedTaskId   { get; set; }
        public DateTime  RequestedAt   { get; set; }
        public DateTime? ReviewedAt    { get; set; }
    }

    // ─── Pagination ───────────────────────────────────────────
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
