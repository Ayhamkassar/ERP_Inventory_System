using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;
using Inventory.Infrastructure.Persistence;

namespace Inventory.Infrastructure.Repositories;

public class StockMovementRepository : IStockMovementRepository
{
    private readonly ApplicationDbContext _context;

    public StockMovementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(StockMovement stockMovement)
    {
        await _context.StockMovements.AddAsync(stockMovement);
    }
}