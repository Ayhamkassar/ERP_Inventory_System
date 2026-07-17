namespace Inventory.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string SKU { get; set; } = string.Empty;

    public Guid CategoryId { get; set; }

    public int LowStockThreshold { get; set; } = 10;

    public Category Category { get; set; } = null!;
}