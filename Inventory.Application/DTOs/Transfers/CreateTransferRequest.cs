namespace Inventory.Application.DTOs.Transfers;

public class CreateTransferRequest
{
    public Guid FromWarehouseId { get; set; }

    public Guid ToWarehouseId { get; set; }


    public List<CreateTransferItemRequest> Items { get; set; }
        = new();
}


public class CreateTransferItemRequest
{
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }
}