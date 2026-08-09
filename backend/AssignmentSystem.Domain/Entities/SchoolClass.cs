using AssignmentSystem.Domain.Common;

namespace AssignmentSystem.Domain.Entities;

public class SchoolClass : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
    public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
}
