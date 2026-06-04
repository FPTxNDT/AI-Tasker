using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AITasker.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AITasker.API.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ExpertProfileRequiredAttribute : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;

        if (user.Identity?.IsAuthenticated == true)
        {
            var role = user.FindFirst(ClaimTypes.Role)?.Value;

            // Only enforce profile requirement on accounts with the "Expert" role
            if (role == "Expert")
            {
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                    
                    // Check if the expert has a profile
                    var hasProfile = await dbContext.ExpertProfiles.AnyAsync(ep => ep.UserId == userId);
                    if (!hasProfile)
                    {
                        context.Result = new ObjectResult(new
                        {
                            message = "Tài khoản Expert chưa hoàn thiện hồ sơ cá nhân. Vui lòng cấu hình Expert Profile trước khi thực hiện hành động này."
                        })
                        {
                            StatusCode = StatusCodes.Status403Forbidden
                        };
                        return;
                    }
                }
            }
        }

        await next();
    }
}
