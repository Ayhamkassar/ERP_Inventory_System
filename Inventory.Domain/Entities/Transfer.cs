using Inventory.Domain.Enums;

namespace Inventory.Domain.Entities;

public class Transfer : BaseEntity
{
    public Guid FromWarehouseId { get; set; }

    public Warehouse FromWarehouse { get; set; } = null!;

    public string TransferNumber { get; set; } = string.Empty;

    public Guid ToWarehouseId { get; set; }

    public Warehouse ToWarehouse { get; set; } = null!;


    public DateTime TransferDate { get; set; }


    public TransferStatus Status { get; set; }


    public ICollection<TransferItem> Items { get; set; }
        = new List<TransferItem>();
}