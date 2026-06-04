using AITasker.Domain.Entities;

namespace AITasker.Application.Interfaces.Security;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
