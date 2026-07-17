using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Inventory.Infrastructure.Persistence;


namespace Inventory.Infrastructure.Repositories;

public class StockRepository : IStockRepository
{
    private readonly ApplicationDbContext _context;

    public StockRepository(ApplicationDbContext context)
    {
        _context = context;
    }


    public async Task<Stock?> GetAsync(
        Guid productId,
        Guid warehouseId)
    {
        return await _context.Stocks
        .Include(x => x.Product)
            .FirstOrDefaultAsync(x =>
                x.ProductId == productId &&
                x.WarehouseId == warehouseId &&
                !x.IsDeleted);
    }


    public async Task AddAsync(Stock stock)
    {
        await _context.Stocks.AddAsync(stock);
    }
}