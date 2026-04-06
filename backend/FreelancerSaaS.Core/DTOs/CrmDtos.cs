namespace FreelancerSaaS.Core.DTOs
{
    // ─── Customer DTOs ────────────────────────────────────────
    public class CreateCustomerRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? TaxNumber { get; set; }
        public string? BillingAddress { get; set; }
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
        public int MilestoneCount { get; set; }
        public int CompletedMilestoneCount { get; set; }
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
        public bool IsCompleted { get; set; }
        public int Order { get; set; }
    }

    // ─── ProjectTask DTOs ──────────────────────────────────────
    public class CreateProjectTaskRequest
    {
        public Guid ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; } = 1;
        public int Priority { get; set; } = 2;
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? DueDate { get; set; }
        public int Order { get; set; }
    }

    public class UpdateProjectTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; }
        public int Priority { get; set; }
        /// <summary>Frontend'den "YYYY-MM-DD" formatında gelir.</summary>
        public string? DueDate { get; set; }
        public int Order { get; set; }
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
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public int StatusValue { get; set; }
        public string Priority { get; set; } = string.Empty;
        public int PriorityValue { get; set; }
        public DateTime? DueDate { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }
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
