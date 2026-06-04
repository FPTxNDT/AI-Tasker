using System;

namespace AITasker.Domain.Entities;

public class TransactionLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    public Guid? SourceWalletId { get; set; }
    public Wallet? SourceWallet { get; set; }

    public Guid? DestinationWalletId { get; set; }
    public Wallet? DestinationWallet { get; set; }

    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty; // TopUp, Withdraw, Deposit, Release, Refund
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
