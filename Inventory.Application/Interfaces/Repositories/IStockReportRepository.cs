using Inventory.Application.DTOs.Reports;

namespace Inventory.Application.Interfaces.Repositories;

public interface IStockReportRepository
{
    Task<List<StockReportDto>> GetStockReportAsync();

    Task<StockReportDto> GetSalesReportAsync(DateTime from, DateTime to);

        Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(
        DateTime from,
        DateTime to,
        int limit);
}
