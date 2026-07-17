using Inventory.Domain.Entities;

namespace Inventory.Application.Interfaces.Repositories;

public interface ITransferRepository
{
    Task AddAsync(Transfer transfer);
}