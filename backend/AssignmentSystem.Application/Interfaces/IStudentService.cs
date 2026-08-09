using AssignmentSystem.Application.DTOs;

namespace AssignmentSystem.Application.Interfaces;

public interface IStudentService
{
    Task<IEnumerable<StudentClassDto>> GetMyClassesAsync(Guid studentId);
    Task<IEnumerable<StudentAssignmentDto>> GetStudentAssignmentsAsync(Guid studentId, Guid? classId = null);
    Task<StudentAssignmentDto> GetStudentAssignmentByIdAsync(Guid studentId, Guid assignmentId);
    Task<SubmissionDto> CreateSubmissionAsync(Guid studentId, CreateSubmissionRequest request);
    Task<SubmissionDto> UpdateSubmissionAsync(Guid studentId, Guid submissionId, UpdateSubmissionRequest request);
    Task<IEnumerable<SubmissionDto>> GetMySubmissionsAsync(Guid studentId);
    Task<SubmissionDto> GetMySubmissionByIdAsync(Guid studentId, Guid submissionId);
}
