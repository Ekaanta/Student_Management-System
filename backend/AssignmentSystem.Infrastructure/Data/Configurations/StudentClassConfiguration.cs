using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssignmentSystem.Infrastructure.Data.Configurations;

public class StudentClassConfiguration : IEntityTypeConfiguration<ClassEnrollment>
{
    public void Configure(EntityTypeBuilder<ClassEnrollment> builder)
    {
        builder.ToTable("ClassEnrollments");

        builder.HasKey(ce => ce.Id);

        // Composite unique index to prevent duplicate Student + Class combinations
        builder.HasIndex(ce => new { ce.StudentId, ce.ClassId })
            .IsUnique();

        builder.HasOne(ce => ce.Class)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(ce => ce.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ce => ce.Student)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(ce => ce.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
