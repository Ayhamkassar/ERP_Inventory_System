using Inventory.Application.DTOs.Transfers;
using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Application.Interfaces.Services;
using Inventory.Domain.Entities;
using Inventory.Domain.Enums;

namespace Inventory.Application.Services;

public class TransferService : ITransferService
{
    private readonly ITransferRepository _transferRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public TransferService(
        ITransferRepository transferRepository,
        IStockRepository stockRepository,
        IUnitOfWork unitOfWork,
        INotificationService notificationService)
    {
        _transferRepository = transferRepository;
        _stockRepository = stockRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<Guid> CreateTransferAsync(
        CreateTransferRequest request,
        CancellationToken cancellationToken)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var transfer = new Transfer
            {
                Id = Guid.NewGuid(),
                FromWarehouseId = request.FromWarehouseId,
                TransferNumber = $"TR-{DateTime.UtcNow.Ticks}",
                ToWarehouseId = request.ToWarehouseId,
                TransferDate = DateTime.UtcNow,
                Status = TransferStatus.Pending,
                CreatedBy = "system"
            };

            foreach (var item in request.Items)
            {
                var sourceStock =
                    await _stockRepository.GetAsync(
                        item.ProductId,
                        request.FromWarehouseId);

                if (sourceStock == null ||
                    sourceStock.AvailableQuantity < item.Quantity)
                {
                    throw new Exception("Insufficient stock.");
                }

                sourceStock.Quantity -= item.Quantity;
                sourceStock.AvailableQuantity -= item.Quantity;

                var destinationStock =
                    await _stockRepository.GetAsync(
                        item.ProductId,
                        request.ToWarehouseId);

                if (destinationStock == null)
                {
                    destinationStock = new Stock
                    {
                        Id = Guid.NewGuid(),
                        ProductId = item.ProductId,
                        WarehouseId = request.ToWarehouseId,
                        Quantity = 0,
                        AvailableQuantity = 0,
                        ReservedQuantity = 0,
                        CreatedBy = "system"
                    };

                    await _stockRepository.AddAsync(destinationStock);
                }

                destinationStock.Quantity += item.Quantity;
                destinationStock.AvailableQuantity += item.Quantity;

                await _notificationService.NotifyStockUpdated(
                item.ProductId,
                transfer.FromWarehouseId,
                sourceStock.Quantity);


                await _notificationService.NotifyStockUpdated(
                item.ProductId,
                transfer.ToWarehouseId,
                destinationStock.Quantity);


                transfer.Items.Add(new TransferItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CreatedBy = "system"
                });
            }

            transfer.Status = TransferStatus.Completed;

            await _transferRepository.AddAsync(transfer);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return transfer.Id;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }
}