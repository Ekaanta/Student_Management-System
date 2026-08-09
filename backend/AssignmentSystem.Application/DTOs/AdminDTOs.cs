using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Application.DTOs;

public record AdminOverviewDto(
    int TotalUsers,
    int TotalTeachers,
    int TotalStudents,
    int TotalClasses,
    int TotalSubjects,
    int TotalAssignments,
    int TotalSubmissions
);

public record CreateUserRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    UserRole Role
);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    UserRole Role,
    bool IsActive
);

public record UserDetailDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAtUtc
);

public record CreateSchoolClassRequest(
    string Name,
    string Code,
    string AcademicYear
);

public record UpdateSchoolClassRequest(
    string Name,
    string Code,
    string AcademicYear
);

public record SchoolClassDto(
    Guid Id,
    string Name,
    string Code,
    string AcademicYear,
    int TotalStudentsEnrolled,
    DateTime CreatedAtUtc
);

public record CreateSubjectRequest(
    string Name,
    string Code,
    string Description
);

public record UpdateSubjectRequest(
    string Name,
    string Code,
    string Description
);

public record SubjectDto(
    Guid Id,
    string Name,
    string Code,
    string Description,
    DateTime CreatedAtUtc
);

public record AssignTeacherRequest(
    Guid ClassId,
    Guid SubjectId,
    Guid TeacherId
);

public record ClassSubjectDetailDto(
    Guid Id,
    Guid ClassId,
    string ClassName,
    string ClassCode,
    Guid SubjectId,
    string SubjectName,
    string SubjectCode,
    Guid TeacherId,
    string TeacherName,
    string TeacherEmail
);
