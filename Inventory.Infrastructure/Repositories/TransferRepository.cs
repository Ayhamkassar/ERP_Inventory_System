using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;
using Inventory.Infrastructure.Persistence;

namespace Inventory.Infrastructure.Repositories;

public class TransferRepository : ITransferRepository
{
    private readonly ApplicationDbContext _context;

    public TransferRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Transfer transfer)
    {
        await _context.Transfers.AddAsync(transfer);
    }
}