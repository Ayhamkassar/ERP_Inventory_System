using Inventory.Domain.Entities;

namespace Inventory.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context)
    {
        if (!context.Categories.Any())
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Electronics",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            };


            var product = new Product
            {
                Id = Guid.NewGuid(),
                Name = "Laptop",
                CategoryId = category.Id,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            };


            var supplier = new Supplier
            {
                Id = Guid.NewGuid(),
                Name = "Supplier A",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            };


            var warehouse = new Warehouse
            {
                Id = Guid.NewGuid(),
                Name = "Main Warehouse",
                Location = "Damascus",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            };


            await context.Categories.AddAsync(category);
            await context.Products.AddAsync(product);
            await context.Suppliers.AddAsync(supplier);
            await context.Warehouses.AddAsync(warehouse);

            await context.SaveChangesAsync();
        }
    }
}