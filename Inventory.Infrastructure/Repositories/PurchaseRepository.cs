using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;
using Inventory.Infrastructure.Persistence;

namespace Inventory.Infrastructure.Repositories;

public class PurchaseRepository 
    : Repository<Purchase>, IPurchaseRepository
{
    public PurchaseRepository(ApplicationDbContext context)
        : base(context)
    {
    }
}