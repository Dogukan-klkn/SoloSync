namespace FreelancerSaaS.Core.Entities
{
    public class FreelancerCustomer : BaseEntity
    {
        public Guid FreelancerId { get; set; }
        public Guid CustomerId { get; set; }
        public bool IsActive { get; set; } = true;

        public User Freelancer { get; set; } = null!;
        public Customer Customer { get; set; } = null!;
    }
}
