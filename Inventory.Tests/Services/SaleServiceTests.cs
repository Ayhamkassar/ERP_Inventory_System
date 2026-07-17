using FluentAssertions;
using Moq;
using Xunit;

using Inventory.Application.Services;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Services;
using Inventory.Application.DTOs.Sales;
using Inventory.Domain.Entities;

namespace Inventory.Tests.Services;

public class SaleServiceTests
{
    private readonly Mock<IStockRepository> _stockRepository = new();
    private readonly Mock<IStockBatchRepository> _stockBatchRepository = new();
    private readonly Mock<ISaleRepository> _saleRepository = new();
    private readonly Mock<IStockMovementRepository> _stockMovementRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<INotificationService> _notificationService = new();

    private readonly SaleService _service;

    public SaleServiceTests()
    {
        _service = new SaleService(
            _stockRepository.Object,
            _stockBatchRepository.Object,
            _saleRepository.Object,
            _stockMovementRepository.Object,
            _unitOfWork.Object,
            _notificationService.Object);
    }
        [Fact]
    public async Task CreateSale_ShouldThrow_WhenStockIsInsufficient()
    {
        // Arrange

        var request = new CreateSaleRequest
        {
            WarehouseId = Guid.NewGuid(),
            Items =
            [
                new CreateSaleItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 10,
                    UnitPrice = 100
                }
            ]
        };

        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock
            {
                Quantity = 5,
                AvailableQuantity = 5
            });

        // Act

        Func<Task> action =
            () => _service.CreateSaleAsync(
                request,
                CancellationToken.None);

        // Assert

        await action.Should()
            .ThrowAsync<Exception>()
            .WithMessage("Insufficient stock");
    }

    [Fact]
public async Task CreateSale_ShouldCreateSale_WhenStockIsAvailable()
{
    // Arrange

    var productId = Guid.NewGuid();
    var warehouseId = Guid.NewGuid();

    var request = new CreateSaleRequest
    {
        WarehouseId = warehouseId,
        Items =
        [
            new CreateSaleItemRequest
            {
                ProductId = productId,
                Quantity = 5,
                UnitPrice = 100
            }
        ]
    };

    _stockRepository
        .Setup(x => x.GetAsync(productId, warehouseId))
        .ReturnsAsync(new Stock
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            Quantity = 10,
            AvailableQuantity = 10,
            Product = new Product
            {
                LowStockThreshold = 2
            }
        });

    _stockBatchRepository
        .Setup(x => x.GetAvailableBatchesAsync(productId, warehouseId))
        .ReturnsAsync(
        [
            new StockBatch
            {
                Id = Guid.NewGuid(),
                RemainingQuantity = 10
            }
        ]);

    // Act

    await _service.CreateSaleAsync(
        request,
        CancellationToken.None);

    // Assert

    _saleRepository.Verify(
        x => x.AddAsync(It.IsAny<Sale>()),
        Times.Once);

    _stockMovementRepository.Verify(
        x => x.AddAsync(It.IsAny<StockMovement>()),
        Times.Once);

    _unitOfWork.Verify(
        x => x.SaveChangesAsync(
            It.IsAny<CancellationToken>()),
        Times.Once);

    _unitOfWork.Verify(
        x => x.CommitTransactionAsync(
            It.IsAny<CancellationToken>()),
        Times.Once);

    _notificationService.Verify(
        x => x.NotifyStockUpdated(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<int>()),
        Times.Once);
}
}