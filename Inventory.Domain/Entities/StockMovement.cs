namespace Inventory.Domain.Entities;

public class StockMovement : BaseEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid WarehouseId { get; set; }

    public Warehouse Warehouse { get; set; } = null!;

    public Guid? StockBatchId { get; set; }

    public StockBatch? StockBatch { get; set; }

    public int Quantity { get; set; }

    public MovementType MovementType { get; set; }

    public Guid ReferenceId { get; set; }
}