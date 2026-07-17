using Inventory.Application.DTOs.Sales;
using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Services;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Domain.Entities;

namespace Inventory.Application.Services;

public class SaleService : ISaleService
{
    private readonly IStockRepository _stockRepository;
    private readonly IStockBatchRepository _stockBatchRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;
    


    public SaleService(
        IStockRepository stockRepository,
        IStockBatchRepository stockBatchRepository,
        ISaleRepository saleRepository,
        IStockMovementRepository stockMovementRepository,
        IUnitOfWork unitOfWork,
        INotificationService notificationService)
    {
        _stockRepository = stockRepository;
        _stockBatchRepository = stockBatchRepository;
        _saleRepository = saleRepository;
        _stockMovementRepository = stockMovementRepository;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }



    public async Task<Guid> CreateSaleAsync(
        CreateSaleRequest request,
        CancellationToken cancellationToken)
    {

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var sale = new Sale
            {
                Id = Guid.NewGuid(),
                InvoiceNumber =
                    $"INV-{DateTime.UtcNow.Ticks}",
                SaleDate = DateTime.UtcNow,
                WarehouseId = request.WarehouseId
            };



            foreach(var item in request.Items)
            {

                var stock =
                    await _stockRepository.GetAsync(
                        item.ProductId,
                        request.WarehouseId);



                if(stock == null ||
                   stock.AvailableQuantity < item.Quantity)
                {
                    throw new Exception(
                        "Insufficient stock");
                }

                var product = stock.Product;



                var saleItem = new SaleItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    SaleId = sale.Id
                };



                int remaining =
                    item.Quantity;



                var batches =
                    await _stockBatchRepository
                    .GetAvailableBatchesAsync(
                        item.ProductId,
                        request.WarehouseId);



                foreach(var batch in batches)
                {

                    if(remaining <= 0)
                        break;


                    var used =
                        Math.Min(
                            batch.RemainingQuantity,
                            remaining);



                    batch.RemainingQuantity -= used;



                    saleItem.Allocations.Add(
                        new SaleItemAllocation
                        {
                            Id = Guid.NewGuid(),
                            StockBatchId = batch.Id,
                            Quantity = used
                        });



                    await _stockMovementRepository.AddAsync(
                        new StockMovement
                        {
                            Id = Guid.NewGuid(),
                            ProductId = item.ProductId,
                            WarehouseId =
                                request.WarehouseId,
                            StockBatchId =
                                batch.Id,
                            Quantity = -used,
                            MovementType =
                                MovementType.Sale,
                            ReferenceId =
                                sale.Id
                        });



                    remaining -= used;
                }



                if(remaining > 0)
                {
                    throw new Exception(
                        "Not enough batch quantity");
                }



                stock.Quantity -= item.Quantity;
                stock.AvailableQuantity -= item.Quantity;

                await _notificationService.NotifyStockUpdated(
                    item.ProductId,
                    request.WarehouseId,
                    stock.Quantity);

                        if(stock.Quantity <= stock.Product.LowStockThreshold)
                        {
                            await _notificationService.NotifyLowStock(
                            item.ProductId,
                            sale.WarehouseId,
                            stock.Quantity);
                        }


                sale.Items.Add(saleItem);
            }



            await _saleRepository.AddAsync(sale);


            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return sale.Id;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }
}
