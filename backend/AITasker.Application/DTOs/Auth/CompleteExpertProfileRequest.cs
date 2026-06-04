using System.ComponentModel.DataAnnotations;

namespace AITasker.Application.DTOs.Auth;

public class CompleteExpertProfileRequest
{
    [Required(ErrorMessage = "Tiêu đề công việc không được để trống")]
    public string JobTitle { get; set; } = string.Empty;

    [Required(ErrorMessage = "Chuyên ngành không được để trống")]
    public string Major { get; set; } = string.Empty;

    public string Bio { get; set; } = string.Empty;

    public string? PortfolioUrls { get; set; }

    public string? Location { get; set; }
}
