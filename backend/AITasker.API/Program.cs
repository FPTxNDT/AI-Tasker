using System;
using System.Text;
using AITasker.Application.Interfaces.Security;
using AITasker.Application.Interfaces.Services;
using AITasker.Infrastructure.Data;
using AITasker.Infrastructure.Security;
using AITasker.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtKey = builder.Configuration["JwtSettings:Key"];
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? "AITaskerSuperSecretJWTEncryptionKey2026!"))
    };
});

// Configure DI
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure CORS to allow any origin, header, and method
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo { Title = "AITasker API", Version = "v1" });
    
    var securityScheme = new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Chỉ cần nhập trực tiếp mã JWT Token của bạn (KHÔNG bao gồm chữ 'Bearer' và KHÔNG bao gồm dấu ngoặc nhọn { }). Swagger sẽ tự động thêm tiền tố Bearer cho bạn. Ví dụ: eyJhbGciOi...",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    c.AddSecurityRequirement(document => new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer", document),
            new List<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AITasker API v1"));
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed test accounts if DB is empty
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    if (!context.Users.Any())
    {
        // Add domains
        var nlpDomain = new AITasker.Domain.Entities.AICategoryDomain { Name = "Natural Language Processing (NLP)" };
        var cvDomain = new AITasker.Domain.Entities.AICategoryDomain { Name = "Computer Vision (CV)" };
        context.AICategoryDomains.AddRange(nlpDomain, cvDomain);

        // Add skills
        var pythonSkill = new AITasker.Domain.Entities.Skill { Name = "Python" };
        var pytorchSkill = new AITasker.Domain.Entities.Skill { Name = "PyTorch" };
        var llmSkill = new AITasker.Domain.Entities.Skill { Name = "LLM Fine-tuning" };
        context.Skills.AddRange(pythonSkill, pytorchSkill, llmSkill);

        // Add client
        var clientUser = new AITasker.Domain.Entities.User
        {
            Email = "client@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Client",
            Role = "Client",
            Status = "Active"
        };
        clientUser.Wallet = new AITasker.Domain.Entities.Wallet { User = clientUser, Balance = 1000.00m };
        context.Users.Add(clientUser);

        // Add expert
        var expertUser = new AITasker.Domain.Entities.User
        {
            Email = "expert@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Expert",
            Role = "Expert",
            Status = "Active"
        };
        expertUser.Wallet = new AITasker.Domain.Entities.Wallet { User = expertUser, Balance = 0.00m };
        expertUser.ExpertProfile = new AITasker.Domain.Entities.ExpertProfile
        {
            User = expertUser,
            JobTitle = "Senior AI Engineer",
            Major = "Computer Science",
            Bio = "I am a senior AI engineer specializing in NLP and LLMs.",
            PortfolioUrls = "https://github.com/expert",
            Location = "Ho Chi Minh City",
            ReputationCredit = 5.00m,
            SuccessRate = 100.0
        };
        
        // Associate skills & domains to expert profile
        expertUser.ExpertProfile.Skills.Add(pythonSkill);
        expertUser.ExpertProfile.Skills.Add(pytorchSkill);
        expertUser.ExpertProfile.Skills.Add(llmSkill);
        expertUser.ExpertProfile.AICategoryDomains.Add(nlpDomain);
        expertUser.ExpertProfile.AICategoryDomains.Add(cvDomain);
        context.Users.Add(expertUser);
        
        // Add Owner
        var ownerUser = new AITasker.Domain.Entities.User
        {
            Email = "owner@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Owner",
            Role = "Owner",
            Status = "Active"
        };
        ownerUser.Wallet = new AITasker.Domain.Entities.Wallet { User = ownerUser, Balance = 0.00m };
        context.Users.Add(ownerUser);

        // Add Admin
        var adminUser = new AITasker.Domain.Entities.User
        {
            Email = "admin@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Admin",
            Role = "Admin",
            Status = "Active"
        };
        adminUser.Wallet = new AITasker.Domain.Entities.Wallet { User = adminUser, Balance = 0.00m };
        context.Users.Add(adminUser);

        // Add JobPosts
        var job1 = new AITasker.Domain.Entities.JobPost
        {
            Client = clientUser,
            Title = "Xây dựng mô hình Chatbot hỗ trợ tư vấn tuyển sinh",
            Description = "Yêu cầu xây dựng Chatbot RAG sử dụng LangChain, Vector Database và OpenAI API. Có giao diện Web đơn giản.",
            Budget = 500.00m,
            Deadline = DateTime.UtcNow.AddDays(30),
            Status = "Published",
            AICategoryDomain = nlpDomain
        };
        job1.Skills.Add(pythonSkill);
        job1.Skills.Add(llmSkill);
        
        var job2 = new AITasker.Domain.Entities.JobPost
        {
            Client = clientUser,
            Title = "Nhận diện biển số xe bằng YOLOv8",
            Description = "Xây dựng ứng dụng Python nhận diện biển số xe từ camera giám sát thời gian thực, độ chính xác > 95%.",
            Budget = 300.00m,
            Deadline = DateTime.UtcNow.AddDays(15),
            Status = "Published",
            AICategoryDomain = cvDomain
        };
        job2.Skills.Add(pythonSkill);
        job2.Skills.Add(pytorchSkill);

        context.JobPosts.AddRange(job1, job2);

        // Add Proposals
        var proposal1 = new AITasker.Domain.Entities.Proposal
        {
            JobPost = job1,
            Expert = expertUser,
            BidAmount = 480.00m,
            CoverLetter = "Chào bạn, tôi đã làm nhiều dự án chatbot RAG tuyển sinh tương tự. Rất mong được hợp tác.",
            Status = "Pending"
        };

        var proposal2 = new AITasker.Domain.Entities.Proposal
        {
            JobPost = job2,
            Expert = expertUser,
            BidAmount = 300.00m,
            CoverLetter = "Chào bạn, tôi có kinh nghiệm tối ưu và triển khai YOLOv5/v8 trên các thiết bị edge. Tôi có thể bắt đầu ngay.",
            Status = "Accepted"
        };

        context.Proposals.AddRange(proposal1, proposal2);

        // Add Project
        var project = new AITasker.Domain.Entities.Project
        {
            JobPost = job2,
            Client = clientUser,
            Expert = expertUser,
            EscrowBalance = 300.00m,
            Status = "InProgress",
            StartDate = DateTime.UtcNow,
            ProjectLink = "https://github.com/expert/yolov8-license-plate"
        };
        project.Skills.Add(pythonSkill);
        project.Skills.Add(pytorchSkill);

        context.Projects.Add(project);

        context.SaveChanges();
    }

    // Ensure standard users exist individually (in case DB was already seeded previously)
    var clientExists = context.Users.Any(u => u.Email == "client@aitasker.com");
    if (!clientExists)
    {
        var clientUser = new AITasker.Domain.Entities.User
        {
            Email = "client@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Client",
            Role = "Client",
            Status = "Active"
        };
        clientUser.Wallet = new AITasker.Domain.Entities.Wallet { User = clientUser, Balance = 1000.00m };
        context.Users.Add(clientUser);
    }

    var expertExists = context.Users.Any(u => u.Email == "expert@aitasker.com");
    if (!expertExists)
    {
        var expertUser = new AITasker.Domain.Entities.User
        {
            Email = "expert@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Expert",
            Role = "Expert",
            Status = "Active"
        };
        expertUser.Wallet = new AITasker.Domain.Entities.Wallet { User = expertUser, Balance = 0.00m };
        expertUser.ExpertProfile = new AITasker.Domain.Entities.ExpertProfile
        {
            User = expertUser,
            JobTitle = "Senior AI Engineer",
            Major = "Computer Science",
            Bio = "I am a senior AI engineer specializing in NLP and LLMs.",
            PortfolioUrls = "https://github.com/expert",
            Location = "Ho Chi Minh City",
            ReputationCredit = 5.00m,
            SuccessRate = 100.0
        };
        context.Users.Add(expertUser);
    }

    var ownerExists = context.Users.Any(u => u.Email == "owner@aitasker.com");
    if (!ownerExists)
    {
        var ownerUser = new AITasker.Domain.Entities.User
        {
            Email = "owner@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Owner",
            Role = "Owner",
            Status = "Active"
        };
        ownerUser.Wallet = new AITasker.Domain.Entities.Wallet { User = ownerUser, Balance = 0.00m };
        context.Users.Add(ownerUser);
    }

    var adminExists = context.Users.Any(u => u.Email == "admin@aitasker.com");
    if (!adminExists)
    {
        var adminUser = new AITasker.Domain.Entities.User
        {
            Email = "admin@aitasker.com",
            PasswordHash = passwordHasher.Hash("123456"),
            FullName = "Test Admin",
            Role = "Admin",
            Status = "Active"
        };
        adminUser.Wallet = new AITasker.Domain.Entities.Wallet { User = adminUser, Balance = 0.00m };
        context.Users.Add(adminUser);
    }

    if (!clientExists || !expertExists || !ownerExists || !adminExists)
    {
        context.SaveChanges();
    }
}

app.Run();
