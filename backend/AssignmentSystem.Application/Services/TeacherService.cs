using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Application.Services;

public class TeacherService : ITeacherService
{
    private readonly IApplicationDbContext _dbContext;

    public TeacherService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<TeacherClassSubjectDto>> GetMyClassSubjectsAsync(Guid teacherId)
    {
        var classSubjects = await _dbContext.ClassSubjects
            .AsNoTracking()
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .Where(cs => cs.TeacherId == teacherId)
            .ToListAsync();

        var result = new List<TeacherClassSubjectDto>();

        foreach (var cs in classSubjects)
        {
            var studentCount = await _dbContext.ClassEnrollments
                .AsNoTracking()
                .CountAsync(ce => ce.ClassId == cs.ClassId);

            result.Add(new TeacherClassSubjectDto(
                cs.Id,
                cs.ClassId,
                cs.Class.Name,
                cs.Class.Code,
                cs.SubjectId,
                cs.Subject.Name,
                cs.Subject.Code,
                studentCount
            ));
        }

        return result;
    }

    public async Task<IEnumerable<AssignmentDto>> GetTeacherAssignmentsAsync(Guid teacherId, Guid? classSubjectId = null, AssignmentStatus? status = null)
    {
        var query = _dbContext.Assignments
            .AsNoTracking()
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .Include(a => a.Submissions)
            .Where(a => a.TeacherId == teacherId || (a.ClassSubject != null && a.ClassSubject.TeacherId == teacherId));

        if (classSubjectId.HasValue && classSubjectId.Value != Guid.Empty)
        {
            query = query.Where(a => a.ClassSubjectId == classSubjectId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        var list = await query.OrderByDescending(a => a.CreatedAtUtc).ToListAsync();

        return list.Select(MapToAssignmentDto);
    }

    public async Task<AssignmentDto> GetAssignmentByIdAsync(Guid teacherId, Guid assignmentId)
    {
        var assignment = await _dbContext.Assignments
            .AsNoTracking()
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isOwner = assignment.TeacherId == teacherId ||
                      (assignment.ClassSubject != null && assignment.ClassSubject.TeacherId == teacherId);

        if (!isOwner)
        {
            throw new AppException("Unauthorized to access this assignment.", 403);
        }

        return MapToAssignmentDto(assignment);
    }

    public async Task<AssignmentDto> CreateAssignmentAsync(Guid teacherId, CreateAssignmentRequest request, bool saveAsDraft = true)
    {
        ValidateAssignmentRequest(request.Title, request.Description, request.MaxScore, request.DueDateUtc);

        var classSubject = await _dbContext.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .FirstOrDefaultAsync(cs => cs.Id == request.ClassSubjectId);

        if (classSubject == null)
        {
            throw new AppException("Class & Subject assignment not found.", 404);
        }

        if (classSubject.TeacherId != teacherId)
        {
            throw new AppException("Teacher is not assigned to the selected Class and Subject.", 403);
        }

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            MaxScore = request.MaxScore,
            ClassSubjectId = request.ClassSubjectId,
            TeacherId = teacherId,
            DueDateUtc = request.DueDateUtc,
            Status = saveAsDraft ? AssignmentStatus.Draft : AssignmentStatus.Published,
            PublishedAtUtc = saveAsDraft ? null : DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Assignments.Add(assignment);
        await _dbContext.SaveChangesAsync();

        var teacher = await _dbContext.Users.FindAsync(teacherId);

        return new AssignmentDto(
            assignment.Id,
            assignment.Title,
            assignment.Description,
            assignment.MaxScore,
            assignment.Status,
            assignment.DueDateUtc,
            assignment.PublishedAtUtc,
            assignment.ClassSubjectId,
            classSubject.Class.Name,
            classSubject.Class.Code,
            classSubject.Subject.Name,
            classSubject.Subject.Code,
            teacherId,
            teacher != null ? $"{teacher.FirstName} {teacher.LastName}".Trim() : "Teacher",
            assignment.CreatedAtUtc,
            0
        );
    }

    public async Task<AssignmentDto> UpdateAssignmentAsync(Guid teacherId, Guid assignmentId, UpdateAssignmentRequest request)
    {
        ValidateAssignmentRequest(request.Title, request.Description, request.MaxScore, request.DueDateUtc);

        var assignment = await _dbContext.Assignments
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isOwner = assignment.TeacherId == teacherId ||
                      (assignment.ClassSubject != null && assignment.ClassSubject.TeacherId == teacherId);

        if (!isOwner)
        {
            throw new AppException("Unauthorized to modify this assignment.", 403);
        }

        assignment.Title = request.Title.Trim();
        assignment.Description = request.Description.Trim();
        assignment.MaxScore = request.MaxScore;
        assignment.DueDateUtc = request.DueDateUtc;
        assignment.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToAssignmentDto(assignment);
    }

    public async Task<bool> DeleteAssignmentAsync(Guid teacherId, Guid assignmentId)
    {
        var assignment = await _dbContext.Assignments
            .Include(a => a.ClassSubject)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isOwner = assignment.TeacherId == teacherId ||
                      (assignment.ClassSubject != null && assignment.ClassSubject.TeacherId == teacherId);

        if (!isOwner)
        {
            throw new AppException("Unauthorized to delete this assignment.", 403);
        }

        _dbContext.Assignments.Remove(assignment);
        await _dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<AssignmentDto> PublishAssignmentAsync(Guid teacherId, Guid assignmentId)
    {
        var assignment = await _dbContext.Assignments
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isOwner = assignment.TeacherId == teacherId ||
                      (assignment.ClassSubject != null && assignment.ClassSubject.TeacherId == teacherId);

        if (!isOwner)
        {
            throw new AppException("Unauthorized to publish this assignment.", 403);
        }

        assignment.Status = AssignmentStatus.Published;
        assignment.PublishedAtUtc = DateTime.UtcNow;
        assignment.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToAssignmentDto(assignment);
    }

    public async Task<IEnumerable<SubmissionDto>> GetSubmissionsForAssignmentAsync(Guid teacherId, Guid assignmentId)
    {
        var assignment = await _dbContext.Assignments
            .AsNoTracking()
            .Include(a => a.ClassSubject)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isOwner = assignment.TeacherId == teacherId ||
                      (assignment.ClassSubject != null && assignment.ClassSubject.TeacherId == teacherId);

        if (!isOwner)
        {
            throw new AppException("Unauthorized to view submissions for this assignment.", 403);
        }

        var submissions = await _dbContext.Submissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Include(s => s.GradedBy)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmittedAtUtc)
            .ToListAsync();

        return submissions.Select(MapToSubmissionDto);
    }

    public async Task<SubmissionDto> GetSubmissionByIdAsync(Guid teacherId, Guid submissionId)
    {
        var submission = await _dbContext.Submissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment).ThenInclude(a => a.ClassSubject)
            .Include(s => s.GradedBy)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            throw new AppException("Submission not found.", 404);
        }

        var isOwner = submission.Assignment != null &&
                      (submission.Assignment.TeacherId == teacherId ||
                       (submission.Assignment.ClassSubject != null && submission.Assignment.ClassSubject.TeacherId == teacherId));

        if (!isOwner)
        {
            throw new AppException("Unauthorized to access this submission.", 403);
        }

        return MapToSubmissionDto(submission);
    }

