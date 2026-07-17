namespace Inventory.Application.DTOs.Purchases;

public class CreatePurchaseRequest
{
    public Guid SupplierId { get; set; }

    public DateTime PurchaseDate { get; set; }

    public Guid WarehouseId { get; set; }

    public List<PurchaseItemRequest> Items { get; set; }
        = new();
}