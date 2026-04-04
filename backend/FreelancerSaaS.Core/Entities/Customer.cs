namespace FreelancerSaaS.Core.Entities
{
    public class Customer : BaseEntity
    {
        public Guid UserId { get; set; }                        // Freelancer'ın Id'si (FK → User)
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? TaxNumber { get; set; }
        public string? BillingAddress { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation
        public User User { get; set; } = null!;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
