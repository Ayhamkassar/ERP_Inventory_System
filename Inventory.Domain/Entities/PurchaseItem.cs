namespace Inventory.Domain.Entities;

public class PurchaseItem : BaseEntity
{
    public Guid PurchaseId { get; set; }

    public Purchase Purchase { get; set; } = null!;


    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;


    public int Quantity { get; set; }


    public decimal UnitCost { get; set; }
}