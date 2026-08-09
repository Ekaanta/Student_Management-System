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

public class TeacherModuleTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public void TeacherController_ShouldHaveAuthorizeAttributeWithRoles()
    {
        var controllerType = typeof(TeacherController);
        var authorizeAttribute = controllerType.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorizeAttribute);
        Assert.Equal("Teacher,Admin", authorizeAttribute.Roles);
    }

    [Fact]
    public async Task CreateAssignmentAsync_TeacherNotAssignedToClassSubject_ThrowsAppExceptionWith403()
    {
        using var dbContext = GetInMemoryDbContext();
        var teacherService = new TeacherService(dbContext);

        var teacher1Id = Guid.NewGuid();
        var teacher2Id = Guid.NewGuid();

        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Grade 10", Code = "G10", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Mathematics", Code = "MATH101", Description = "Math" };

        var classSubjectAssignedToTeacher2 = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = schoolClass.Id,
            Class = schoolClass,
            SubjectId = subject.Id,
            Subject = subject,
            TeacherId = teacher2Id
        };

        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubjectAssignedToTeacher2);
        await dbContext.SaveChangesAsync();

        var request = new CreateAssignmentRequest(
            "Algebra Homework 1",
            "Solve problems 1 to 10",
            100m,
            DateTime.UtcNow.AddDays(7),
            classSubjectAssignedToTeacher2.Id
        );

        // Teacher 1 attempts to create assignment for Teacher 2's classSubject
        var ex = await Assert.ThrowsAsync<AppException>(() => teacherService.CreateAssignmentAsync(teacher1Id, request, saveAsDraft: true));

        Assert.Equal(403, ex.StatusCode);
        Assert.Contains("not assigned", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateAssignmentAsync_ValidDraftAndPublish_Succeeds()
    {
        using var dbContext = GetInMemoryDbContext();
        var teacherService = new TeacherService(dbContext);

        var teacherId = Guid.NewGuid();
        var teacher = new User { Id = teacherId, Email = "teacher@school.com", FirstName = "John", LastName = "Doe", PasswordHash = "hash", Role = UserRole.Teacher };
        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Grade 11", Code = "G11", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Physics", Code = "PHY101", Description = "Physics" };
        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };

        dbContext.Users.Add(teacher);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        await dbContext.SaveChangesAsync();

        var request = new CreateAssignmentRequest(
            "Lab Report 1",
            "Write lab report on motion",
            50m,
            DateTime.UtcNow.AddDays(5),
            classSubject.Id
        );

        var draftAssignment = await teacherService.CreateAssignmentAsync(teacherId, request, saveAsDraft: true);
        Assert.Equal(AssignmentStatus.Draft, draftAssignment.Status);
        Assert.Null(draftAssignment.PublishedAtUtc);

        var publishedAssignment = await teacherService.PublishAssignmentAsync(teacherId, draftAssignment.Id);
        Assert.Equal(AssignmentStatus.Published, publishedAssignment.Status);
        Assert.NotNull(publishedAssignment.PublishedAtUtc);
    }

    [Fact]
    public async Task CreateAssignmentAsync_InvalidMaxScore_ThrowsAppExceptionWith400()
    {
        using var dbContext = GetInMemoryDbContext();
        var teacherService = new TeacherService(dbContext);

        var request = new CreateAssignmentRequest("Invalid Assignment", "Description", 0m, DateTime.UtcNow.AddDays(1), Guid.NewGuid());

        var ex = await Assert.ThrowsAsync<AppException>(() => teacherService.CreateAssignmentAsync(Guid.NewGuid(), request));
        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("greater than zero", ex.Message);
    }

    [Fact]
    public async Task GradeSubmissionAsync_MarksExceedMaxScore_ThrowsAppExceptionWith400()
    {
        using var dbContext = GetInMemoryDbContext();
        var teacherService = new TeacherService(dbContext);

        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var teacherUser = new User { Id = teacherId, Email = "teacher@school.com", FirstName = "Teacher", LastName = "One", PasswordHash = "hash", Role = UserRole.Teacher };
        var studentUser = new User { Id = studentId, Email = "student@school.com", FirstName = "Student", LastName = "One", PasswordHash = "hash", Role = UserRole.Student };

        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Grade 12", Code = "G12", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Chemistry", Code = "CHEM101", Description = "Chem" };
        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacherId };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Chemistry Quiz 1",
            Description = "Quiz",
            MaxScore = 20m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacherId,
            Teacher = teacherUser,
            Status = AssignmentStatus.Published,
            DueDateUtc = DateTime.UtcNow.AddDays(2)
        };

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            Assignment = assignment,
            StudentId = studentId,
            Student = studentUser,
            SubmittedContent = "My quiz answers",
            Status = SubmissionStatus.Submitted,
            SubmittedAtUtc = DateTime.UtcNow
        };

        dbContext.Users.Add(teacherUser);
        dbContext.Users.Add(studentUser);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        dbContext.Assignments.Add(assignment);
        dbContext.Submissions.Add(submission);
        await dbContext.SaveChangesAsync();

        // Attempting to give 25 marks when max is 20
        var request = new GradeSubmissionRequest(25m, "Good effort", SubmissionStatus.Graded);

        var ex = await Assert.ThrowsAsync<AppException>(() => teacherService.GradeSubmissionAsync(teacherId, submission.Id, request));

        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("cannot exceed maximum marks", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GradeSubmissionAsync_TeacherNotOwner_ThrowsAppExceptionWith403()
    {
        using var dbContext = GetInMemoryDbContext();
        var teacherService = new TeacherService(dbContext);

        var teacher1Id = Guid.NewGuid();
        var teacher2Id = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var teacher1User = new User { Id = teacher1Id, Email = "t1@school.com", FirstName = "Teacher", LastName = "One", PasswordHash = "hash", Role = UserRole.Teacher };
        var teacher2User = new User { Id = teacher2Id, Email = "t2@school.com", FirstName = "Teacher", LastName = "Two", PasswordHash = "hash", Role = UserRole.Teacher };
        var studentUser = new User { Id = studentId, Email = "student2@school.com", FirstName = "Student", LastName = "Two", PasswordHash = "hash", Role = UserRole.Student };

        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Grade 12", Code = "G12", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Biology", Code = "BIO101", Description = "Bio" };
        var classSubject = new ClassSubject { Id = Guid.NewGuid(), ClassId = schoolClass.Id, Class = schoolClass, SubjectId = subject.Id, Subject = subject, TeacherId = teacher1Id };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Bio Exam",
            Description = "Exam",
            MaxScore = 100m,
            ClassSubjectId = classSubject.Id,
            ClassSubject = classSubject,
            TeacherId = teacher1Id,
            Teacher = teacher1User
        };

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            Assignment = assignment,
            StudentId = studentId,
            Student = studentUser,
            SubmittedContent = "My biology answers"
        };

        dbContext.Users.Add(teacher1User);
        dbContext.Users.Add(teacher2User);
        dbContext.Users.Add(studentUser);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        dbContext.ClassSubjects.Add(classSubject);
        dbContext.Assignments.Add(assignment);
        dbContext.Submissions.Add(submission);
        await dbContext.SaveChangesAsync();

        // Teacher 2 attempts to grade Teacher 1's student submission
        var request = new GradeSubmissionRequest(85m, "Great job", SubmissionStatus.Graded);

        var ex = await Assert.ThrowsAsync<AppException>(() => teacherService.GradeSubmissionAsync(teacher2Id, submission.Id, request));

        Assert.Equal(403, ex.StatusCode);
        Assert.Contains("Unauthorized", ex.Message, StringComparison.OrdinalIgnoreCase);
    }
}
