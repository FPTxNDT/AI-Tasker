using AITasker.API.Filters;
using AITasker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("test-connection")]
    [AllowAnonymous]
    public async Task<IActionResult> TestConnection()
    {
        try
        {
            // Thử query 1 bản ghi để check DB
            var usersCount = await _context.Users.CountAsync();
            return Ok(new { Message = "Kết nối Database thành công!", TotalUsers = usersCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Lỗi kết nối DB", Error = ex.Message });
        }
    }

    [HttpGet("test-expert-profile")]
    [Authorize]
    [ExpertProfileRequired]
    public IActionResult TestExpertProfile()
    {
        return Ok(new { Message = "Truy cập thành công! Bạn là Client hoặc Expert đã hoàn thành hồ sơ." });
    }

    [HttpGet("getAll")]
    [Authorize(Roles = "Admin,Owner")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.Status,
                    u.AvatarUrl,
                    u.CreatedAt,
                    Wallet = u.Wallet != null ? new
                    {
                        u.Wallet.Balance
                    } : null,
                    ExpertProfile = u.ExpertProfile != null ? new
                    {
                        u.ExpertProfile.JobTitle,
                        u.ExpertProfile.Major,
                        u.ExpertProfile.Certifications,
                        u.ExpertProfile.Bio,
                        u.ExpertProfile.PortfolioUrls,
                        u.ExpertProfile.ReputationCredit,
                        u.ExpertProfile.Location,
                        u.ExpertProfile.SuccessRate
                    } : null
                })
                .ToListAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách người dùng.", Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Role,
                    u.Status,
                    u.AvatarUrl,
                    u.CreatedAt,
                    Wallet = u.Wallet != null ? new
                    {
                        u.Wallet.Balance
                    } : null,
                    ExpertProfile = u.ExpertProfile != null ? new
                    {
                        u.ExpertProfile.JobTitle,
                        u.ExpertProfile.Major,
                        u.ExpertProfile.Certifications,
                        u.ExpertProfile.Bio,
                        u.ExpertProfile.PortfolioUrls,
                        u.ExpertProfile.ReputationCredit,
                        u.ExpertProfile.Location,
                        u.ExpertProfile.SuccessRate
                    } : null
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy thông tin chi tiết người dùng.", Error = ex.Message });
        }
    }

    [HttpGet("{id}/wallet")]
    public async Task<IActionResult> GetWallet(Guid id)
    {
        try
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == id);
            if (!userExists)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            var wallet = await _context.Wallets
                .Where(w => w.UserId == id)
                .Select(w => new
                {
                    w.UserId,
                    User = new { FullName = w.User.FullName },
                    w.Balance
                })
                .FirstOrDefaultAsync();

            if (wallet == null)
            {
                return NotFound(new { Message = "Người dùng chưa được cấu hình ví." });
            }

            return Ok(wallet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy thông tin ví.", Error = ex.Message });
        }
    }

    [HttpGet("{id}/expert-profile")]
    public async Task<IActionResult> GetExpertProfile(Guid id)
    {
        try
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == id);
            if (!userExists)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            var profile = await _context.ExpertProfiles
                .Where(ep => ep.UserId == id)
                .Select(ep => new
                {
                    ep.UserId,
                    User = new { FullName = ep.User.FullName },
                    ep.JobTitle,
                    ep.Major,
                    ep.Certifications,
                    ep.Bio,
                    ep.PortfolioUrls,
                    ep.ReputationCredit,
                    ep.Location,
                    ep.SuccessRate
                })
                .FirstOrDefaultAsync();

            if (profile == null)
            {
                return NotFound(new { Message = "Người dùng chưa cấu hình Expert Profile." });
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy thông tin Expert Profile.", Error = ex.Message });
        }
    }

    [HttpGet("{id}/job-posts")]
    public async Task<IActionResult> GetJobPosts(Guid id)
    {
        try
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == id);
            if (!userExists)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            var jobPosts = await _context.JobPosts
                .Where(jp => jp.ClientId == id)
                .ToListAsync();

            return Ok(jobPosts);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách job post.", Error = ex.Message });
        }
    }

    [HttpGet("{id}/proposals")]
    public async Task<IActionResult> GetProposals(Guid id)
    {
        try
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == id);
            if (!userExists)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            var proposals = await _context.Proposals
                .Where(p => p.ExpertId == id)
                .ToListAsync();

            return Ok(proposals);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách proposal.", Error = ex.Message });
        }
    }

    [HttpGet("{id}/client-projects")]
    public async Task<IActionResult> GetClientProjects(Guid id)
    {
        try
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == id);
            if (!userExists)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            var projects = await _context.Projects
                .Where(p => p.ClientId == id)
                .ToListAsync();

            return Ok(projects);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách dự án của client.", Error = ex.Message });
        }
    }

    [HttpGet("{id}/expert-projects")]
    public async Task<IActionResult> GetExpertProjects(Guid id)
    {
        try
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == id);
            if (!userExists)
            {
                return NotFound(new { Message = $"Không tìm thấy người dùng với Id: {id}" });
            }

            var projects = await _context.Projects
                .Where(p => p.ExpertId == id)
                .ToListAsync();

            return Ok(projects);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách dự án của expert.", Error = ex.Message });
        }
    }
}
