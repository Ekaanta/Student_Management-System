using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using AssignmentSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;

namespace AssignmentSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMongoDbContext? _mongoDbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public AuthService(
        IApplicationDbContext dbContext,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator tokenGenerator,
        IMongoDbContext? mongoDbContext = null)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
        _mongoDbContext = mongoDbContext;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        User? user = null;

        try
        {
            user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
        }
        catch
        {
            // Ignore DbContext query error
        }

        if (user == null && _mongoDbContext != null)
        {
            try
            {
                var mongoFilter = Builders<User>.Filter.Eq(u => u.Email, normalizedEmail);
                user = await _mongoDbContext.Users.Find(mongoFilter).FirstOrDefaultAsync(cancellationToken);
            }
            catch
            {
                // Ignore Mongo DNS / SRV lookup error in cloud containers
            }
        }

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

    public async Task<UserDetailDto> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        User? user = null;

        try
        {
            user = await _dbContext.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        }
        catch
        {
            // Ignore DbContext error
        }

        if (user == null && _mongoDbContext != null)
        {
            try
            {
                user = await _mongoDbContext.Users
                    .Find(Builders<User>.Filter.Eq(u => u.Id, userId))
                    .FirstOrDefaultAsync(cancellationToken);
            }
            catch
            {
                // Ignore Mongo DNS / SRV lookup error
            }
        }

        if (user == null)
        {
            throw new NotFoundException("User", userId);
        }

        return new UserDetailDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.IsActive,
            user.ProfilePictureUrl,
            user.CreatedAtUtc
        );
    }

    public async Task<UserDetailDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User", userId);
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.ProfilePictureUrl = request.ProfilePictureUrl?.Trim();
        user.UpdatedAtUtc = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || !_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                throw new UnauthorizedException("Current password is required and must be correct to change password.");
            }

            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UserDetailDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.IsActive,
            user.ProfilePictureUrl,
            user.CreatedAtUtc
        );
    }
}
