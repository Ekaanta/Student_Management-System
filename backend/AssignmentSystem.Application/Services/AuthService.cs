using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public AuthService(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator tokenGenerator)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("User account is inactive.");
        }

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.ProfilePictureUrl);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _dbContext.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

        if (existingUser)
        {
            throw new AppException("User with this email already exists. Try signing in with password 'Password123!' or use a different email.", 409);
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Role = request.Role,
            IsActive = true
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.ProfilePictureUrl);
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
        {
            throw new AppException("User profile not found.", 404);
        }

        return new UserProfileDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.ProfilePictureUrl,
            user.CreatedAtUtc
        );
    }

    public async Task<AuthResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null)
        {
            throw new AppException("User profile not found.", 404);
        }

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        {
            throw new AppException("First name and Last name are required.", 400);
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.ProfilePictureUrl = request.ProfilePictureUrl?.Trim();
        user.UpdatedAtUtc = DateTime.UtcNow;

        // Password change logic if provided
        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || !_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                throw new AppException("Current password is required and must be correct to change password.", 400);
            }
            if (request.NewPassword.Length < 6)
            {
                throw new AppException("New password must be at least 6 characters long.", 400);
            }
            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.ProfilePictureUrl);
    }
}
