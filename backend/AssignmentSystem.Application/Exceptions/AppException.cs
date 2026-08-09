namespace AssignmentSystem.Application.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string name, object key) : base($"{name} with key ({key}) was not found.", 404)
    {
    }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized access.") : base(message, 401)
    {
    }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Forbidden access.") : base(message, 403)
    {
    }
}

public class CustomValidationException : AppException
{
    public IDictionary<string, string[]> Errors { get; }

    public CustomValidationException(IDictionary<string, string[]> errors) : base("One or more validation failures have occurred.", 422)
    {
        Errors = errors;
    }
}
