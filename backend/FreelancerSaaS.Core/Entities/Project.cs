namespace FreelancerSaaS.Core.Entities
{
    public enum ProjectStatus
    {
        Pending    = 1,
        InProgress = 2,
        InRevision = 3,
        Completed  = 4
    }

    public class Project : BaseEntity
    {
        public Guid CustomerId { get; set; }                     // FK → Customer
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Pending;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Budget { get; set; }

        // Navigation
        public Customer Customer { get; set; } = null!;
        public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
    }
}
