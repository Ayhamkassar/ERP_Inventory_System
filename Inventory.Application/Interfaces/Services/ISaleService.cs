using Inventory.Application.DTOs.Sales;

namespace Inventory.Application.Interfaces.Services;

public interface ISaleService
{
    Task<Guid> CreateSaleAsync(
        CreateSaleRequest request,
        CancellationToken cancellationToken);
}