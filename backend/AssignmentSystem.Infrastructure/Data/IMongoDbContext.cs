using AssignmentSystem.Domain.Entities;
using MongoDB.Driver;

namespace AssignmentSystem.Infrastructure.Data;

public interface IMongoDbContext
{
    IMongoDatabase Database { get; }

    IMongoCollection<User> Users { get; }
    IMongoCollection<SchoolClass> SchoolClasses { get; }
    IMongoCollection<Subject> Subjects { get; }
    IMongoCollection<ClassSubject> ClassSubjects { get; }
    IMongoCollection<ClassEnrollment> ClassEnrollments { get; }
    IMongoCollection<Assignment> Assignments { get; }
    IMongoCollection<Submission> Submissions { get; }

    Task EnsureIndexesCreatedAsync(CancellationToken cancellationToken = default);
}
