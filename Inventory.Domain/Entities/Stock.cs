namespace Inventory.Domain.Entities;

public class Stock : BaseEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }

    public Guid WarehouseId { get; set; }

    public Warehouse Warehouse { get; set; } = null!;

    public int AvailableQuantity { get; set; }

    public int ReservedQuantity { get; set; }

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}