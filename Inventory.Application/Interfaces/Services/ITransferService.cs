using Inventory.Application.DTOs.Transfers;

namespace Inventory.Application.Interfaces.Services;

public interface ITransferService
{
    Task<Guid> CreateTransferAsync(
        CreateTransferRequest request,
        CancellationToken cancellationToken);
}