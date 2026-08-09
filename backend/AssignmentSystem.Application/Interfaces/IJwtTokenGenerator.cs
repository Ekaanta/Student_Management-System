using AssignmentSystem.Domain.Entities;

namespace AssignmentSystem.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
