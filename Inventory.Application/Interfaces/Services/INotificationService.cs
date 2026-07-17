namespace Inventory.Application.Interfaces.Services;

public interface INotificationService
{
    Task NotifyStockUpdated(
        Guid productId,
        Guid warehouseId,
        int quantity);

    Task NotifyLowStock(
        Guid productId,
        Guid warehouseId,
        int quantity);
}