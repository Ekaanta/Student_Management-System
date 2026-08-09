using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentSystem.Infrastructure.Data.Configurations;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions", t =>
        {
            t.HasCheckConstraint("CK_Submission_Grade_NonNegative", "\"Grade\" IS NULL OR \"Grade\" >= 0");
        });

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Grade)
            .HasPrecision(18, 2);

        builder.Property(s => s.Feedback)
            .HasMaxLength(4000);

        // Required indexes
        builder.HasIndex(s => s.AssignmentId);
        builder.HasIndex(s => s.StudentId);

        // Composite unique index to prevent duplicate Student + Assignment submissions
        builder.HasIndex(s => new { s.StudentId, s.AssignmentId })
            .IsUnique();

        // Safe delete behavior: Restrict to preserve historical submission data
        builder.HasOne(s => s.Assignment)
            .WithMany(a => a.Submissions)
            .HasForeignKey(s => s.AssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Student)
            .WithMany(u => u.Submissions)
            .HasForeignKey(s => s.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.GradedBy)
            .WithMany()
            .HasForeignKey(s => s.GradedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
