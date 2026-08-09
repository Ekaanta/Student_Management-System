using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Application.Services;

public class AdminService : IAdminService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;

    public AdminService(IApplicationDbContext dbContext, IPasswordHasher passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<AdminOverviewDto> GetOverviewStatsAsync(CancellationToken cancellationToken = default)
    {
        var totalUsers = await _dbContext.Users.CountAsync(cancellationToken);
        var totalTeachers = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Teacher, cancellationToken);
        var totalStudents = await _dbContext.Users.CountAsync(u => u.Role == UserRole.Student, cancellationToken);
        var totalClasses = await _dbContext.SchoolClasses.CountAsync(cancellationToken);
        var totalSubjects = await _dbContext.Subjects.CountAsync(cancellationToken);
        var totalAssignments = await _dbContext.Assignments.CountAsync(cancellationToken);
        var totalSubmissions = await _dbContext.Submissions.CountAsync(cancellationToken);

        return new AdminOverviewDto(
            totalUsers,
            totalTeachers,
            totalStudents,
            totalClasses,
            totalSubjects,
            totalAssignments,
            totalSubmissions
        );
    }

    #region User Management

    public async Task<IEnumerable<UserDetailDto>> GetUsersAsync(UserRole? roleFilter = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Users.AsQueryable();

        if (roleFilter.HasValue)
        {
            query = query.Where(u => u.Role == roleFilter.Value);
        }

        return await query
            .OrderByDescending(u => u.CreatedAtUtc)
            .Select(u => new UserDetailDto(u.Id, u.Email, u.FirstName, u.LastName, u.Role, u.IsActive, u.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<UserDetailDto> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) throw new NotFoundException(nameof(User), id);

        return new UserDetailDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.IsActive, user.CreatedAtUtc);
    }

    public async Task<UserDetailDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.ToLowerInvariant();
        if (await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken))
        {
            throw new AppException("User with this email already exists.", 409);
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            IsActive = true
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UserDetailDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.IsActive, user.CreatedAtUtc);
    }

    public async Task<UserDetailDto> UpdateUserAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) throw new NotFoundException(nameof(User), id);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Role = request.Role;
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UserDetailDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.IsActive, user.CreatedAtUtc);
    }

    public async Task<UserDetailDto> ToggleUserStatusAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) throw new NotFoundException(nameof(User), id);

        user.IsActive = !user.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UserDetailDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.IsActive, user.CreatedAtUtc);
    }

    public async Task DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null) throw new NotFoundException(nameof(User), id);

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Class Management

    public async Task<IEnumerable<SchoolClassDto>> GetClassesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SchoolClasses
            .Include(c => c.Enrollments)
            .OrderBy(c => c.Name)
            .Select(c => new SchoolClassDto(c.Id, c.Name, c.Code, c.AcademicYear, c.Enrollments.Count, c.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<SchoolClassDto> GetClassByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var c = await _dbContext.SchoolClasses
            .Include(x => x.Enrollments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (c == null) throw new NotFoundException(nameof(SchoolClass), id);

        return new SchoolClassDto(c.Id, c.Name, c.Code, c.AcademicYear, c.Enrollments.Count, c.CreatedAtUtc);
    }

    public async Task<SchoolClassDto> CreateClassAsync(CreateSchoolClassRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedCode = request.Code.ToUpperInvariant();
        if (await _dbContext.SchoolClasses.AnyAsync(c => c.Code == normalizedCode, cancellationToken))
        {
            throw new AppException("Class with this unique code already exists.", 409);
        }

        var schoolClass = new SchoolClass
        {
            Name = request.Name,
            Code = normalizedCode,
            AcademicYear = request.AcademicYear
        };

        _dbContext.SchoolClasses.Add(schoolClass);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SchoolClassDto(schoolClass.Id, schoolClass.Name, schoolClass.Code, schoolClass.AcademicYear, 0, schoolClass.CreatedAtUtc);
    }

    public async Task<SchoolClassDto> UpdateClassAsync(Guid id, UpdateSchoolClassRequest request, CancellationToken cancellationToken = default)
    {
        var schoolClass = await _dbContext.SchoolClasses
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (schoolClass == null) throw new NotFoundException(nameof(SchoolClass), id);

        var normalizedCode = request.Code.ToUpperInvariant();
        if (schoolClass.Code != normalizedCode && await _dbContext.SchoolClasses.AnyAsync(c => c.Code == normalizedCode, cancellationToken))
        {
            throw new AppException("Another class with this unique code already exists.", 409);
        }

        schoolClass.Name = request.Name;
        schoolClass.Code = normalizedCode;
        schoolClass.AcademicYear = request.AcademicYear;
        schoolClass.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SchoolClassDto(schoolClass.Id, schoolClass.Name, schoolClass.Code, schoolClass.AcademicYear, schoolClass.Enrollments.Count, schoolClass.CreatedAtUtc);
    }

    public async Task DeleteClassAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var schoolClass = await _dbContext.SchoolClasses.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (schoolClass == null) throw new NotFoundException(nameof(SchoolClass), id);

        _dbContext.SchoolClasses.Remove(schoolClass);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Subject Management

    public async Task<IEnumerable<SubjectDto>> GetSubjectsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Subjects
            .OrderBy(s => s.Name)
            .Select(s => new SubjectDto(s.Id, s.Name, s.Code, s.Description, s.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<SubjectDto> GetSubjectByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var subject = await _dbContext.Subjects.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (subject == null) throw new NotFoundException(nameof(Subject), id);

        return new SubjectDto(subject.Id, subject.Name, subject.Code, subject.Description, subject.CreatedAtUtc);
    }

    public async Task<SubjectDto> CreateSubjectAsync(CreateSubjectRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedCode = request.Code.ToUpperInvariant();
        if (await _dbContext.Subjects.AnyAsync(s => s.Code == normalizedCode, cancellationToken))
        {
            throw new AppException("Subject with this code already exists.", 409);
        }

        var subject = new Subject
        {
            Name = request.Name,
            Code = normalizedCode,
            Description = request.Description
        };

        _dbContext.Subjects.Add(subject);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SubjectDto(subject.Id, subject.Name, subject.Code, subject.Description, subject.CreatedAtUtc);
    }

    public async Task<SubjectDto> UpdateSubjectAsync(Guid id, UpdateSubjectRequest request, CancellationToken cancellationToken = default)
    {
        var subject = await _dbContext.Subjects.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (subject == null) throw new NotFoundException(nameof(Subject), id);

        var normalizedCode = request.Code.ToUpperInvariant();
        if (subject.Code != normalizedCode && await _dbContext.Subjects.AnyAsync(s => s.Code == normalizedCode, cancellationToken))
        {
            throw new AppException("Another subject with this code already exists.", 409);
        }

        subject.Name = request.Name;
        subject.Code = normalizedCode;
        subject.Description = request.Description;
        subject.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SubjectDto(subject.Id, subject.Name, subject.Code, subject.Description, subject.CreatedAtUtc);
    }

    public async Task DeleteSubjectAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var subject = await _dbContext.Subjects.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (subject == null) throw new NotFoundException(nameof(Subject), id);

        _dbContext.Subjects.Remove(subject);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Teacher Assignment Management

    public async Task<IEnumerable<ClassSubjectDetailDto>> GetTeacherAssignmentsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .Include(cs => cs.Teacher)
            .OrderBy(cs => cs.Class.Name)
            .ThenBy(cs => cs.Subject.Name)
            .Select(cs => new ClassSubjectDetailDto(
                cs.Id,
                cs.ClassId,
                cs.Class.Name,
                cs.Class.Code,
                cs.SubjectId,
                cs.Subject.Name,
                cs.Subject.Code,
                cs.TeacherId,
                $"{cs.Teacher.FirstName} {cs.Teacher.LastName}",
                cs.Teacher.Email
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ClassSubjectDetailDto> AssignTeacherAsync(AssignTeacherRequest request, CancellationToken cancellationToken = default)
    {
        var schoolClass = await _dbContext.SchoolClasses.FirstOrDefaultAsync(c => c.Id == request.ClassId, cancellationToken);
        if (schoolClass == null) throw new NotFoundException(nameof(SchoolClass), request.ClassId);

        var subject = await _dbContext.Subjects.FirstOrDefaultAsync(s => s.Id == request.SubjectId, cancellationToken);
        if (subject == null) throw new NotFoundException(nameof(Subject), request.SubjectId);

        var teacher = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == request.TeacherId, cancellationToken);
        if (teacher == null) throw new NotFoundException("Teacher User", request.TeacherId);

        if (teacher.Role != UserRole.Teacher)
        {
            throw new AppException($"User ({teacher.Email}) is not a Teacher. Only users with Teacher role can be assigned to classes.", 400);
        }

        var existingAssignment = await _dbContext.ClassSubjects
            .FirstOrDefaultAsync(cs => cs.ClassId == request.ClassId && cs.SubjectId == request.SubjectId, cancellationToken);

        if (existingAssignment != null)
        {
            existingAssignment.TeacherId = request.TeacherId;
            existingAssignment.UpdatedAtUtc = DateTime.UtcNow;
        }
        else
        {
            existingAssignment = new ClassSubject
            {
                ClassId = request.ClassId,
                SubjectId = request.SubjectId,
                TeacherId = request.TeacherId
            };
            _dbContext.ClassSubjects.Add(existingAssignment);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ClassSubjectDetailDto(
            existingAssignment.Id,
            schoolClass.Id,
            schoolClass.Name,
            schoolClass.Code,
            subject.Id,
            subject.Name,
            subject.Code,
            teacher.Id,
            $"{teacher.FirstName} {teacher.LastName}",
            teacher.Email
        );
    }

    public async Task RemoveTeacherAssignmentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var assignment = await _dbContext.ClassSubjects.FirstOrDefaultAsync(cs => cs.Id == id, cancellationToken);
        if (assignment == null) throw new NotFoundException(nameof(ClassSubject), id);

        _dbContext.ClassSubjects.Remove(assignment);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    #endregion
}
