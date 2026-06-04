using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Client"; // Owner, Staff, Client, Expert, Hybrid
    public string Status { get; set; } = "Active"; // Active, Inactive, Banned
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ExpertProfile? ExpertProfile { get; set; }
    public Wallet? Wallet { get; set; }
    public ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Project> ClientProjects { get; set; } = new List<Project>();
    public ICollection<Project> ExpertProjects { get; set; } = new List<Project>();
}
