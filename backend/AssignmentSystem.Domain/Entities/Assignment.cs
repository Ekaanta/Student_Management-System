using AssignmentSystem.Domain.Common;
using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Domain.Entities;

public class Assignment : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal MaxScore { get; set; } = 100m;
    public decimal MaximumMarks
    {
        get => MaxScore;
        set => MaxScore = value;
    }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public DateTime DueDateUtc { get; set; }
    public DateTime? PublishedAtUtc { get; set; }

    public Guid ClassSubjectId { get; set; }
    public ClassSubject ClassSubject { get; set; } = null!;

    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
