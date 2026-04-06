using FreelancerSaaS.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FreelancerSaaS.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User>        Users        => Set<User>();
        public DbSet<Customer>    Customers    => Set<Customer>();
        public DbSet<Project>     Projects     => Set<Project>();
        public DbSet<Milestone>   Milestones   => Set<Milestone>();
        public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ─── Global Soft Delete Filter ────────────────────────
            // BaseEntity'den türeyen tüm entity'lerde IsDeleted == false koşulunu uygula.
            // Silinen kayıtlar otomatik olarak sorgulardan hariç tutulur.
            modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Customer>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Project>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Milestone>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ProjectTask>().HasQueryFilter(e => !e.IsDeleted);

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
