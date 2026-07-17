using Inventory.Application.Interfaces.Services;
using Inventory.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Inventory.API.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<InventoryHub> _hub;


    public SignalRNotificationService(
        IHubContext<InventoryHub> hub)
    {
        _hub = hub;
    }


    public async Task NotifyStockUpdated(
        Guid productId,
        Guid warehouseId,
        int quantity)
    {
        await _hub.Clients.All.SendAsync(
            "StockUpdated",
            new
            {
                productId,
                warehouseId,
                quantity
            });
    }


    public async Task NotifyLowStock(
        Guid productId,
        Guid warehouseId,
        int quantity)
    {
        await _hub.Clients.All.SendAsync(
            "LowStock",
            new
            {
                productId,
                warehouseId,
                quantity
            });
    }
}