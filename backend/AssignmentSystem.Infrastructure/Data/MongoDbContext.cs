using AssignmentSystem.Application.Configuration;
using AssignmentSystem.Domain.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace AssignmentSystem.Infrastructure.Data;

public class MongoDbContext : IMongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly MongoDBSettings _settings;

    static MongoDbContext()
    {
        try
        {
            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

            BsonClassMap.RegisterClassMap<User>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.Enrollments);
                cm.UnmapMember(c => c.TaughtClassSubjects);
                cm.UnmapMember(c => c.CreatedAssignments);
                cm.UnmapMember(c => c.Submissions);
            });

            BsonClassMap.RegisterClassMap<SchoolClass>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.Enrollments);
                cm.UnmapMember(c => c.ClassSubjects);
            });

            BsonClassMap.RegisterClassMap<Subject>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.ClassSubjects);
            });

            BsonClassMap.RegisterClassMap<ClassSubject>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.Class);
                cm.UnmapMember(c => c.Subject);
                cm.UnmapMember(c => c.Teacher);
                cm.UnmapMember(c => c.Assignments);
            });

            BsonClassMap.RegisterClassMap<ClassEnrollment>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.Student);
                cm.UnmapMember(c => c.Class);
            });

            BsonClassMap.RegisterClassMap<Assignment>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.Teacher);
                cm.UnmapMember(c => c.ClassSubject);
                cm.UnmapMember(c => c.Submissions);
            });

            BsonClassMap.RegisterClassMap<Submission>(cm =>
            {
                cm.AutoMap();
                cm.UnmapMember(c => c.Assignment);
                cm.UnmapMember(c => c.Student);
                cm.UnmapMember(c => c.GradedBy);
            });
        }
        catch (Exception)
        {
            // Already registered
        }
    }

    public MongoDbContext(IMongoClient mongoClient, IOptions<MongoDBSettings> settingsOptions)
    {
        _settings = settingsOptions.Value;
        _database = mongoClient.GetDatabase(_settings.DatabaseName);
    }

    public IMongoDatabase Database => _database;

    public IMongoCollection<User> Users =>
        _database.GetCollection<User>(_settings.UsersCollectionName);

    public IMongoCollection<SchoolClass> SchoolClasses =>
        _database.GetCollection<SchoolClass>(_settings.ClassesCollectionName);

    public IMongoCollection<Subject> Subjects =>
        _database.GetCollection<Subject>(_settings.SubjectsCollectionName);

    public IMongoCollection<ClassSubject> ClassSubjects =>
        _database.GetCollection<ClassSubject>(_settings.TeacherClassSubjectsCollectionName);

    public IMongoCollection<ClassEnrollment> ClassEnrollments =>
        _database.GetCollection<ClassEnrollment>(_settings.StudentClassesCollectionName);

    public IMongoCollection<Assignment> Assignments =>
        _database.GetCollection<Assignment>(_settings.AssignmentsCollectionName);

    public IMongoCollection<Submission> Submissions =>
        _database.GetCollection<Submission>(_settings.SubmissionsCollectionName);

    public async Task EnsureIndexesCreatedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var userEmailIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
            var userEmailIndexModel = new CreateIndexModel<User>(userEmailIndexKeys, new CreateIndexOptions { Unique = true, Name = "ux_users_email" });
            await Users.Indexes.CreateOneAsync(userEmailIndexModel, cancellationToken: cancellationToken);
        }
        catch { }

        try
        {
            var classCodeIndexKeys = Builders<SchoolClass>.IndexKeys.Ascending(c => c.Code);
            var classCodeIndexModel = new CreateIndexModel<SchoolClass>(classCodeIndexKeys, new CreateIndexOptions { Unique = true, Name = "ux_classes_code" });
            await SchoolClasses.Indexes.CreateOneAsync(classCodeIndexModel, cancellationToken: cancellationToken);
        }
        catch { }

        try
        {
            var subjectCodeIndexKeys = Builders<Subject>.IndexKeys.Ascending(s => s.Code);
            var subjectCodeIndexModel = new CreateIndexModel<Subject>(subjectCodeIndexKeys, new CreateIndexOptions { Unique = true, Name = "ux_subjects_code" });
            await Subjects.Indexes.CreateOneAsync(subjectCodeIndexModel, cancellationToken: cancellationToken);
        }
        catch { }

        try
        {
            var tcsIndexKeys = Builders<ClassSubject>.IndexKeys
                .Ascending(cs => cs.TeacherId)
                .Ascending(cs => cs.ClassId)
                .Ascending(cs => cs.SubjectId);
            var tcsIndexModel = new CreateIndexModel<ClassSubject>(tcsIndexKeys, new CreateIndexOptions { Unique = true, Name = "ux_teacher_class_subject" });
            await ClassSubjects.Indexes.CreateOneAsync(tcsIndexModel, cancellationToken: cancellationToken);
        }
        catch { }

        try
        {
            var scIndexKeys = Builders<ClassEnrollment>.IndexKeys
                .Ascending(ce => ce.StudentId)
                .Ascending(ce => ce.ClassId);
            var scIndexModel = new CreateIndexModel<ClassEnrollment>(scIndexKeys, new CreateIndexOptions { Unique = true, Name = "ux_student_class" });
            await ClassEnrollments.Indexes.CreateOneAsync(scIndexModel, cancellationToken: cancellationToken);
        }
        catch { }

        try
        {
            var subIndexKeys = Builders<Submission>.IndexKeys
                .Ascending(s => s.AssignmentId)
                .Ascending(s => s.StudentId);
            var subIndexModel = new CreateIndexModel<Submission>(subIndexKeys, new CreateIndexOptions { Unique = true, Name = "ux_assignment_student_submission" });
            await Submissions.Indexes.CreateOneAsync(subIndexModel, cancellationToken: cancellationToken);
        }
        catch { }

        try
        {
            var assignIndexKeys = Builders<Assignment>.IndexKeys
                .Ascending(a => a.TeacherId)
                .Ascending(a => a.ClassSubjectId)
                .Ascending(a => a.DueDateUtc);
            var assignIndexModel = new CreateIndexModel<Assignment>(assignIndexKeys, new CreateIndexOptions { Name = "ix_assignments_teacher_class_deadline" });
            await Assignments.Indexes.CreateOneAsync(assignIndexModel, cancellationToken: cancellationToken);
        }
        catch { }
    }
}
