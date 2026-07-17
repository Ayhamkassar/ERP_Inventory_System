using Inventory.Domain.Entities;

namespace Inventory.Application.Interfaces.Repositories;

public interface IStockRepository
{
    Task<Stock?> GetAsync(
        Guid productId,
        Guid warehouseId);

    Task AddAsync(Stock stock);
}