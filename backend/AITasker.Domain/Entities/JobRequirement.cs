using System;

namespace AITasker.Domain.Entities;

public class JobRequirement
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid JobPostId { get; set; }
    public JobPost JobPost { get; set; } = null!;

    public string UseCaseName { get; set; } = string.Empty;
    public string? Description { get; set; }
}
