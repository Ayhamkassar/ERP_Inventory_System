using Inventory.Domain.Entities;

namespace Inventory.Application.Interfaces.Repositories;

public interface IStockBatchRepository : IRepository<StockBatch>
{
    Task<List<StockBatch>> GetAvailableBatchesAsync(
    Guid productId,
    Guid warehouseId);
}