    public async Task<SubmissionDto> GradeSubmissionAsync(Guid teacherId, Guid submissionId, GradeSubmissionRequest request)
    {
        var submission = await _dbContext.Submissions
            .Include(s => s.Student)
            .Include(s => s.Assignment).ThenInclude(a => a.ClassSubject)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            throw new AppException("Submission not found.", 404);
        }

        if (submission.Assignment == null)
        {
            throw new AppException("Associated assignment not found.", 404);
        }

        var isOwner = submission.Assignment.TeacherId == teacherId ||
                      (submission.Assignment.ClassSubject != null && submission.Assignment.ClassSubject.TeacherId == teacherId);

        if (!isOwner)
        {
            throw new AppException("Unauthorized to review or grade this submission.", 403);
        }

        if (request.Grade < 0)
        {
            throw new AppException("Grade marks cannot be negative.", 400);
        }

        if (request.Grade > submission.Assignment.MaxScore)
        {
            throw new AppException($"Marks assigned ({request.Grade}) cannot exceed maximum marks allowed ({submission.Assignment.MaxScore}).", 400);
        }

        submission.Grade = request.Grade;
        submission.Feedback = request.Feedback;
        submission.Status = request.Status ?? SubmissionStatus.Graded;
        submission.GradedAtUtc = DateTime.UtcNow;
        submission.GradedById = teacherId;
        submission.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        var teacher = await _dbContext.Users.FindAsync(teacherId);

