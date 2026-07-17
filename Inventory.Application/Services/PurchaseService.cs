using Inventory.Application.DTOs.Purchases;
using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Services;
using Inventory.Domain.Entities;
using Inventory.Application.Interfaces.Repositories;

namespace Inventory.Application.Services;

public class PurchaseService : IPurchaseService
{
    private readonly IStockBatchRepository _stockBatchRepository;
    private readonly IPurchaseRepository _purchaseRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStockRepository _stockRepository;
    private readonly INotificationService _notificationService;


public PurchaseService(
    IPurchaseRepository purchaseRepository,
    IStockBatchRepository stockBatchRepository,
    IStockRepository stockRepository,
    IUnitOfWork unitOfWork,
    INotificationService notificationService)
{
    _purchaseRepository = purchaseRepository;
    _stockBatchRepository = stockBatchRepository;
    _stockRepository = stockRepository;
    _unitOfWork = unitOfWork;
    _notificationService = notificationService;
}

    public async Task<Guid> CreatePurchaseAsync(
        CreatePurchaseRequest request,
        CancellationToken cancellationToken)
    {


        var purchase = new Purchase
        {
            Id = Guid.NewGuid(),
            SupplierId = request.SupplierId,
            PurchaseDate = request.PurchaseDate,

            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System",
            IsDeleted = false
        };

        foreach(var item in request.Items)
        {
            var purchaseItem = new PurchaseItem
            {
                Id = Guid.NewGuid(),
                PurchaseId = purchase.Id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitCost = item.UnitCost,

                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                IsDeleted = false
            };


            purchase.Items.Add(purchaseItem);


            var stockBatch = new StockBatch
            {
                Id = Guid.NewGuid(),
                ProductId = item.ProductId,
                WarehouseId = request.WarehouseId,
                PurchaseItemId = purchaseItem.Id,
                Quantity = item.Quantity,
                RemainingQuantity = item.Quantity,
                UnitCost = item.UnitCost,

                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                IsDeleted = false
            };

            await _stockBatchRepository.AddAsync(stockBatch);
                    var stock = await _stockRepository.GetAsync(item.ProductId,request.WarehouseId);
            if (stock == null)
{
    stock = new Stock
    {
        Id = Guid.NewGuid(),

        ProductId = item.ProductId,

        WarehouseId = request.WarehouseId,

        Quantity = item.Quantity,

        CreatedAt = DateTime.UtcNow,
        CreatedBy = "System",
        IsDeleted = false
    };


    await _stockRepository.AddAsync(stock);
}
else
{
    stock.Quantity += item.Quantity;
}
await _notificationService.NotifyStockUpdated(
    item.ProductId,
    request.WarehouseId,
    stock.Quantity);
        }

        await _purchaseRepository.AddAsync(purchase);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);


        return purchase.Id;
    }
}