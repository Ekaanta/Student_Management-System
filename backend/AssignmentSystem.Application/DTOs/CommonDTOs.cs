namespace AssignmentSystem.Application.DTOs;

public record ApiResponse<T>(bool Success, string Message, T? Data, IEnumerable<string>? Errors = null);
