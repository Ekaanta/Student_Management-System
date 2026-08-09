using AssignmentSystem.Domain.Enums;

namespace AssignmentSystem.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password, string FirstName, string LastName, UserRole Role);

public record AuthResponse(
    string Token,
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    string? ProfilePictureUrl
);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAtUtc,
    string? ProfilePictureUrl
);

public record UserProfileDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    string? ProfilePictureUrl,
    DateTime CreatedAtUtc
);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? ProfilePictureUrl,
    string? CurrentPassword,
    string? NewPassword
);
