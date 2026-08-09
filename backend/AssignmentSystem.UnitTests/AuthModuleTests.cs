using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Security.Claims;
using AssignmentSystem.Api.Controllers;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Services;
using AssignmentSystem.Domain.Entities;
using AssignmentSystem.Domain.Enums;
using AssignmentSystem.Infrastructure.Data;
using AssignmentSystem.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace AssignmentSystem.UnitTests;

public class AuthModuleTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private IConfiguration GetMockConfiguration()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Secret", "SuperSecretKeyForJwtTokenGenerationThatIsAtLeast32BytesLong!" },
            { "Jwt:Issuer", "AssignmentSystem" },
            { "Jwt:Audience", "AssignmentSystemApp" },
            { "Jwt:ExpirationInMinutes", "60" }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsAuthResponseAndJwtToken()
    {
        using var dbContext = GetInMemoryDbContext();
        var hasher = new PasswordHasherService();
        var jwtGenerator = new JwtTokenGenerator(GetMockConfiguration());
        var authService = new AuthService(dbContext, hasher, jwtGenerator);

        var hashedPassword = hasher.HashPassword("Password123!");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "auth.user@example.com",
            PasswordHash = hashedPassword,
            FirstName = "Auth",
            LastName = "User",
            Role = UserRole.Student,
            IsActive = true
        };
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        var response = await authService.LoginAsync(new LoginRequest("auth.user@example.com", "Password123!"));

        Assert.NotNull(response);
        Assert.NotNull(response.Token);
        Assert.Equal("auth.user@example.com", response.Email);
        Assert.Equal(UserRole.Student, response.Role);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(response.Token);
        Assert.Equal("AssignmentSystem", jwtToken.Issuer);
        Assert.Contains(jwtToken.Claims, c => c.Value == "auth.user@example.com");
    }

    [Fact]
    public async Task Login_InvalidPassword_ThrowsUnauthorizedException()
    {
        using var dbContext = GetInMemoryDbContext();
        var hasher = new PasswordHasherService();
        var jwtGenerator = new JwtTokenGenerator(GetMockConfiguration());
        var authService = new AuthService(dbContext, hasher, jwtGenerator);

        var hashedPassword = hasher.HashPassword("Password123!");
        dbContext.Users.Add(new User
        {
            Email = "invalid.pwd@example.com",
            PasswordHash = hashedPassword,
            FirstName = "Invalid",
            LastName = "Pwd",
            Role = UserRole.Teacher,
            IsActive = true
        });
        await dbContext.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => authService.LoginAsync(new LoginRequest("invalid.pwd@example.com", "WrongPassword!")));
        Assert.Equal(401, ex.StatusCode);
    }

    [Fact]
    public async Task Login_InactiveUser_ThrowsUnauthorizedException()
    {
        using var dbContext = GetInMemoryDbContext();
        var hasher = new PasswordHasherService();
        var jwtGenerator = new JwtTokenGenerator(GetMockConfiguration());
        var authService = new AuthService(dbContext, hasher, jwtGenerator);

        var hashedPassword = hasher.HashPassword("Password123!");
        dbContext.Users.Add(new User
        {
            Email = "deactivated@example.com",
            PasswordHash = hashedPassword,
            FirstName = "Inactive",
            LastName = "User",
            Role = UserRole.Student,
            IsActive = false
        });
        await dbContext.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => authService.LoginAsync(new LoginRequest("deactivated@example.com", "Password123!")));
        Assert.Equal(401, ex.StatusCode);
        Assert.Contains("inactive", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void AuthControllers_ShouldHaveCorrectAuthorizationAttributes()
    {
        var teacherControllerType = typeof(TeacherController);
        var teacherAttribute = teacherControllerType.GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(teacherAttribute);
        Assert.Equal("Teacher,Admin", teacherAttribute.Roles);

        var studentControllerType = typeof(StudentController);
        var studentAttribute = studentControllerType.GetCustomAttribute<AuthorizeAttribute>();
        Assert.NotNull(studentAttribute);
        Assert.Equal("Student,Admin", studentAttribute.Roles);
    }
}
