using FreelancerSaaS.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User>      Users      => Set<User>();
        public DbSet<Customer>  Customers  => Set<Customer>();
        public DbSet<Project>   Projects   => Set<Project>();
        public DbSet<Milestone> Milestones => Set<Milestone>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ─── User ────────────────────────────────────────────
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(u => u.Id);
                e.HasIndex(u => u.Email).IsUnique();
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

                // User → Customer (One-to-Many, Restrict on delete)
                e.HasOne(c => c.User)
                 .WithMany()
                 .HasForeignKey(c => c.UserId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ─── Project ──────────────────────────────────────────
            modelBuilder.Entity<Project>(e =>
            {
                e.HasKey(p => p.Id);
                e.Property(p => p.Name).IsRequired().HasMaxLength(100);
                e.Property(p => p.Description).HasMaxLength(500);
                e.Property(p => p.Budget).HasColumnType("decimal(18,2)");
                e.Property(p => p.Status).HasConversion<string>();

                // Customer → Project (One-to-Many, Cascade)
                e.HasOne(p => p.Customer)
                 .WithMany(c => c.Projects)
                 .HasForeignKey(p => p.CustomerId)
                 .OnDelete(DeleteBehavior.Cascade);
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
        }
    }
}
