namespace Inventory.Application.DTOs.Sales;

public class CreateSaleRequest
{
    public Guid WarehouseId { get; set; }

    public List<CreateSaleItemRequest> Items { get; set; }
        = new();
}


public class CreateSaleItemRequest
{
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}