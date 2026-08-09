using AssignmentSystem.Domain.Common;
using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Domain.Entities;

public class Submission : BaseEntity
{
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public string SubmittedContent { get; set; } = string.Empty;
    public string Answer
    {
        get => SubmittedContent;
        set => SubmittedContent = value;
    }
    public string? AttachmentUrl { get; set; }
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;

    public decimal? Grade { get; set; }
    public decimal? Marks
    {
        get => Grade;
        set => Grade = value;
    }
    public string? Feedback { get; set; }
    public DateTime? GradedAtUtc { get; set; }
    public Guid? GradedById { get; set; }
    public User? GradedBy { get; set; }
}
