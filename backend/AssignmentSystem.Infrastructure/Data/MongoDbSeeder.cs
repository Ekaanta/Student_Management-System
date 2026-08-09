using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

namespace AssignmentSystem.Infrastructure.Data;

public static class MongoDbSeeder
{
    public static async Task SeedAsync(
        IMongoDbContext mongoContext,
        IPasswordHasher passwordHasher,
        ApplicationDbContext? pgDbContext = null,
        CancellationToken cancellationToken = default)
    {
        // 1. Ensure indexes are created before sync/seeding
        await mongoContext.EnsureIndexesCreatedAsync(cancellationToken);

        // 2. If Primary DbContext is available, sync all records to MongoDB Atlas
        if (pgDbContext != null)
        {
            await SyncFromRelationalDbAsync(mongoContext, pgDbContext, cancellationToken);
            return;
        }

        // 3. Fallback: Seed initial data if MongoDB collections are completely empty
        var existingUserCount = await mongoContext.Users.CountDocumentsAsync(Builders<User>.Filter.Empty, cancellationToken: cancellationToken);
        if (existingUserCount > 0)
        {
            return;
        }

        var adminId = Guid.NewGuid();
        var teacherId = Guid.NewGuid();
        var studentId = Guid.NewGuid();

        var adminUser = new User
        {
            Id = adminId,
            Email = "admin@example.com",
            PasswordHash = passwordHasher.HashPassword("Password123!"),
            FirstName = "System",
            LastName = "Admin",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        var teacherUser = new User
        {
            Id = teacherId,
            Email = "teacher@example.com",
            PasswordHash = passwordHasher.HashPassword("Password123!"),
            FirstName = "Teacher",
            LastName = "User",
            Role = UserRole.Teacher,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        var studentUser = new User
        {
            Id = studentId,
            Email = "student@example.com",
            PasswordHash = passwordHasher.HashPassword("Password123!"),
            FirstName = "Student",
            LastName = "User",
            Role = UserRole.Student,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        await mongoContext.Users.InsertManyAsync(new[] { adminUser, teacherUser, studentUser }, cancellationToken: cancellationToken);

        var sampleClass = new SchoolClass
        {
            Id = Guid.NewGuid(),
            Name = "Grade 10 - Section A",
            Code = "G10A",
            AcademicYear = "2026",
            Description = "Standard Grade 10 Class",
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        await mongoContext.SchoolClasses.InsertOneAsync(sampleClass, cancellationToken: cancellationToken);

        var sampleSubject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Mathematics",
            Code = "MATH101",
            Description = "Core High School Mathematics",
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        await mongoContext.Subjects.InsertOneAsync(sampleSubject, cancellationToken: cancellationToken);

        var teacherClassSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            TeacherId = teacherId,
            ClassId = sampleClass.Id,
            SubjectId = sampleSubject.Id,
            CreatedAtUtc = DateTime.UtcNow
        };

        await mongoContext.ClassSubjects.InsertOneAsync(teacherClassSubject, cancellationToken: cancellationToken);

        var studentClassEnrollment = new ClassEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            ClassId = sampleClass.Id,
            EnrolledAtUtc = DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow
        };

        await mongoContext.ClassEnrollments.InsertOneAsync(studentClassEnrollment, cancellationToken: cancellationToken);
    }

    private static async Task SyncFromRelationalDbAsync(IMongoDbContext mongoContext, ApplicationDbContext pgDbContext, CancellationToken cancellationToken)
    {
        // 1. Sync Users by Email match
        var pgUsers = await pgDbContext.Users.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var u in pgUsers)
        {
            try
            {
                var filter = Builders<User>.Filter.Eq(x => x.Email, u.Email);
                var existing = await mongoContext.Users.Find(filter).FirstOrDefaultAsync(cancellationToken);
                if (existing != null)
                {
                    u.Id = existing.Id;
                }
                await mongoContext.Users.ReplaceOneAsync(filter, u, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue syncing remaining users
            }
        }

        // 2. Sync SchoolClasses by Code match
        var pgClasses = await pgDbContext.SchoolClasses.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var c in pgClasses)
        {
            try
            {
                var filter = Builders<SchoolClass>.Filter.Eq(x => x.Code, c.Code);
                var existing = await mongoContext.SchoolClasses.Find(filter).FirstOrDefaultAsync(cancellationToken);
                if (existing != null)
                {
                    c.Id = existing.Id;
                }
                await mongoContext.SchoolClasses.ReplaceOneAsync(filter, c, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue
            }
        }

        // 3. Sync Subjects by Code match
        var pgSubjects = await pgDbContext.Subjects.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var s in pgSubjects)
        {
            try
            {
                var filter = Builders<Subject>.Filter.Eq(x => x.Code, s.Code);
                var existing = await mongoContext.Subjects.Find(filter).FirstOrDefaultAsync(cancellationToken);
                if (existing != null)
                {
                    s.Id = existing.Id;
                }
                await mongoContext.Subjects.ReplaceOneAsync(filter, s, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue
            }
        }

        // 4. Sync ClassSubjects
        var pgClassSubjects = await pgDbContext.ClassSubjects.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var cs in pgClassSubjects)
        {
            try
            {
                var filter = Builders<ClassSubject>.Filter.Eq(x => x.Id, cs.Id);
                await mongoContext.ClassSubjects.ReplaceOneAsync(filter, cs, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue
            }
        }

        // 5. Sync ClassEnrollments
        var pgEnrollments = await pgDbContext.ClassEnrollments.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var ce in pgEnrollments)
        {
            try
            {
                var filter = Builders<ClassEnrollment>.Filter.Eq(x => x.Id, ce.Id);
                await mongoContext.ClassEnrollments.ReplaceOneAsync(filter, ce, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue
            }
        }

        // 6. Sync Assignments
        var pgAssignments = await pgDbContext.Assignments.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var a in pgAssignments)
        {
            try
            {
                var filter = Builders<Assignment>.Filter.Eq(x => x.Id, a.Id);
                await mongoContext.Assignments.ReplaceOneAsync(filter, a, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue
            }
        }

        // 7. Sync Submissions
        var pgSubmissions = await pgDbContext.Submissions.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var sub in pgSubmissions)
        {
            try
            {
                var filter = Builders<Submission>.Filter.Eq(x => x.Id, sub.Id);
                await mongoContext.Submissions.ReplaceOneAsync(filter, sub, new ReplaceOptions { IsUpsert = true }, cancellationToken);
            }
            catch
            {
                // Continue
            }
        }
    }
}
