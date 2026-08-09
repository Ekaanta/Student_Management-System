using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Application.DTOs;

public record TeacherClassSubjectDto(
    Guid Id,
    Guid ClassId,
    string ClassName,
    string ClassCode,
    Guid SubjectId,
    string SubjectName,
    string SubjectCode,
    int TotalStudentsEnrolled
);

public record CreateAssignmentRequest(
    string Title,
    string Description,
    decimal MaxScore,
    DateTime DueDateUtc,
    Guid ClassSubjectId
);

public record UpdateAssignmentRequest(
    string Title,
    string Description,
    decimal MaxScore,
    DateTime DueDateUtc
);

public record AssignmentDto(
    Guid Id,
    string Title,
    string Description,
    decimal MaxScore,
    AssignmentStatus Status,
    DateTime DueDateUtc,
    DateTime? PublishedAtUtc,
    Guid ClassSubjectId,
    string ClassName,
    string ClassCode,
    string SubjectName,
    string SubjectCode,
    Guid TeacherId,
    string TeacherName,
    DateTime CreatedAtUtc,
    int SubmissionsCount = 0
);
