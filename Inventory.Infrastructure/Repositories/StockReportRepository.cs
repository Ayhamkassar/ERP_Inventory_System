using Inventory.Application.DTOs.Reports;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Inventory.Infrastructure.Repositories;

public class StockReportRepository : IStockReportRepository
{
    private readonly ApplicationDbContext _context;

    public StockReportRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StockReportDto>> GetStockReportAsync()
    {
        return await _context.Stocks
            .Select(x => new StockReportDto
            {
                ProductId = x.ProductId,

                ProductName =
                    x.Product.Name,

                WarehouseName =
                    x.Warehouse.Name,

                Quantity =
                    x.Quantity,

                AvailableQuantity =
                    x.AvailableQuantity
            })
            .ToListAsync();
    }

    public async Task<StockReportDto> GetSalesReportAsync(
        DateTime from,
        DateTime to)
    {
        var sales = await _context.Sales
            .Where(x =>
                x.SaleDate >= from &&
                x.SaleDate <= to)
            .Include(x => x.Items)
            .ToListAsync();


        return new StockReportDto
        {
            From = from,

            To = to,

            TotalInvoices = sales.Count,


            TotalItemsSold = sales
                .SelectMany(x => x.Items)
                .Sum(x => x.Quantity),


            TotalRevenue = sales
                .SelectMany(x => x.Items)
                .Sum(x =>
                    x.Quantity * x.UnitPrice)
        };
    }

    public async Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(
        DateTime from,
        DateTime to,
        int limit)
    {
        return await _context.SaleItems

            .Where(x =>
                x.Sale.SaleDate >= from &&
                x.Sale.SaleDate <= to)

            .GroupBy(x => new
            {
                x.ProductId,
                x.Product.Name
            })

            .Select(x => new TopSellingProductDto
            {
                ProductId = x.Key.ProductId,

                ProductName = x.Key.Name,

                SoldQuantity =
                    x.Sum(i => i.Quantity),

                TotalRevenue =
                    x.Sum(i =>
                        i.Quantity * i.UnitPrice)
            })

            .OrderByDescending(x => x.SoldQuantity)

            .Take(limit)

            .ToListAsync();
    }
}
