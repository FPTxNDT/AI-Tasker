using System;
using System.Collections.Generic;

namespace AITasker.Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;

    public Guid ExpertId { get; set; }
    public User Expert { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
