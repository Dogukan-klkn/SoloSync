namespace FreelancerSaaS.Core.Entities
{
    public enum InvoiceStatus
    {
        Draft             = 1,
        Sent              = 2,
        Paid              = 3,
        Overdue           = 4,
        ClientApproved    = 5,
        RevisionRequested = 6
    }

    public enum PaymentMethod
    {
        BankTransfer = 1,
        CreditCard   = 2,
        Cash         = 3,
        Other        = 4
    }

    public class Invoice : BaseEntity
    {
        public Guid   UserId        { get; set; }
        public Guid   CustomerId    { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime IssueDate   { get; set; }
        public DateTime DueDate     { get; set; }
        public decimal TotalAmount  { get; set; }
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

        // Navigation
        public User     User     { get; set; } = null!;
        public Customer Customer { get; set; } = null!;
        public ICollection<InvoiceItem> Items    { get; set; } = [];
        public ICollection<Payment>     Payments { get; set; } = [];
        public ICollection<Comment>     Comments { get; set; } = [];
    }

    public class InvoiceItem : BaseEntity
    {
        public Guid    InvoiceId   { get; set; }
        public string  Description { get; set; } = string.Empty;
        public decimal Quantity    { get; set; }
        public decimal UnitPrice   { get; set; }
        public decimal Amount      { get; set; }

        // Navigation
        public Invoice Invoice { get; set; } = null!;
    }

    public class Payment : BaseEntity
    {
        public Guid          InvoiceId   { get; set; }
        public decimal       Amount      { get; set; }
        public DateTime      PaymentDate { get; set; }
        public PaymentMethod Method      { get; set; } = PaymentMethod.BankTransfer;
        public string?       Notes       { get; set; }

        // Navigation
        public Invoice Invoice { get; set; } = null!;
    }
}
