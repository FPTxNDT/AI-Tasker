using System;

namespace AITasker.Domain.Entities;

public class Wallet
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public decimal Balance { get; set; } = 0.00m;
}
