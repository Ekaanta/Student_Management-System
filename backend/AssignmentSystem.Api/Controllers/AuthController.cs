using System.Security.Claims;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;
using AssignmentSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSystem.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("id")?.Value;

        if (Guid.TryParse(idClaim, out var userId))
        {
            return userId;
        }

        throw new AppException("Invalid authentication claims or user identity missing.", 401);
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(new ApiResponse<AuthResponse>(true, "Login successful.", result));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(new ApiResponse<AuthResponse>(true, "Registration successful.", result));
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _authService.GetProfileAsync(userId, cancellationToken);
        return Ok(new ApiResponse<UserProfileDto>(true, "Profile retrieved successfully.", result));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _authService.UpdateProfileAsync(userId, request, cancellationToken);
        return Ok(new ApiResponse<AuthResponse>(true, "Profile updated successfully.", result));
    }
}
