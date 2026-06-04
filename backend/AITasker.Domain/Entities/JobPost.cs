using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class JobPost
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public DateTime Deadline { get; set; }
    public string Status { get; set; } = "Published"; // Published, Closed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? AICategoryDomainId { get; set; }
    public AICategoryDomain? AICategoryDomain { get; set; }

    // Navigation properties
    public ICollection<JobRequirement> JobRequirements { get; set; } = new List<JobRequirement>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
}
