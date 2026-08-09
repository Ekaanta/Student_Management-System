using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentSystem.Infrastructure.Data.Configurations;

public class TeacherClassSubjectConfiguration : IEntityTypeConfiguration<ClassSubject>
{
    public void Configure(EntityTypeBuilder<ClassSubject> builder)
    {
        builder.ToTable("ClassSubjects");

        builder.HasKey(cs => cs.Id);

        // Composite unique index to prevent duplicate Teacher + Class + Subject combinations
        builder.HasIndex(cs => new { cs.TeacherId, cs.ClassId, cs.SubjectId })
            .IsUnique();

        builder.HasOne(cs => cs.Class)
            .WithMany(c => c.ClassSubjects)
            .HasForeignKey(cs => cs.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cs => cs.Subject)
            .WithMany(s => s.ClassSubjects)
            .HasForeignKey(cs => cs.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cs => cs.Teacher)
            .WithMany(u => u.TaughtClassSubjects)
            .HasForeignKey(cs => cs.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
