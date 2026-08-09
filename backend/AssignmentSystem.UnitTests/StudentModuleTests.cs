using System.Reflection;
using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Services;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using AssignmentSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AssignmentSystem.UnitTests;

public class StudentModuleTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public void StudentController_ShouldHaveAuthorizeAttributeWithRoles()
    {
        var controllerType = typeof(StudentController);
        var authorizeAttribute = controllerType.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorizeAttribute);
        Assert.Equal("Student,Admin", authorizeAttribute.Roles);
    }

    [Fact]
    public async Task GetStudentAssignmentsAsync_DraftAssignmentHidden_OnlyReturnsPublished()
    {
        using var dbContext = GetInMemoryDbContext();
        var studentService = new StudentService(dbContext);

        var studentId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();

        var student = new User { Id = studentId, Email = "s1@school.com", FirstName = "Alice", LastName = "Student", PasswordHash = "hash", Role = UserRole.Student };
        var teacher = new User { Id = teacherId, Email = "t1@school.com", FirstName = "Bob", LastName = "Teacher", PasswordHash = "hash", Role = UserRole.Teacher };

        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Grade 10", Code = "G10", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Math", Code = "MATH101", Description = "Math" };

        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };
        var enrollment = new ClassEnrollment { Id = Guid.NewGuid(), StudentId = studentId, ClassId = schoolClass.Id };

        var draftAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Draft Quiz",
            Description = "Draft",
            MaxScore = 100m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacherId,
            Status = AssignmentStatus.Draft,
            DueDateUtc = DateTime.UtcNow.AddDays(7)
        };

        var publishedAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Published Homework",
            Description = "Published",
            MaxScore = 100m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacherId,
            Status = AssignmentStatus.Published,
            DueDateUtc = DateTime.UtcNow.AddDays(7)
        };

        dbContext.Users.AddRange(student, teacher);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        dbContext.ClassEnrollments.Add(enrollment);
        dbContext.Assignments.AddRange(draftAssignment, publishedAssignment);
        await dbContext.SaveChangesAsync();

        var result = (await studentService.GetStudentAssignmentsAsync(studentId)).ToList();

        Assert.Single(result);
        Assert.Equal("Published Homework", result[0].Title);
    }

    [Fact]
    public async Task GetStudentAssignmentsAsync_ClassIsolation_ReturnsOnlyEnrolledClassAssignments()
    {
        using var dbContext = GetInMemoryDbContext();
        var studentService = new StudentService(dbContext);

        var studentId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();

        var student = new User { Id = studentId, Email = "s1@school.com", FirstName = "Alice", LastName = "Student", PasswordHash = "hash", Role = UserRole.Student };
        var teacher = new User { Id = teacherId, Email = "t1@school.com", FirstName = "Bob", LastName = "Teacher", PasswordHash = "hash", Role = UserRole.Teacher };

        var classEnrolled = new SchoolClass { Id = Guid.NewGuid(), Name = "Enrolled Class", Code = "EC", AcademicYear = "2026" };
        var classNotEnrolled = new SchoolClass { Id = Guid.NewGuid(), Name = "Other Class", Code = "OC", AcademicYear = "2026" };

        var subject = new Subject { Id = Guid.NewGuid(), Name = "Math", Code = "MATH101", Description = "Math" };

        var classSubjectEnrolled = new ClassSubject { Id = Guid.NewGuid(), ClassId = classEnrolled.Id, Class = classEnrolled, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };
        var classSubjectNotEnrolled = new ClassSubject { Id = Guid.NewGuid(), ClassId = classNotEnrolled.Id, Class = classNotEnrolled, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };

        var enrollment = new ClassEnrollment { Id = Guid.NewGuid(), StudentId = studentId, ClassId = classEnrolled.Id };

        var enrolledAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Enrolled Assignment",
            Description = "Desc",
            MaxScore = 50m,
            ClassSubjectId = classSubjectEnrolled.Id,
            ClassSubject = classSubjectEnrolled,
            TeacherId = teacherId,
            Status = AssignmentStatus.Published,
            DueDateUtc = DateTime.UtcNow.AddDays(3)
        };

        var otherAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Other Class Assignment",
            Description = "Desc",
            MaxScore = 50m,
            ClassSubjectId = classSubjectNotEnrolled.Id,
            ClassSubject = classSubjectNotEnrolled,
            TeacherId = teacherId,
            Status = AssignmentStatus.Published,
            DueDateUtc = DateTime.UtcNow.AddDays(3)
        };

        dbContext.Users.AddRange(student, teacher);
        dbContext.SchoolClasses.AddRange(classEnrolled, classNotEnrolled);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.AddRange(classSubjectEnrolled, classSubjectNotEnrolled);
        dbContext.ClassEnrollments.Add(enrollment);
        dbContext.Assignments.AddRange(enrolledAssignment, otherAssignment);
        await dbContext.SaveChangesAsync();

        var result = (await studentService.GetStudentAssignmentsAsync(studentId)).ToList();

        Assert.Single(result);
        Assert.Equal("Enrolled Assignment", result[0].Title);
    }

    [Fact]
    public async Task CreateSubmissionAsync_BeforeDeadline_Succeeds()
    {
        using var dbContext = GetInMemoryDbContext();
        var studentService = new StudentService(dbContext);

        var studentId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();

        var student = new User { Id = studentId, Email = "s1@school.com", FirstName = "Alice", LastName = "Student", PasswordHash = "hash", Role = UserRole.Student };
        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Class A", Code = "CA", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Science", Code = "SCI101", Description = "Sci" };
        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };
        var enrollment = new ClassEnrollment { Id = Guid.NewGuid(), StudentId = studentId, ClassId = schoolClass.Id };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Science Essay",
            Description = "Write an essay",
            MaxScore = 100m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacherId,
            Status = AssignmentStatus.Published,
            DueDateUtc = DateTime.UtcNow.AddDays(2)
        };

        dbContext.Users.Add(student);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        dbContext.ClassEnrollments.Add(enrollment);
        dbContext.Assignments.Add(assignment);
        await dbContext.SaveChangesAsync();

        var request = new CreateSubmissionRequest(assignment.Id, "Here is my science essay content", "http://example.com/essay.pdf");

        var submission = await studentService.CreateSubmissionAsync(studentId, request);

        Assert.NotNull(submission);
        Assert.Equal(SubmissionStatus.Submitted, submission.Status);
        Assert.Equal("Here is my science essay content", submission.SubmittedContent);
    }

    [Fact]
    public async Task CreateSubmissionAsync_AfterDeadline_ThrowsAppExceptionWith400()
    {
        using var dbContext = GetInMemoryDbContext();
        var studentService = new StudentService(dbContext);

        var studentId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();

        var student = new User { Id = studentId, Email = "s1@school.com", FirstName = "Alice", LastName = "Student", PasswordHash = "hash", Role = UserRole.Student };
        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Class B", Code = "CB", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "History", Code = "HIS101", Description = "His" };
        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };
        var enrollment = new ClassEnrollment { Id = Guid.NewGuid(), StudentId = studentId, ClassId = schoolClass.Id };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Past Homework",
            Description = "Old work",
            MaxScore = 100m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacherId,
            Status = AssignmentStatus.Published,
            DueDateUtc = DateTime.UtcNow.AddDays(-2) // Deadline passed 2 days ago
        };

        dbContext.Users.Add(student);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        dbContext.ClassEnrollments.Add(enrollment);
        dbContext.Assignments.Add(assignment);
        await dbContext.SaveChangesAsync();

        var request = new CreateSubmissionRequest(assignment.Id, "Late submission attempt", null);

        var ex = await Assert.ThrowsAsync<AppException>(() => studentService.CreateSubmissionAsync(studentId, request));

        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("deadline has passed", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateSubmissionAsync_AfterDeadline_ThrowsAppExceptionWith400()
    {
        using var dbContext = GetInMemoryDbContext();
        var studentService = new StudentService(dbContext);

        var studentId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();

        var student = new User { Id = studentId, Email = "s1@school.com", FirstName = "Alice", LastName = "Student", PasswordHash = "hash", Role = UserRole.Student };
        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Class C", Code = "CC", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "English", Code = "ENG101", Description = "Eng" };
        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "English Assignment",
            Description = "Essay",
            MaxScore = 100m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacherId,
            DueDateUtc = DateTime.UtcNow.AddDays(-1) // Deadline passed 1 day ago
        };

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            Assignment = assignment,
            StudentId = studentId,
            Student = student,
            SubmittedContent = "Original submission",
            SubmittedAtUtc = DateTime.UtcNow.AddDays(-2)
        };

        dbContext.Users.Add(student);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        dbContext.Assignments.Add(assignment);
        dbContext.Submissions.Add(submission);
        await dbContext.SaveChangesAsync();

        var updateRequest = new UpdateSubmissionRequest("Attempting to edit answer after deadline", null);

        var ex = await Assert.ThrowsAsync<AppException>(() => studentService.UpdateSubmissionAsync(studentId, submission.Id, updateRequest));

        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("deadline has passed", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateSubmissionAsync_UnauthorizedStudent_ThrowsAppExceptionWith403()
    {
        using var dbContext = GetInMemoryDbContext();
        var studentService = new StudentService(dbContext);

        var student1Id = Guid.NewGuid();
        var student2Id = Guid.NewGuid();

        var student1 = new User { Id = student1Id, Email = "s1@school.com", FirstName = "Student", LastName = "One", PasswordHash = "hash", Role = UserRole.Student };
        var student2 = new User { Id = student2Id, Email = "s2@school.com", FirstName = "Student", LastName = "Two", PasswordHash = "hash", Role = UserRole.Student };

        var assignment = new Assignment { Id = Guid.NewGuid(), Title = "Quiz", Description = "Quiz", MaxScore = 100m, DueDateUtc = DateTime.UtcNow.AddDays(5) };

        var submissionStudent1 = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            Assignment = assignment,
            StudentId = student1Id,
            Student = student1,
            SubmittedContent = "Student 1 answer"
        };

        dbContext.Users.AddRange(student1, student2);
        dbContext.Assignments.Add(assignment);
        dbContext.Submissions.Add(submissionStudent1);
        await dbContext.SaveChangesAsync();

        var updateRequest = new UpdateSubmissionRequest("Student 2 trying to hijack Student 1 work", null);

        // Student 2 attempts to edit Student 1's submission
        var ex = await Assert.ThrowsAsync<AppException>(() => studentService.UpdateSubmissionAsync(student2Id, submissionStudent1.Id, updateRequest));

        Assert.Equal(403, ex.StatusCode);
        Assert.Contains("Unauthorized", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}
