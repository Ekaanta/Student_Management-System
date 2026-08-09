using System.Net;
using System.Text.Json;
using AssignmentSystem.Application.DTOs;
using AssignmentSystem.Application.Exceptions;

namespace AssignmentSystem.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        int statusCode = (int)HttpStatusCode.InternalServerError;
        string title = "An error occurred while processing your request.";
        IEnumerable<string>? errors = null;

        if (exception is AppException appEx)
        {
            statusCode = appEx.StatusCode;
            title = appEx.Message;
        }

        if (exception is CustomValidationException valEx)
        {
            statusCode = valEx.StatusCode;
            title = valEx.Message;
            errors = valEx.Errors.SelectMany(kvp => kvp.Value.Select(e => $"{kvp.Key}: {e}"));
        }

        context.Response.StatusCode = statusCode;

        var response = new ApiResponse<object>(
            Success: false,
            Message: title,
            Data: null,
            Errors: errors ?? new[] { exception.Message }
        );

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}
