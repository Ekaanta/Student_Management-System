using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

namespace AssignmentSystem.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly IMongoDbContext? _mongoDbContext;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IMongoDbContext? mongoDbContext = null) : base(options)
    {
        _mongoDbContext = mongoDbContext;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<SchoolClass> SchoolClasses => Set<SchoolClass>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<ClassSubject> ClassSubjects => Set<ClassSubject>();
    public DbSet<ClassEnrollment> ClassEnrollments => Set<ClassEnrollment>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Capture pending tracked changes before base SaveChanges clears states
        var pendingEntries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
            .Select(e => new TrackedEntityState(e.Entity, e.State))
            .ToList();

        // 2. Execute primary SaveChanges
        var result = await base.SaveChangesAsync(cancellationToken);

        // 3. Instantly sync tracked changes to MongoDB Atlas
        if (_mongoDbContext != null && pendingEntries.Any())
        {
            await SyncChangesToMongoAtlasAsync(pendingEntries, cancellationToken);
        }

        return result;
    }

    private async Task SyncChangesToMongoAtlasAsync(List<TrackedEntityState> trackedStates, CancellationToken cancellationToken)
    {
        try
        {
            foreach (var item in trackedStates)
            {
                try
                {
                    switch (item.Entity)
                    {
                        case User u:
                            var userFilter = Builders<User>.Filter.Eq(x => x.Email, u.Email);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.Users.DeleteOneAsync(userFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.Users.ReplaceOneAsync(userFilter, u, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;

                        case SchoolClass c:
                            var classFilter = Builders<SchoolClass>.Filter.Eq(x => x.Code, c.Code);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.SchoolClasses.DeleteOneAsync(classFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.SchoolClasses.ReplaceOneAsync(classFilter, c, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;

                        case Subject s:
                            var subjectFilter = Builders<Subject>.Filter.Eq(x => x.Code, s.Code);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.Subjects.DeleteOneAsync(subjectFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.Subjects.ReplaceOneAsync(subjectFilter, s, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;

                        case ClassSubject cs:
                            var csFilter = Builders<ClassSubject>.Filter.Eq(x => x.Id, cs.Id);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.ClassSubjects.DeleteOneAsync(csFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.ClassSubjects.ReplaceOneAsync(csFilter, cs, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;

                        case ClassEnrollment ce:
                            var ceFilter = Builders<ClassEnrollment>.Filter.Eq(x => x.Id, ce.Id);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.ClassEnrollments.DeleteOneAsync(ceFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.ClassEnrollments.ReplaceOneAsync(ceFilter, ce, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;

                        case Assignment a:
                            var assignFilter = Builders<Assignment>.Filter.Eq(x => x.Id, a.Id);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.Assignments.DeleteOneAsync(assignFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.Assignments.ReplaceOneAsync(assignFilter, a, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;

                        case Submission sub:
                            var subFilter = Builders<Submission>.Filter.Eq(x => x.Id, sub.Id);
                            if (item.State == EntityState.Deleted)
                            {
                                await _mongoDbContext!.Submissions.DeleteOneAsync(subFilter, cancellationToken);
                            }
                            else
                            {
                                await _mongoDbContext!.Submissions.ReplaceOneAsync(subFilter, sub, new ReplaceOptions { IsUpsert = true }, cancellationToken);
                            }
                            break;
                    }
                }
                catch
                {
                    // Ignore individual entity sync error
                }
            }
        }
        catch
        {
            // Ignore MongoDB sync error
        }
    }
}

internal record TrackedEntityState(object Entity, EntityState State);
