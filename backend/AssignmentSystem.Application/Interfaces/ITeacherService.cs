using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Application.Interfaces;

public interface ITeacherService
{
    Task<IEnumerable<TeacherClassSubjectDto>> GetMyClassSubjectsAsync(Guid teacherId);
    Task<IEnumerable<AssignmentDto>> GetTeacherAssignmentsAsync(Guid teacherId, Guid? classSubjectId = null, AssignmentStatus? status = null);
    Task<AssignmentDto> GetAssignmentByIdAsync(Guid teacherId, Guid assignmentId);
    Task<AssignmentDto> CreateAssignmentAsync(Guid teacherId, CreateAssignmentRequest request, bool saveAsDraft = true);
    Task<AssignmentDto> UpdateAssignmentAsync(Guid teacherId, Guid assignmentId, UpdateAssignmentRequest request);
    Task<bool> DeleteAssignmentAsync(Guid teacherId, Guid assignmentId);
    Task<AssignmentDto> PublishAssignmentAsync(Guid teacherId, Guid assignmentId);
    Task<IEnumerable<SubmissionDto>> GetSubmissionsForAssignmentAsync(Guid teacherId, Guid assignmentId);
    Task<SubmissionDto> GetSubmissionByIdAsync(Guid teacherId, Guid submissionId);
    Task<SubmissionDto> GradeSubmissionAsync(Guid teacherId, Guid submissionId, GradeSubmissionRequest request);
}
