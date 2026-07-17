using Inventory.Domain.Entities;

namespace Inventory.Application.Interfaces.Repositories;

public interface ISaleRepository
{
    Task AddAsync(Sale sale);
}