namespace FreelancerSaaS.Core.Entities
{
    public enum ProjectTaskStatus
    {
        Todo       = 1,
        InProgress = 2,
        Review     = 3,
        Done       = 4
    }

    public enum ProjectTaskPriority
    {
        Low    = 1,
        Medium = 2,
        High   = 3,
        Urgent = 4
    }

    public class ProjectTask : BaseEntity
    {
        public Guid ProjectId { get; set; }                              // FK → Project
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ProjectTaskStatus Status { get; set; } = ProjectTaskStatus.Todo;
        public ProjectTaskPriority Priority { get; set; } = ProjectTaskPriority.Medium;
        public DateTime? DueDate { get; set; }
        public int Order { get; set; }

        // Navigation
        public Project Project { get; set; } = null!;
    }
}