        return new SubmissionDto(
            submission.Id,
            submission.AssignmentId,
            submission.Assignment.Title,
            submission.Assignment.MaxScore,
            submission.StudentId,
            submission.Student != null ? $"{submission.Student.FirstName} {submission.Student.LastName}".Trim() : "Student",
            submission.Student?.Email ?? string.Empty,
            submission.SubmittedContent,
            submission.AttachmentUrl,
            submission.SubmittedAtUtc,
            submission.Status,
            submission.Grade,
            submission.Feedback,
            submission.GradedAtUtc,
            submission.GradedById,
            teacher != null ? $"{teacher.FirstName} {teacher.LastName}".Trim() : null
        );
    }

    private static void ValidateAssignmentRequest(string title, string description, decimal maxScore, DateTime dueDateUtc)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new AppException("Assignment title is required.", 400);
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new AppException("Assignment description is required.", 400);
        }

        if (maxScore <= 0)
        {
            throw new AppException("Maximum marks must be greater than zero.", 400);
        }

        if (dueDateUtc <= DateTime.UtcNow)
        {
            throw new AppException("Assignment due date must be set in the future.", 400);
        }
    }

    private static AssignmentDto MapToAssignmentDto(Assignment a)
    {
        return new AssignmentDto(
            a.Id,
            a.Title,
            a.Description,
            a.MaxScore,
            a.Status,
            a.DueDateUtc,
            a.PublishedAtUtc,
            a.ClassSubjectId,
            a.ClassSubject?.Class?.Name ?? string.Empty,
            a.ClassSubject?.Class?.Code ?? string.Empty,
            a.ClassSubject?.Subject?.Name ?? string.Empty,
            a.ClassSubject?.Subject?.Code ?? string.Empty,
            a.TeacherId,
            a.Teacher != null ? $"{a.Teacher.FirstName} {a.Teacher.LastName}".Trim() : string.Empty,
            a.CreatedAtUtc,
            a.Submissions?.Count ?? 0
        );
    }

    private static SubmissionDto MapToSubmissionDto(Submission s)
    {
        return new SubmissionDto(
            s.Id,
            s.AssignmentId,
            s.Assignment?.Title ?? string.Empty,
            s.Assignment?.MaxScore ?? 100m,
            s.StudentId,
            s.Student != null ? $"{s.Student.FirstName} {s.Student.LastName}".Trim() : string.Empty,
            s.Student?.Email ?? string.Empty,
            s.SubmittedContent,
            s.AttachmentUrl,
            s.SubmittedAtUtc,
            s.Status,
            s.Grade,
            s.Feedback,
            s.GradedAtUtc,
            s.GradedById,
            s.GradedBy != null ? $"{s.GradedBy.FirstName} {s.GradedBy.LastName}".Trim() : null
        );
    }
}
