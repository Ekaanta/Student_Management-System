using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Application.DTOs;

public record CreateSubmissionRequest(Guid AssignmentId, string SubmittedContent, string? AttachmentUrl);

public record UpdateSubmissionRequest(string SubmittedContent, string? AttachmentUrl);

public record GradeSubmissionRequest(
    decimal Grade,
    string? Feedback,
    SubmissionStatus? Status = SubmissionStatus.Graded
);

public record StudentClassDto(
    Guid ClassId,
    string ClassName,
    string ClassCode,
    string AcademicYear
);

public record StudentAssignmentDto(
    Guid Id,
    string Title,
    string Description,
    decimal MaxScore,
    DateTime DueDateUtc,
    Guid ClassSubjectId,
    string ClassName,
    string ClassCode,
    string SubjectName,
    string SubjectCode,
    string TeacherName,
    bool HasSubmitted,
    SubmissionStatus? StudentSubmissionStatus,
    decimal? StudentGrade,
    string? StudentFeedback,
    DateTime? StudentSubmittedAtUtc,
    Guid? StudentSubmissionId,
    bool IsOverdue
);

public record SubmissionDto(
    Guid Id,
    Guid AssignmentId,
    string AssignmentTitle,
    decimal AssignmentMaxScore,
    Guid StudentId,
    string StudentName,
    string StudentEmail,
    string SubmittedContent,
    string? AttachmentUrl,
    DateTime SubmittedAtUtc,
    SubmissionStatus Status,
    decimal? Grade,
    string? Feedback,
    DateTime? GradedAtUtc,
    Guid? GradedById,
    string? GradedByName
);
