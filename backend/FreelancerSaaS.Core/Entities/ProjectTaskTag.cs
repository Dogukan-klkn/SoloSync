namespace FreelancerSaaS.Core.Entities
{
    public class ProjectTaskTag : BaseEntity
    {
        public Guid   ProjectTaskId { get; set; }
        public string Label         { get; set; } = string.Empty;
        public string Color         { get; set; } = string.Empty;
        public int    Order         { get; set; }

        // Navigation
        public ProjectTask ProjectTask { get; set; } = null!;
    }
}
