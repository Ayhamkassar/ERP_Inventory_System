namespace Inventory.Domain.Entities;

public class TransferItem : BaseEntity
{
    public Guid TransferId { get; set; }

    public Transfer Transfer { get; set; } = null!;


    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;


    public int Quantity { get; set; }
}