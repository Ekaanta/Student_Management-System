using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Application.Interfaces;

public interface IAdminService
{
    Task<AdminOverviewDto> GetOverviewStatsAsync(CancellationToken cancellationToken = default);

    // User Management
    Task<IEnumerable<UserDetailDto>> GetUsersAsync(UserRole? roleFilter = null, CancellationToken cancellationToken = default);
    Task<UserDetailDto> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserDetailDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDetailDto> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDetailDto> ToggleUserStatusAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteUserAsync(Guid id, CancellationToken cancellationToken = default);

    // Class Management
    Task<IEnumerable<SchoolClassDto>> GetClassesAsync(CancellationToken cancellationToken = default);
    Task<SchoolClassDto> GetClassByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SchoolClassDto> CreateClassAsync(CreateSchoolClassRequest request, CancellationToken cancellationToken = default);
    Task<SchoolClassDto> UpdateClassAsync(Guid id, UpdateSchoolClassRequest request, CancellationToken cancellationToken = default);
    Task DeleteClassAsync(Guid id, CancellationToken cancellationToken = default);

    // Subject Management
    Task<IEnumerable<SubjectDto>> GetSubjectsAsync(CancellationToken cancellationToken = default);
    Task<SubjectDto> GetSubjectByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubjectDto> CreateSubjectAsync(CreateSubjectRequest request, CancellationToken cancellationToken = default);
    Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectRequest request, CancellationToken cancellationToken = default);
    Task DeleteSubjectAsync(Guid id, CancellationToken cancellationToken = default);

    // Teacher Assignment Management
    Task<IEnumerable<ClassSubjectDetailDto>> GetTeacherAssignmentsAsync(CancellationToken cancellationToken = default);
    Task<ClassSubjectDetailDto> AssignTeacherAsync(AssignTeacherRequest request, CancellationToken cancellationToken = default);
    Task RemoveTeacherAssignmentAsync(Guid id, CancellationToken cancellationToken = default);
}
