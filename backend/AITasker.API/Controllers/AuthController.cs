using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AITasker.Application.DTOs.Auth;
using AITasker.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITasker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi đăng nhập.", Details = ex.Message });
        }
    }

    [HttpPost("register/client")]
    public async Task<IActionResult> RegisterClient([FromBody] RegisterClientRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _authService.RegisterClientAsync(request);
            return StatusCode(201, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi đăng ký Client.", Details = ex.Message });
        }
    }

    [HttpPost("register/expert")]
    public async Task<IActionResult> RegisterExpert([FromBody] RegisterExpertRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _authService.RegisterExpertAsync(request);
            return StatusCode(201, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi đăng ký Expert.", Details = ex.Message });
        }
    }

    [HttpPost("register/admin")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _authService.RegisterAdminAsync(request);
            return StatusCode(201, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi đăng ký Admin.", Details = ex.Message });
        }
    }

    [HttpPost("complete-profile")]
    [Authorize(Roles = "Expert")]
    public async Task<IActionResult> CompleteExpertProfile([FromBody] CompleteExpertProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { Message = "Không tìm thấy thông tin người dùng xác thực." });
            }

            await _authService.CompleteExpertProfileAsync(userId, request);
            return Ok(new { Message = "Cấu hình Expert Profile thành công." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Đã xảy ra lỗi hệ thống khi hoàn tất hồ sơ.", Details = ex.Message });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // JWT is stateless; clients logout by discarding the token locally.
        // Returning 200 OK communicates that the server acknowledged the request successfully.
        return Ok(new { Message = "Đăng xuất thành công. Vui lòng hủy JWT token phía client." });
    }
}
