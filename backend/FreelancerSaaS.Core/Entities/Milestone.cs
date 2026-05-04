namespace FreelancerSaaS.Core.Entities
{
    public class Milestone : BaseEntity
    {
        public Guid ProjectId { get; set; }                     // FK → Project
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; } = false;
        public int Order { get; set; }

        // Navigation
        public Project Project { get; set; } = null!;
        public ICollection<ProjectTask> Tasks { get; set; } = [];
    }
}
