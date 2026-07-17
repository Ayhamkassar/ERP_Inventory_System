namespace Inventory.Domain.Entities;

public class SaleItemAllocation : BaseEntity
{
    public Guid SaleItemId { get; set; }

    public SaleItem SaleItem { get; set; } = null!;


    public Guid StockBatchId { get; set; }

    public StockBatch StockBatch { get; set; } = null!;


    public int Quantity { get; set; }
}