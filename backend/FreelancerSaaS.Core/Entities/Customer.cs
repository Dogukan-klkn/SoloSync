namespace FreelancerSaaS.Core.Entities
{
    public class Customer : BaseEntity
    {
        public string CompanyName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? TaxNumber { get; set; }
        public string? BillingAddress { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid? ClientUserId { get; set; }

        public string? InvitationToken { get; set; }
        public DateTime? InvitationSentAt { get; set; }
        public bool IsInvitationAccepted { get; set; } = false;

        public User? ClientUser { get; set; }
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<FreelancerCustomer> FreelancerCustomers { get; set; } = new List<FreelancerCustomer>();
    }
}
