using System.Reflection;
using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Application.Services;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using AssignmentSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace AssignmentSystem.UnitTests;

public class AdminModuleTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public void AdminController_ShouldHaveAdminAuthorizeAttribute()
    {
        var controllerType = typeof(AdminController);
        var authorizeAttribute = controllerType.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorizeAttribute);
        Assert.Equal("Admin", authorizeAttribute.Roles);
    }

    [Fact]
    public async Task CreateUserAsync_DuplicateEmail_ThrowsAppExceptionWith409()
    {
        using var dbContext = GetInMemoryDbContext();
        var mockHasher = new Mock<IPasswordHasher>();
        mockHasher.Setup(h => h.HashPassword(It.IsAny<string>())).Returns("hashed_pwd");

        var adminService = new AdminService(dbContext, mockHasher.Object);

        dbContext.Users.Add(new User
        {
            Email = "duplicate@school.com",
            PasswordHash = "hash",
            FirstName = "John",
            LastName = "Doe",
            Role = UserRole.Student
        });
        await dbContext.SaveChangesAsync();

        var request = new CreateUserRequest("duplicate@school.com", "Secret123", "Jane", "Doe", UserRole.Student);

        var ex = await Assert.ThrowsAsync<AppException>(() => adminService.CreateUserAsync(request));
        Assert.Equal(409, ex.StatusCode);
    }

    [Fact]
    public async Task CreateClassAsync_DuplicateCode_ThrowsAppExceptionWith409()
    {
        using var dbContext = GetInMemoryDbContext();
        var mockHasher = new Mock<IPasswordHasher>();
        var adminService = new AdminService(dbContext, mockHasher.Object);

        dbContext.SchoolClasses.Add(new SchoolClass
        {
            Name = "Grade 10",
            Code = "G10A",
            AcademicYear = "2026"
        });
        await dbContext.SaveChangesAsync();

        var request = new CreateSchoolClassRequest("Grade 10 Section B", "G10A", "2026");

        var ex = await Assert.ThrowsAsync<AppException>(() => adminService.CreateClassAsync(request));
        Assert.Equal(409, ex.StatusCode);
    }

    [Fact]
    public async Task AssignTeacherAsync_UserIsNotTeacher_ThrowsAppException()
    {
        using var dbContext = GetInMemoryDbContext();
        var mockHasher = new Mock<IPasswordHasher>();
        var adminService = new AdminService(dbContext, mockHasher.Object);

        var studentUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "student@school.com",
            PasswordHash = "hash",
            FirstName = "Alice",
            LastName = "Smith",
            Role = UserRole.Student
        };
        var schoolClass = new SchoolClass { Id = Guid.NewGuid(), Name = "Class A", Code = "CA", AcademicYear = "2026" };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Math", Code = "MATH101", Description = "Desc" };

        dbContext.Users.Add(studentUser);
        dbContext.SchoolClasses.Add(schoolClass);
        dbContext.Subjects.Add(subject);
        await dbContext.SaveChangesAsync();

        var request = new AssignTeacherRequest(schoolClass.Id, subject.Id, studentUser.Id);

        var ex = await Assert.ThrowsAsync<AppException>(() => adminService.AssignTeacherAsync(request));
        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("not a Teacher", ex.Message);
    }
}
