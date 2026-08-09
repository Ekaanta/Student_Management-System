using AssignmentSystem.Domain.Enums;
using AssignmentSystem.Infrastructure.Identity;
using Xunit;

namespace AssignmentSystem.UnitTests;

public class DomainRulesTests
{
    [Fact]
    public void PasswordHasher_ShouldHashAndVerifyPasswordSuccessfully()
    {
        var hasher = new PasswordHasherService();
        var rawPassword = "SecurePassword123!";

        var hash = hasher.HashPassword(rawPassword);
        var isValid = hasher.VerifyPassword(rawPassword, hash);
        var isInvalid = hasher.VerifyPassword("WrongPassword", hash);

        Assert.NotNull(hash);
        Assert.True(isValid);
        Assert.False(isInvalid);
    }

    [Theory]
    [InlineData(UserRole.Admin, "Admin")]
    [InlineData(UserRole.Teacher, "Teacher")]
    [InlineData(UserRole.Student, "Student")]
    public void UserRole_EnumValues_ShouldMatchExpectedNames(UserRole role, string expectedName)
    {
        Assert.Equal(expectedName, role.ToString());
    }
}
