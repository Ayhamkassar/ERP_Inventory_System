using FluentAssertions;
using Moq;
using Xunit;

using Inventory.Application.DTOs.Transfers;
using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Application.Interfaces.Services;
using Inventory.Application.Services;
using Inventory.Domain.Entities;

namespace Inventory.Tests.Services;

public class TransferServiceTests
{
    private readonly Mock<ITransferRepository> _transferRepository = new();
    private readonly Mock<IStockRepository> _stockRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<INotificationService> _notificationService = new();

    private readonly TransferService _service;

    public TransferServiceTests()
    {
        _service = new TransferService(
            _transferRepository.Object,
            _stockRepository.Object,
            _unitOfWork.Object,
            _notificationService.Object);
    }

        [Fact]
    public async Task CreateTransfer_ShouldThrow_WhenStockIsInsufficient()
    {
        var request = new CreateTransferRequest
        {
            FromWarehouseId = Guid.NewGuid(),
            ToWarehouseId = Guid.NewGuid(),

            Items =
            [
                new CreateTransferItemRequest
                {
                    ProductId = Guid.NewGuid(),
                    Quantity = 10
                }
            ]
        };

        _stockRepository
            .Setup(x => x.GetAsync(
                It.IsAny<Guid>(),
                request.FromWarehouseId))
            .ReturnsAsync(new Stock
            {
                Quantity = 5,
                AvailableQuantity = 5
            });

        Func<Task> action =
            () => _service.CreateTransferAsync(
                request,
                CancellationToken.None);

        await action.Should()
            .ThrowAsync<Exception>()
            .WithMessage("Insufficient stock.");
    }

        [Fact]
    public async Task CreateTransfer_ShouldCreateDestinationStock_WhenNotExists()
    {
        var productId = Guid.NewGuid();

        var request = new CreateTransferRequest
        {
            FromWarehouseId = Guid.NewGuid(),
            ToWarehouseId = Guid.NewGuid(),

            Items =
            [
                new CreateTransferItemRequest
                {
                    ProductId = productId,
                    Quantity = 5
                }
            ]
        };

        _stockRepository
            .Setup(x => x.GetAsync(productId, request.FromWarehouseId))
            .ReturnsAsync(new Stock
            {
                Quantity = 10,
                AvailableQuantity = 10
            });

        _stockRepository
            .Setup(x => x.GetAsync(productId, request.ToWarehouseId))
            .ReturnsAsync((Stock?)null);

        await _service.CreateTransferAsync(
            request,
            CancellationToken.None);

        _stockRepository.Verify(
            x => x.AddAsync(It.IsAny<Stock>()),
            Times.Once);
    }

        [Fact]
    public async Task CreateTransfer_ShouldCreateTransfer()
    {
        var productId = Guid.NewGuid();

        _stockRepository
            .Setup(x => x.GetAsync(
                productId,
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock
            {
                Quantity = 20,
                AvailableQuantity = 20
            });

        var request = new CreateTransferRequest
        {
            FromWarehouseId = Guid.NewGuid(),
            ToWarehouseId = Guid.NewGuid(),

            Items =
            [
                new CreateTransferItemRequest
                {
                    ProductId = productId,
                    Quantity = 5
                }
            ]
        };

        await _service.CreateTransferAsync(
            request,
            CancellationToken.None);

        _transferRepository.Verify(
            x => x.AddAsync(It.IsAny<Transfer>()),
            Times.Once);
    }

        [Fact]
    public async Task CreateTransfer_ShouldCommitTransaction()
    {
        var productId = Guid.NewGuid();

        _stockRepository
            .Setup(x => x.GetAsync(
                productId,
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock
            {
                Quantity = 20,
                AvailableQuantity = 20
            });

        var request = new CreateTransferRequest
        {
            FromWarehouseId = Guid.NewGuid(),
            ToWarehouseId = Guid.NewGuid(),

            Items =
            [
                new CreateTransferItemRequest
                {
                    ProductId = productId,
                    Quantity = 5
                }
            ]
        };

        await _service.CreateTransferAsync(
            request,
            CancellationToken.None);

        _unitOfWork.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);

        _unitOfWork.Verify(
            x => x.CommitTransactionAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

        [Fact]
    public async Task CreateTransfer_ShouldNotifyBothWarehouses()
    {
        var productId = Guid.NewGuid();

        _stockRepository
            .Setup(x => x.GetAsync(
                productId,
                It.IsAny<Guid>()))
            .ReturnsAsync(new Stock
            {
                Quantity = 20,
                AvailableQuantity = 20
            });

        var request = new CreateTransferRequest
        {
            FromWarehouseId = Guid.NewGuid(),
            ToWarehouseId = Guid.NewGuid(),

            Items =
            [
                new CreateTransferItemRequest
                {
                    ProductId = productId,
                    Quantity = 5
                }
            ]
        };

        await _service.CreateTransferAsync(
            request,
            CancellationToken.None);

        _notificationService.Verify(
            x => x.NotifyStockUpdated(
                It.IsAny<Guid>(),
                It.IsAny<Guid>(),
                It.IsAny<int>()),
            Times.Exactly(2));
    }
}