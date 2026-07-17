namespace Inventory.Domain.Entities;

public class StockBatch : BaseEntity
{
    public Guid PurchaseItemId { get; set; }

    public PurchaseItem PurchaseItem { get; set; } = null!;

    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid WarehouseId { get; set; }

    public Warehouse Warehouse { get; set; } = null!;

    public int Quantity { get; set; }

    public int RemainingQuantity { get; set; }

    public decimal UnitCost { get; set; }

    public ICollection<SaleItemAllocation> Allocations { get; set; }
    = new List<SaleItemAllocation>();
}