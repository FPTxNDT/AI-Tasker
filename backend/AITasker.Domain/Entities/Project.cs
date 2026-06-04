using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? JobPostId { get; set; }
    public JobPost? JobPost { get; set; }

    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;

    public Guid ExpertId { get; set; }
    public User Expert { get; set; } = null!;

    public decimal EscrowBalance { get; set; } = 0.00m;
    public string Status { get; set; } = "InProgress"; // InProgress, Closed
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }

    public string? ProjectLink { get; set; } // Column containing the project link

    // Navigation properties
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
}
