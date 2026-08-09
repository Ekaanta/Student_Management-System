using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentSystem.Infrastructure.Data.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.ToTable("Assignments", t =>
        {
            t.HasCheckConstraint("CK_Assignment_MaxScore_Positive", "\"MaxScore\" > 0");
        });

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(a => a.Description)
            .HasMaxLength(4000);

        builder.Property(a => a.MaxScore)
            .HasPrecision(18, 2);

        // Required indexes
        builder.HasIndex(a => a.TeacherId);
        builder.HasIndex(a => a.ClassSubjectId);
        builder.HasIndex(a => a.DueDateUtc);

        builder.HasOne(a => a.ClassSubject)
            .WithMany(cs => cs.Assignments)
            .HasForeignKey(a => a.ClassSubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Teacher)
            .WithMany(u => u.CreatedAssignments)
            .HasForeignKey(a => a.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
