using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class Skill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<ExpertProfile> ExpertProfiles { get; set; } = new List<ExpertProfile>();
    public ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
