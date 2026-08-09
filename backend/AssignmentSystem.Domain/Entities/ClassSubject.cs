using AssignmentSystem.Domain.Common;

namespace AssignmentSystem.Domain.Entities;

public class ClassSubject : BaseEntity
{
    public Guid ClassId { get; set; }
    public SchoolClass Class { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
