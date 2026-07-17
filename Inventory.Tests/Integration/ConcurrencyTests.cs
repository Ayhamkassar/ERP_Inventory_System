using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

using Inventory.Domain.Entities;
using Inventory.Infrastructure.Persistence;

namespace Inventory.Tests.Integration;

public class ConcurrencyTests
{
    [Fact]
    public async Task UpdatingSameStockFromTwoContexts_ShouldThrowConcurrencyException()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(
                @"Server=.\SQLEXPRESS;
                  Database=InventoryConcurrencyTest;
                  Trusted_Connection=True;
                  TrustServerCertificate=True;")
            .Options;

        Guid productId = Guid.NewGuid();
        Guid warehouseId = Guid.NewGuid();

        // Seed
        using (var seedContext = new ApplicationDbContext(options))
        {
            await seedContext.Database.EnsureDeletedAsync();
            await seedContext.Database.EnsureCreatedAsync();
            await DataSeeder.SeedAsync(seedContext);

            var product = await seedContext.Products.FirstAsync();
            var warehouse = await seedContext.Warehouses.FirstAsync();

            productId = product.Id;
            warehouseId = warehouse.Id;
            
            seedContext.Stocks.Add(new Stock
            {
                Id = Guid.NewGuid(),
                ProductId = productId,
                WarehouseId = warehouseId,

                Quantity = 10,
                AvailableQuantity = 10,
                ReservedQuantity = 0,

                CreatedBy = "Test",
                CreatedAt = DateTime.UtcNow
            });

            await seedContext.SaveChangesAsync();
        }

        // فتح Contextين مختلفين
        using var context1 = new ApplicationDbContext(options);
        using var context2 = new ApplicationDbContext(options);

        var stock1 = await context1.Stocks
            .FirstAsync(x =>
                x.ProductId == productId &&
                x.WarehouseId == warehouseId);

        var stock2 = await context2.Stocks
            .FirstAsync(x =>
                x.ProductId == productId &&
                x.WarehouseId == warehouseId);

        stock1.Quantity -= 5;
        stock1.AvailableQuantity -= 5;

        await context1.SaveChangesAsync();

        stock2.Quantity -= 3;
        stock2.AvailableQuantity -= 3;

        Func<Task> action = async () =>
        {
            await context2.SaveChangesAsync();
        };

        await action.Should()
            .ThrowAsync<DbUpdateConcurrencyException>();
    }
}