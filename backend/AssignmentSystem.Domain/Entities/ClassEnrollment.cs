using AssignmentSystem.Domain.Common;

namespace AssignmentSystem.Domain.Entities;

public class ClassEnrollment : BaseEntity
{
    public Guid ClassId { get; set; }
    public SchoolClass Class { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public DateTime EnrolledAtUtc { get; set; } = DateTime.UtcNow;
}
