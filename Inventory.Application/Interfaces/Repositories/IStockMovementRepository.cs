using Inventory.Domain.Entities;

namespace Inventory.Application.Interfaces.Repositories;

public interface IStockMovementRepository
{
    Task AddAsync(StockMovement stockMovement);
}