using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Application.Services;

public class StudentService : IStudentService
{
    private readonly IApplicationDbContext _dbContext;

    public StudentService(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<StudentClassDto>> GetMyClassesAsync(Guid studentId)
    {
        var enrollments = await _dbContext.ClassEnrollments
            .AsNoTracking()
            .Include(ce => ce.Class)
            .Where(ce => ce.StudentId == studentId)
            .ToListAsync();

        return enrollments.Select(ce => new StudentClassDto(
            ce.ClassId,
            ce.Class.Name,
            ce.Class.Code,
            ce.Class.AcademicYear
        ));
    }

    public async Task<IEnumerable<StudentAssignmentDto>> GetStudentAssignmentsAsync(Guid studentId, Guid? classId = null)
    {
        var enrolledClassIds = await _dbContext.ClassEnrollments
            .AsNoTracking()
            .Where(ce => ce.StudentId == studentId)
            .Select(ce => ce.ClassId)
            .ToListAsync();

        if (!enrolledClassIds.Any())
        {
            return Enumerable.Empty<StudentAssignmentDto>();
        }

        if (classId.HasValue && classId.Value != Guid.Empty)
        {
            if (!enrolledClassIds.Contains(classId.Value))
            {
                return Enumerable.Empty<StudentAssignmentDto>();
            }
            enrolledClassIds = new List<Guid> { classId.Value };
        }

        var assignments = await _dbContext.Assignments
            .AsNoTracking()
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .Where(a => a.Status == AssignmentStatus.Published && enrolledClassIds.Contains(a.ClassSubject.ClassId))
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();

        var studentSubmissions = await _dbContext.Submissions
            .AsNoTracking()
            .Where(s => s.StudentId == studentId)
            .ToListAsync();

        var submissionDict = studentSubmissions.ToDictionary(s => s.AssignmentId, s => s);

        var result = new List<StudentAssignmentDto>();

        foreach (var a in assignments)
        {
            var hasSub = submissionDict.TryGetValue(a.Id, out var sub);
            var isOverdue = DateTime.UtcNow > a.DueDateUtc && !hasSub;

            result.Add(new StudentAssignmentDto(
                a.Id,
                a.Title,
                a.Description,
                a.MaxScore,
                a.DueDateUtc,
                a.ClassSubjectId,
                a.ClassSubject?.Class?.Name ?? string.Empty,
                a.ClassSubject?.Class?.Code ?? string.Empty,
                a.ClassSubject?.Subject?.Name ?? string.Empty,
                a.ClassSubject?.Subject?.Code ?? string.Empty,
                a.Teacher != null ? $"{a.Teacher.FirstName} {a.Teacher.LastName}".Trim() : string.Empty,
                hasSub,
                sub?.Status,
                sub?.Grade,
                sub?.Feedback,
                sub?.SubmittedAtUtc,
                sub?.Id,
                isOverdue
            ));
        }

        return result;
    }

    public async Task<StudentAssignmentDto> GetStudentAssignmentByIdAsync(Guid studentId, Guid assignmentId)
    {
        var assignment = await _dbContext.Assignments
            .AsNoTracking()
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null || assignment.Status != AssignmentStatus.Published)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isEnrolled = await _dbContext.ClassEnrollments
            .AsNoTracking()
            .AnyAsync(ce => ce.StudentId == studentId && ce.ClassId == assignment.ClassSubject.ClassId);

        if (!isEnrolled)
        {
            throw new AppException("Unauthorized to access assignments for a class you are not enrolled in.", 403);
        }

        var sub = await _dbContext.Submissions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

        var hasSub = sub != null;
        var isOverdue = DateTime.UtcNow > assignment.DueDateUtc && !hasSub;

        return new StudentAssignmentDto(
            assignment.Id,
            assignment.Title,
            assignment.Description,
            assignment.MaxScore,
            assignment.DueDateUtc,
            assignment.ClassSubjectId,
            assignment.ClassSubject?.Class?.Name ?? string.Empty,
            assignment.ClassSubject?.Class?.Code ?? string.Empty,
            assignment.ClassSubject?.Subject?.Name ?? string.Empty,
            assignment.ClassSubject?.Subject?.Code ?? string.Empty,
            assignment.Teacher != null ? $"{assignment.Teacher.FirstName} {assignment.Teacher.LastName}".Trim() : string.Empty,
            hasSub,
            sub?.Status,
            sub?.Grade,
            sub?.Feedback,
            sub?.SubmittedAtUtc,
            sub?.Id,
            isOverdue
        );
    }

