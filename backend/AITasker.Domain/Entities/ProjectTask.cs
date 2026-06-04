using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class ProjectTask
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public string Title { get; set; } = string.Empty; // equivalent to UseCaseName in provided script
    public string Status { get; set; } = "InProgress"; // InProgress, PendingReview, Completed, NeedRevision
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<MiniTask> MiniTasks { get; set; } = new List<MiniTask>();
}
