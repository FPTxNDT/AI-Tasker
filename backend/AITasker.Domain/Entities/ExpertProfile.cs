using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class ExpertProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string JobTitle { get; set; } = string.Empty;
    public string Major { get; set; } = string.Empty;
    public string? Certifications { get; set; } // Stores JSON array as text
    public string Bio { get; set; } = string.Empty;
    public string? PortfolioUrls { get; set; }

    public decimal ReputationCredit { get; set; } = 5.00m;
    public string? Location { get; set; } // E.g., "San Francisco, CA"
    public double SuccessRate { get; set; } = 100.0; // E.g., 98.0%

    // Navigation properties
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();
    public ICollection<AICategoryDomain> AICategoryDomains { get; set; } = new List<AICategoryDomain>();
}
