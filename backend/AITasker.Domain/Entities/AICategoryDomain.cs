using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class AICategoryDomain
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
    public ICollection<ExpertProfile> ExpertProfiles { get; set; } = new List<ExpertProfile>();
}
