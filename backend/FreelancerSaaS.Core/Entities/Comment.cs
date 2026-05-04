namespace FreelancerSaaS.Core.Entities
{
    public class Comment : BaseEntity
    {
        public Guid   UserId        { get; set; }
        public Guid?  ProjectTaskId { get; set; }
        public Guid?  InvoiceId     { get; set; }
        public string Content       { get; set; } = string.Empty;

        // Navigation
        public User         User        { get; set; } = null!;
        public ProjectTask? ProjectTask { get; set; }
        public Invoice?     Invoice     { get; set; }
    }
}
