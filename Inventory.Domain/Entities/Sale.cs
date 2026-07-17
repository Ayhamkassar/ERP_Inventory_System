namespace Inventory.Domain.Entities;

public class Sale : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime SaleDate { get; set; }

    public Guid WarehouseId { get; set; }

    public Warehouse Warehouse { get; set; }

    public ICollection<SaleItem> Items { get; set; }
        = new List<SaleItem>();
}