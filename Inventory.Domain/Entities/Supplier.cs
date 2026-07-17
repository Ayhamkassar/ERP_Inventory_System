namespace Inventory.Domain.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public ICollection<Purchase> Purchases { get; set; }
        = new List<Purchase>();
}