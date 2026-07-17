using Moq;
using Xunit;
using FluentAssertions;

using Inventory.Application.Services;
using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Application.Interfaces.Services;
using Inventory.Application.DTOs.Purchases;
using Inventory.Domain.Entities;

namespace Inventory.Tests.Services;

public class PurchaseServiceTests
{
    private readonly Mock<IPurchaseRepository> _purchaseRepository = new();
    private readonly Mock<IStockBatchRepository> _stockBatchRepository = new();
    private readonly Mock<IStockRepository> _stockRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<INotificationService> _notificationService = new();

    private readonly PurchaseService _service;

    public PurchaseServiceTests()
    {
        _service = new PurchaseService(
            _purchaseRepository.Object,
            _stockBatchRepository.Object,
            _stockRepository.Object,
            _unitOfWork.Object,
            _notificationService.Object);
    }

        [Fact]
    public async Task CreatePurchase_ShouldCreateNewStock_WhenStockDoesNotExist()
    {
        var request = new CreatePurchaseRequest
        {
            SupplierId = Guid.NewGuid(),
            WarehouseId = Guid.NewGuid(),
            PurchaseDate = DateTime.UtcNow,

            Items =
            [
                new PurchaseItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 10,
                    UnitCost = 50
                }
            ]
        };

        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>()))
            .ReturnsAsync((Stock?)null);

        await _service.CreatePurchaseAsync(
            request,
            CancellationToken.None);

        _stockRepository.Verify(
            x => x.AddAsync(It.IsAny<Stock>()),
            Times.Once);
    }

        [Fact]
    public async Task CreatePurchase_ShouldIncreaseExistingStock()
    {
        var stock = new Stock
        {
            Quantity = 5
        };

        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>()))
            .ReturnsAsync(stock);

        var request = new CreatePurchaseRequest
        {
            SupplierId = Guid.NewGuid(),
            WarehouseId = Guid.NewGuid(),
            PurchaseDate = DateTime.UtcNow,

            Items =
            [
                new PurchaseItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 3,
                    UnitCost = 20
                }
            ]
        };

        await _service.CreatePurchaseAsync(
            request,
            CancellationToken.None);

        stock.Quantity.Should().Be(8);
    }

        [Fact]
    public async Task CreatePurchase_ShouldCreateStockBatch()
    {
        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock());

        var request = new CreatePurchaseRequest
        {
            SupplierId = Guid.NewGuid(),
            WarehouseId = Guid.NewGuid(),
            PurchaseDate = DateTime.UtcNow,

            Items =
            [
                new PurchaseItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 2,
                    UnitCost = 100
                }
            ]
        };

        await _service.CreatePurchaseAsync(
            request,
            CancellationToken.None);

        _stockBatchRepository.Verify(
            x => x.AddAsync(It.IsAny<StockBatch>()),
            Times.Once);
    }

        [Fact]
    public async Task CreatePurchase_ShouldSaveChanges()
    {
        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock());

        var request = new CreatePurchaseRequest
        {
            SupplierId = Guid.NewGuid(),
            WarehouseId = Guid.NewGuid(),
            PurchaseDate = DateTime.UtcNow,

            Items =
            [
                new PurchaseItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 1,
                    UnitCost = 5
                }
            ]
        };

        await _service.CreatePurchaseAsync(
            request,
            CancellationToken.None);

        _unitOfWork.Verify(
            x => x.SaveChangesAsync(
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

        [Fact]
    public async Task CreatePurchase_ShouldSendNotification()
    {
        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock
            {
                Quantity = 5
            });

        var request = new CreatePurchaseRequest
        {
            SupplierId = Guid.NewGuid(),
            WarehouseId = Guid.NewGuid(),
            PurchaseDate = DateTime.UtcNow,

            Items =
            [
                new PurchaseItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 2,
                    UnitCost = 10
                }
            ]
        };

        await _service.CreatePurchaseAsync(
            request,
            CancellationToken.None);

        _notificationService.Verify(
            x => x.NotifyStockUpdated(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<int>()),
            Times.Once);
    }
}