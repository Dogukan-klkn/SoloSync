namespace FreelancerSaaS.Core.Entities
{
    public class TimeEntry : BaseEntity
    {
        public Guid ProjectTaskId { get; set; }   // FK → ProjectTask
        public Guid UserId { get; set; }           // FK → User (sahip kontrolü)
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        /// <summary>Saniye cinsinden toplam süre. EndTime set edilince hesaplanır.</summary>
        public int? Duration { get; set; }
        public string? Description { get; set; }

        // Navigation
        public ProjectTask ProjectTask { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
