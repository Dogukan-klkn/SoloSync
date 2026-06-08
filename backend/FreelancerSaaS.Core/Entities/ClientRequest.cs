namespace FreelancerSaaS.Core.Entities
{
    public enum ClientRequestStatus
    {
        Pending  = 1,
        Approved = 2,
        Rejected = 3
    }

    public class ClientRequest : BaseEntity
    {
        public Guid   ProjectId         { get; set; }
        public Guid   CustomerId        { get; set; }
        public string OriginalMessage   { get; set; } = string.Empty;
        public string SummarizedTodo    { get; set; } = string.Empty;
        public string? SuggestedPriority { get; set; }
        public string? ClientPreview     { get; set; }
        public string? AiMetadataJson    { get; set; }
        public ClientRequestStatus Status { get; set; } = ClientRequestStatus.Pending;
        public Guid?  ApprovedTaskId    { get; set; }
        public DateTime  RequestedAt    { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt     { get; set; }

        // Navigation
        public Project      Project     { get; set; } = null!;
        public Customer     Customer    { get; set; } = null!;
        public ProjectTask? ApprovedTask { get; set; }
    }
}
