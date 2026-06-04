using System;
using System.Threading.Tasks;
using AITasker.Application.DTOs.Auth;
using AITasker.Application.Interfaces.Security;
using AITasker.Application.Interfaces.Services;
using AITasker.Domain.Entities;
using AITasker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AITasker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Find user by Email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            throw new ArgumentException("Email không tồn tại.");
        }

        if (user.Status == "Inactive")
        {
            throw new InvalidOperationException("Tài khoản chưa được kích hoạt.");
        }
        
        if (user.Status == "Banned")
        {
            throw new InvalidOperationException("Tài khoản đã bị khóa.");
        }

        // Verify password
        bool isPasswordValid = _passwordHasher.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new ArgumentException("Mật khẩu không chính xác.");
        }

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName
        };
    }

    public async Task<LoginResponse> RegisterClientAsync(RegisterClientRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new ArgumentException("Email đã tồn tại.");
        }

        // Create User
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName,
            Role = "Client",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        // Create Wallet for the user
        var wallet = new Wallet
        {
            User = user,
            Balance = 0.00m
        };
        user.Wallet = wallet;

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName
        };
    }

    public async Task<LoginResponse> RegisterExpertAsync(RegisterExpertRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new ArgumentException("Email đã tồn tại.");
        }

        // Create User
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName,
            Role = "Expert",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        // Create Wallet for the user
        var wallet = new Wallet
        {
            User = user,
            Balance = 0.00m
        };
        user.Wallet = wallet;

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName
        };
    }

    public async Task<LoginResponse> RegisterAdminAsync(RegisterAdminRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new ArgumentException("Email đã tồn tại.");
        }

        // Create User
        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FullName = request.FullName,
            Role = "Admin",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        // Create Wallet for the user
        var wallet = new Wallet
        {
            User = user,
            Balance = 0.00m
        };
        user.Wallet = wallet;

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(user);

        return new LoginResponse
        {
            Token = token,
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName
        };
    }

    public async Task CompleteExpertProfileAsync(Guid userId, CompleteExpertProfileRequest request)
    {
        var user = await _context.Users
            .Include(u => u.ExpertProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new ArgumentException("Người dùng không tồn tại.");
        }

        if (user.Role != "Expert")
        {
            throw new InvalidOperationException("Chỉ tài khoản Expert mới có thể hoàn tất Expert Profile.");
        }

        if (user.ExpertProfile != null)
        {
            // Update existing profile
            user.ExpertProfile.JobTitle = request.JobTitle;
            user.ExpertProfile.Major = request.Major;
            user.ExpertProfile.Bio = request.Bio ?? string.Empty;
            user.ExpertProfile.PortfolioUrls = request.PortfolioUrls;
            user.ExpertProfile.Location = request.Location;
        }
        else
        {
            // Create new profile
            var expertProfile = new ExpertProfile
            {
                User = user,
                JobTitle = request.JobTitle,
                Major = request.Major,
                Bio = request.Bio ?? string.Empty,
                PortfolioUrls = request.PortfolioUrls,
                Location = request.Location,
                ReputationCredit = 5.00m,
                SuccessRate = 100.0
            };
            await _context.ExpertProfiles.AddAsync(expertProfile);
        }

        await _context.SaveChangesAsync();
    }
}
