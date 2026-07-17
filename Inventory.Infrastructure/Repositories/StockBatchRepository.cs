using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;
using Inventory.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Infrastructure.Repositories;

public class StockBatchRepository : Repository<StockBatch>, IStockBatchRepository
{
    public StockBatchRepository(
        ApplicationDbContext context)
        : base(context)
    {
    }


    public async Task<List<StockBatch>> GetAvailableBatchesAsync(
        Guid productId,
        Guid warehouseId)
    {
        return await _context.StockBatches
            .Where(x =>
                x.ProductId == productId &&
                x.WarehouseId == warehouseId &&
                x.RemainingQuantity > 0)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }
}
