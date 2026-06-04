using System;

namespace AITasker.Domain.Entities;

public class Proposal
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid JobPostId { get; set; }
    public JobPost JobPost { get; set; } = null!;

    public Guid ExpertId { get; set; }
    public User Expert { get; set; } = null!;

    public decimal BidAmount { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected, UnderReview
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
