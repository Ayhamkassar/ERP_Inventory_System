namespace Inventory.Application.DTOs.Purchases;

public class PurchaseItemRequest
{
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitCost { get; set; }
}