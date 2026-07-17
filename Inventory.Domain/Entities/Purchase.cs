namespace Inventory.Domain.Entities;

public class Purchase : BaseEntity
{
    public Guid SupplierId { get; set; }

    public Supplier Supplier { get; set; } = null!;


    public DateTime PurchaseDate { get; set; }


    public ICollection<PurchaseItem> Items { get; set; }
        = new List<PurchaseItem>();
}