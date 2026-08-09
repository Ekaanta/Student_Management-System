using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher, CancellationToken cancellationToken = default)
    {
        if (await context.Users.AnyAsync(cancellationToken))
        {
            return; // Seed data already exists
        }

        var defaultPasswordHash = passwordHasher.HashPassword("Password123!");

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            PasswordHash = defaultPasswordHash,
            FirstName = "Admin",
            LastName = "User",
            Role = UserRole.Admin,
            IsActive = true
        };

        var teacherUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "teacher@example.com",
            PasswordHash = defaultPasswordHash,
            FirstName = "Teacher",
            LastName = "User",
            Role = UserRole.Teacher,
            IsActive = true
        };

        var studentUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "student@example.com",
            PasswordHash = defaultPasswordHash,
            FirstName = "Student",
            LastName = "User",
            Role = UserRole.Student,
            IsActive = true
        };

        await context.Users.AddRangeAsync(new[] { adminUser, teacherUser, studentUser }, cancellationToken);

        var sampleClass = new SchoolClass
        {
            Id = Guid.NewGuid(),
            Name = "Grade 10 - Section A",
            Code = "G10A",
            Description = "Sample Class 10A Course",
            AcademicYear = "2026",
            IsActive = true
        };

        await context.SchoolClasses.AddAsync(sampleClass, cancellationToken);

        var sampleSubject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Mathematics",
            Code = "MATH101",
            Description = "Sample Mathematics Subject",
            IsActive = true
        };

        await context.Subjects.AddAsync(sampleSubject, cancellationToken);

        var teacherClassSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            TeacherId = teacherUser.Id,
            ClassId = sampleClass.Id,
            SubjectId = sampleSubject.Id
        };

        await context.ClassSubjects.AddAsync(teacherClassSubject, cancellationToken);

        var studentClass = new ClassEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = studentUser.Id,
            ClassId = sampleClass.Id
        };

        await context.ClassEnrollments.AddAsync(studentClass, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
    }
}
