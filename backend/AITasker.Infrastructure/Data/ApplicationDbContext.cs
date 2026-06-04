using AITasker.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AITasker.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<ExpertProfile> ExpertProfiles { get; set; } = null!;
    public DbSet<Skill> Skills { get; set; } = null!;
    public DbSet<Wallet> Wallets { get; set; } = null!;
    public DbSet<TransactionLog> TransactionLogs { get; set; } = null!;
    public DbSet<JobPost> JobPosts { get; set; } = null!;
    public DbSet<JobRequirement> JobRequirements { get; set; } = null!;
    public DbSet<Proposal> Proposals { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<ProjectTask> ProjectTasks { get; set; } = null!;
    public DbSet<MiniTask> MiniTasks { get; set; } = null!;
    public DbSet<Conversation> Conversations { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<AICategoryDomain> AICategoryDomains { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- User ---
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        // --- Expert Profile ---
        modelBuilder.Entity<ExpertProfile>(entity =>
        {
            entity.HasKey(ep => ep.UserId);

            entity.HasOne(ep => ep.User)
                .WithOne(u => u.ExpertProfile)
                .HasForeignKey<ExpertProfile>(ep => ep.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(ep => ep.ReputationCredit).HasColumnType("decimal(3,2)");
        });

        // --- Wallet ---
        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.HasKey(w => w.UserId);

            entity.HasOne(w => w.User)
                .WithOne(u => u.Wallet)
                .HasForeignKey<Wallet>(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(w => w.Balance).HasColumnType("decimal(18,2)");
        });

        // --- Transaction Log ---
        modelBuilder.Entity<TransactionLog>(entity =>
        {
            entity.HasKey(tl => tl.Id);

            entity.HasOne(tl => tl.Project)
                .WithMany()
                .HasForeignKey(tl => tl.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(tl => tl.SourceWallet)
                .WithMany()
                .HasForeignKey(tl => tl.SourceWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(tl => tl.DestinationWallet)
                .WithMany()
                .HasForeignKey(tl => tl.DestinationWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(tl => tl.Amount).HasColumnType("decimal(18,2)");
        });

        // --- AICategoryDomain ---
        modelBuilder.Entity<AICategoryDomain>(entity =>
        {
            entity.HasKey(ac => ac.Id);
        });

        // --- Job Post ---
        modelBuilder.Entity<JobPost>(entity =>
        {
            entity.HasKey(jp => jp.Id);

            entity.HasOne(jp => jp.Client)
                .WithMany(u => u.JobPosts)
                .HasForeignKey(jp => jp.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(jp => jp.AICategoryDomain)
                .WithMany(ac => ac.JobPosts)
                .HasForeignKey(jp => jp.AICategoryDomainId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(jp => jp.Budget).HasColumnType("decimal(18,2)");
        });

        // --- Job Requirement ---
        modelBuilder.Entity<JobRequirement>(entity =>
        {
            entity.HasKey(jr => jr.Id);

            entity.HasOne(jr => jr.JobPost)
                .WithMany(jp => jp.JobRequirements)
                .HasForeignKey(jr => jr.JobPostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // --- Proposal ---
        modelBuilder.Entity<Proposal>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.HasOne(p => p.JobPost)
                .WithMany(jp => jp.Proposals)
                .HasForeignKey(p => p.JobPostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Expert)
                .WithMany(u => u.Proposals)
                .HasForeignKey(p => p.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(p => p.BidAmount).HasColumnType("decimal(18,2)");
        });

        // --- Project ---
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.HasOne(p => p.JobPost)
                .WithMany(jp => jp.Projects)
                .HasForeignKey(p => p.JobPostId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Client)
                .WithMany(u => u.ClientProjects)
                .HasForeignKey(p => p.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Expert)
                .WithMany(u => u.ExpertProjects)
                .HasForeignKey(p => p.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(p => p.EscrowBalance).HasColumnType("decimal(18,2)");
        });

        // --- Project Task & MiniTask ---
        modelBuilder.Entity<ProjectTask>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(pt => pt.Id);

            entity.HasOne(pt => pt.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(pt => pt.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MiniTask>(entity =>
        {
            entity.ToTable("MiniTasks");
            entity.HasKey(mt => mt.Id);

            entity.HasOne(mt => mt.Task)
                .WithMany(t => t.MiniTasks)
                .HasForeignKey(mt => mt.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // --- Conversation ---
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.HasOne(c => c.Project)
                .WithMany()
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(c => c.Client)
                .WithMany()
                .HasForeignKey(c => c.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.Expert)
                .WithMany()
                .HasForeignKey(c => c.ExpertId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Message ---
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // --- Review ---
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.HasOne(r => r.Project)
                .WithMany()
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.CreatedBy)
                .WithMany()
                .HasForeignKey(r => r.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.TargetUser)
                .WithMany()
                .HasForeignKey(r => r.TargetUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
