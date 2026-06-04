using System.Threading.Tasks;
using AITasker.Application.DTOs.Auth;

namespace AITasker.Application.Interfaces.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> RegisterClientAsync(RegisterClientRequest request);
    Task<LoginResponse> RegisterExpertAsync(RegisterExpertRequest request);
    Task<LoginResponse> RegisterAdminAsync(RegisterAdminRequest request);
    Task CompleteExpertProfileAsync(Guid userId, CompleteExpertProfileRequest request);
}
