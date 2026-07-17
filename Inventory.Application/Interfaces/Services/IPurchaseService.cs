using Inventory.Application.DTOs.Purchases;

namespace Inventory.Application.Interfaces.Services;

public interface IPurchaseService
{
    Task<Guid> CreatePurchaseAsync(
        CreatePurchaseRequest request,
        CancellationToken cancellationToken);
}