    public async Task<SubmissionDto> CreateSubmissionAsync(Guid studentId, CreateSubmissionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SubmittedContent))
        {
            throw new AppException("Submission answer content is required.", 400);
        }

        var assignment = await _dbContext.Assignments
            .Include(a => a.ClassSubject)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId);

        if (assignment == null || assignment.Status != AssignmentStatus.Published)
        {
            throw new AppException("Assignment not found.", 404);
        }

        var isEnrolled = await _dbContext.ClassEnrollments
            .AsNoTracking()
            .AnyAsync(ce => ce.StudentId == studentId && ce.ClassId == assignment.ClassSubject.ClassId);

        if (!isEnrolled)
        {
            throw new AppException("Unauthorized to submit assignments for a class you are not enrolled in.", 403);
        }

        if (DateTime.UtcNow > assignment.DueDateUtc)
        {
            throw new AppException("Submission deadline has passed. New submissions are no longer accepted.", 400);
        }

        var existingSub = await _dbContext.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == studentId);

        if (existingSub != null)
        {
            throw new AppException("You have already submitted an answer for this assignment. Please update your submission instead.", 400);
        }

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = request.AssignmentId,
            StudentId = studentId,
            SubmittedContent = request.SubmittedContent.Trim(),
            AttachmentUrl = request.AttachmentUrl?.Trim(),
            SubmittedAtUtc = DateTime.UtcNow,
            Status = SubmissionStatus.Submitted
        };

        _dbContext.Submissions.Add(submission);
        await _dbContext.SaveChangesAsync();

        var student = await _dbContext.Users.FindAsync(studentId);

        return new SubmissionDto(
            submission.Id,
            submission.AssignmentId,
            assignment.Title,
            assignment.MaxScore,
            studentId,
            student != null ? $"{student.FirstName} {student.LastName}".Trim() : "Student",
            student?.Email ?? string.Empty,
            submission.SubmittedContent,
            submission.AttachmentUrl,
            submission.SubmittedAtUtc,
            submission.Status,
            submission.Grade,
            submission.Feedback,
            submission.GradedAtUtc,
            submission.GradedById,
            null
        );
    }

    public async Task<SubmissionDto> UpdateSubmissionAsync(Guid studentId, Guid submissionId, UpdateSubmissionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SubmittedContent))
        {
            throw new AppException("Submission answer content is required.", 400);
        }

        var submission = await _dbContext.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Include(s => s.GradedBy)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            throw new AppException("Submission not found.", 404);
        }

        if (submission.StudentId != studentId)
        {
            throw new AppException("Unauthorized to modify another student's submission.", 403);
        }

        if (DateTime.UtcNow > submission.Assignment.DueDateUtc)
        {
            throw new AppException("Submission deadline has passed. Updates are no longer allowed.", 400);
        }

        submission.SubmittedContent = request.SubmittedContent.Trim();
        submission.AttachmentUrl = request.AttachmentUrl?.Trim();
        submission.SubmittedAtUtc = DateTime.UtcNow;
        submission.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToSubmissionDto(submission);
    }

    public async Task<IEnumerable<SubmissionDto>> GetMySubmissionsAsync(Guid studentId)
    {
        var submissions = await _dbContext.Submissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Include(s => s.GradedBy)
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SubmittedAtUtc)
            .ToListAsync();

        return submissions.Select(MapToSubmissionDto);
    }

    public async Task<SubmissionDto> GetMySubmissionByIdAsync(Guid studentId, Guid submissionId)
    {
        var submission = await _dbContext.Submissions
            .AsNoTracking()
            .Include(s => s.Student)
            .Include(s => s.Assignment)
            .Include(s => s.GradedBy)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            throw new AppException("Submission not found.", 404);
        }

        if (submission.StudentId != studentId)
        {
            throw new AppException("Unauthorized to access another student's submission.", 403);
        }

        return MapToSubmissionDto(submission);
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
