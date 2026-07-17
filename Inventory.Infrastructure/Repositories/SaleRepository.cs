using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;
using Inventory.Infrastructure.Persistence;

namespace Inventory.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly ApplicationDbContext _context;

    public SaleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Sale sale)
    {
        await _context.Sales.AddAsync(sale);
    }
}