using FreelancerSaaS.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User>           Users           => Set<User>();
        public DbSet<Customer>       Customers       => Set<Customer>();
        public DbSet<Project>        Projects        => Set<Project>();
        public DbSet<Milestone>      Milestones      => Set<Milestone>();
        public DbSet<ProjectTask>    ProjectTasks    => Set<ProjectTask>();
        public DbSet<ProjectTaskTag> ProjectTaskTags => Set<ProjectTaskTag>();
        public DbSet<TimeEntry>      TimeEntries     => Set<TimeEntry>();
        public DbSet<Invoice>        Invoices        => Set<Invoice>();
        public DbSet<InvoiceItem>    InvoiceItems    => Set<InvoiceItem>();
        public DbSet<Payment>        Payments        => Set<Payment>();
        public DbSet<Comment>        Comments        => Set<Comment>();
        public DbSet<ClientRequest>  ClientRequests  => Set<ClientRequest>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ─── Global Soft Delete Filter ────────────────────────
            modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Customer>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Project>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Milestone>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ProjectTask>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ProjectTaskTag>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TimeEntry>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Invoice>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<InvoiceItem>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Payment>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Comment>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ClientRequest>().HasQueryFilter(e => !e.IsDeleted);

            // ─── User ────────────────────────────────────────────
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(u => u.Id);
                e.HasIndex(u => u.Email).IsUnique().HasFilter("\"IsDeleted\" = false");
                e.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
                e.Property(u => u.LastName).IsRequired().HasMaxLength(50);
                e.Property(u => u.Email).IsRequired().HasMaxLength(100);
                e.Property(u => u.PasswordHash).IsRequired();
                e.Property(u => u.ProfilePictureUrl).HasMaxLength(500);
                e.Property(u => u.Role).HasConversion<string>();
            });

            // ─── Customer ─────────────────────────────────────────
            modelBuilder.Entity<Customer>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.CompanyName).IsRequired().HasMaxLength(100);
                e.Property(c => c.ContactName).IsRequired().HasMaxLength(50);
                e.Property(c => c.Email).IsRequired().HasMaxLength(100);
                e.Property(c => c.Phone).HasMaxLength(20);
                e.Property(c => c.TaxNumber).HasMaxLength(50);
                e.Property(c => c.BillingAddress).HasMaxLength(250);

                // UserId kapsamında Email unique (soft-delete farkında)
                e.HasIndex(c => new { c.UserId, c.Email }).IsUnique()
                 .HasFilter("\"IsDeleted\" = false");

                // TaxNumber nullable olduğu için NULL olmayan + aktif kayıtlar arasında unique
                e.HasIndex(c => new { c.UserId, c.TaxNumber })
                 .IsUnique()
                 .HasFilter("\"TaxNumber\" IS NOT NULL AND \"IsDeleted\" = false");

                // User → Customer (One-to-Many, Restrict on delete)
                e.HasOne(c => c.User)
                 .WithMany()
                 .HasForeignKey(c => c.UserId)
                 .OnDelete(DeleteBehavior.Restrict);

                // ClientUser → Customer (nullable, SetNull on delete)
                e.HasOne(c => c.ClientUser)
                 .WithMany()
                 .HasForeignKey(c => c.ClientUserId)
                 .IsRequired(false)
                 .OnDelete(DeleteBehavior.SetNull);
            });

            // ─── Project ──────────────────────────────────────────
            modelBuilder.Entity<Project>(e =>
            {
                e.HasKey(p => p.Id);
                e.Property(p => p.Name).IsRequired().HasMaxLength(100);
                e.Property(p => p.Description).HasMaxLength(500);
                e.Property(p => p.Budget).HasColumnType("decimal(18,2)");
                e.Property(p => p.Status).HasConversion<string>();

                // Customer → Project (One-to-Many, Restrict — önce projeleri silin)
                e.HasOne(p => p.Customer)
                 .WithMany(c => c.Projects)
                 .HasForeignKey(p => p.CustomerId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ─── Milestone ────────────────────────────────────────
            modelBuilder.Entity<Milestone>(e =>
            {
                e.HasKey(m => m.Id);
                e.Property(m => m.Title).IsRequired().HasMaxLength(100);

                // Project → Milestone (One-to-Many, Cascade)
                e.HasOne(m => m.Project)
                 .WithMany(p => p.Milestones)
                 .HasForeignKey(m => m.ProjectId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ─── ProjectTask ─────────────────────────────────────
            modelBuilder.Entity<ProjectTask>(e =>
            {
                e.HasKey(t => t.Id);
                e.Property(t => t.Title).IsRequired().HasMaxLength(200);
                e.Property(t => t.Description).HasMaxLength(1000);
                e.Property(t => t.Status).HasConversion<string>();
                e.Property(t => t.Priority).HasConversion<string>();

                // Project → ProjectTask (One-to-Many, Cascade)
                e.HasOne(t => t.Project)
                 .WithMany(p => p.Tasks)
                 .HasForeignKey(t => t.ProjectId)
                 .OnDelete(DeleteBehavior.Cascade);

                // Milestone → ProjectTask (nullable FK, Restrict — milestone silinirse task orphan kalır)
                e.HasOne(t => t.Milestone)
                 .WithMany(m => m.Tasks)
                 .HasForeignKey(t => t.MilestoneId)
                 .IsRequired(false)
                 .OnDelete(DeleteBehavior.SetNull);
            });

            // ─── TimeEntry ────────────────────────────────────────
            modelBuilder.Entity<TimeEntry>(e =>
            {
                e.HasKey(t => t.Id);
                e.Property(t => t.Description).HasMaxLength(500);

                e.HasOne(t => t.ProjectTask)
                 .WithMany()
                 .HasForeignKey(t => t.ProjectTaskId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(t => t.User)
                 .WithMany()
                 .HasForeignKey(t => t.UserId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ─── ProjectTaskTag ───────────────────────────────────
            modelBuilder.Entity<ProjectTaskTag>(e =>
            {
                e.HasKey(t => t.Id);
                e.Property(t => t.Label).IsRequired().HasMaxLength(50);
                e.Property(t => t.Color).IsRequired().HasMaxLength(20);

                e.HasOne(t => t.ProjectTask)
                 .WithMany(p => p.Tags)
                 .HasForeignKey(t => t.ProjectTaskId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ─── Invoice ──────────────────────────────────────────
            modelBuilder.Entity<Invoice>(e =>
            {
                e.HasKey(i => i.Id);
                e.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(20);
                e.Property(i => i.TotalAmount).HasColumnType("decimal(18,2)");
                e.Property(i => i.Status).HasConversion<string>();

                e.HasOne(i => i.User)
                 .WithMany()
                 .HasForeignKey(i => i.UserId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(i => i.Customer)
                 .WithMany()
                 .HasForeignKey(i => i.CustomerId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ─── InvoiceItem ──────────────────────────────────────
            modelBuilder.Entity<InvoiceItem>(e =>
            {
                e.HasKey(i => i.Id);
                e.Property(i => i.Description).IsRequired().HasMaxLength(200);
                e.Property(i => i.Quantity).HasColumnType("decimal(18,4)");
                e.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
                e.Property(i => i.Amount).HasColumnType("decimal(18,2)");

                e.HasOne(i => i.Invoice)
                 .WithMany(inv => inv.Items)
                 .HasForeignKey(i => i.InvoiceId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ─── Payment ──────────────────────────────────────────
            modelBuilder.Entity<Payment>(e =>
            {
                e.HasKey(p => p.Id);
                e.Property(p => p.Amount).HasColumnType("decimal(18,2)");
                e.Property(p => p.Notes).HasMaxLength(500);
                e.Property(p => p.Method).HasConversion<string>();

                e.HasOne(p => p.Invoice)
                 .WithMany(i => i.Payments)
                 .HasForeignKey(p => p.InvoiceId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ─── Comment ──────────────────────────────────────────
            modelBuilder.Entity<Comment>(e =>
            {
                e.HasKey(c => c.Id);
                e.Property(c => c.Content).IsRequired().HasMaxLength(2000);

                e.HasOne(c => c.User)
                 .WithMany()
                 .HasForeignKey(c => c.UserId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(c => c.ProjectTask)
                 .WithMany()
                 .HasForeignKey(c => c.ProjectTaskId)
                 .IsRequired(false)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(c => c.Invoice)
                 .WithMany(i => i.Comments)
                 .HasForeignKey(c => c.InvoiceId)
                 .IsRequired(false)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ─── ClientRequest ────────────────────────────────────
            modelBuilder.Entity<ClientRequest>(e =>
            {
                e.HasKey(r => r.Id);
                e.Property(r => r.OriginalMessage).IsRequired().HasMaxLength(5000);
                e.Property(r => r.SummarizedTodo).IsRequired().HasMaxLength(500);
                e.Property(r => r.SuggestedPriority).HasMaxLength(20);
                e.Property(r => r.ClientPreview).HasMaxLength(500);
                e.Property(r => r.AiMetadataJson).HasMaxLength(4000);
                e.Property(r => r.Status).HasConversion<string>();

                e.HasOne(r => r.Project)
                 .WithMany()
                 .HasForeignKey(r => r.ProjectId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(r => r.Customer)
                 .WithMany()
                 .HasForeignKey(r => r.CustomerId)
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(r => r.ApprovedTask)
                 .WithMany()
                 .HasForeignKey(r => r.ApprovedTaskId)
                 .IsRequired(false)
                 .OnDelete(DeleteBehavior.SetNull);
            });
        }

        // ─── Soft Delete Override ─────────────────────────────────
        // Remove() çağrıldığında kaydı fiziksel silmek yerine IsDeleted = true yapar.
        public override int SaveChanges()
        {
            ApplySoftDelete();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplySoftDelete();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void ApplySoftDelete()
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}
