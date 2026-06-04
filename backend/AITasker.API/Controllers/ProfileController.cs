using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using AITasker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { Message = "Vui lòng chọn một file ảnh hợp lệ." });
        }

        // Limit file size to 5MB
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { Message = "Kích thước ảnh không được vượt quá 5MB." });
        }

        // Validate file extension
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        if (Array.IndexOf(allowedExtensions, ext) < 0)
        {
            return BadRequest(new { Message = "Chỉ chấp nhận các định dạng file ảnh: .jpg, .jpeg, .png, .gif" });
        }

        try
        {
            // Get current user ID
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng xác thực." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new { Message = "Người dùng không tồn tại." });
            }

            // Create directories if not exist
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Delete old avatar file if exists
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldPath))
                {
                    try
                    {
                        System.IO.File.Delete(oldPath);
                    }
                    catch
                    {
                        // Ignore file deletion errors
                    }
                }
            }

            // Generate unique file name
            var uniqueFileName = $"avatar_{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Save relative URL
            var relativeUrl = $"/uploads/avatars/{uniqueFileName}";
            user.AvatarUrl = relativeUrl;
            await _context.SaveChangesAsync();

            // Construct absolute URL for the client response
            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}{request.PathBase}";
            var absoluteUrl = $"{baseUrl}{relativeUrl}";

            return Ok(new
            {
                Message = "Tải ảnh đại diện lên thành công.",
                AvatarUrl = absoluteUrl
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi tải ảnh lên.", Details = ex.Message });
        }
    }

    [HttpGet("avatar/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvatar(Guid userId)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || string.IsNullOrEmpty(user.AvatarUrl))
            {
                return NotFound(new { Message = "Người dùng không tồn tại hoặc chưa cài đặt ảnh đại diện." });
            }

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/'));
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { Message = "Ảnh đại diện không tồn tại trên server." });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var contentType = GetContentType(filePath);

            return File(fileBytes, contentType);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy ảnh đại diện.", Details = ex.Message });
        }
    }

    private string GetContentType(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        return ext switch
        {
            ".png" => "image/png",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }
}
