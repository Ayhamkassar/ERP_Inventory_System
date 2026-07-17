using Inventory.Application.DTOs.Reports;

namespace Inventory.Application.Interfaces.Services;

public interface IReportService
{
    Task<List<StockReportDto>> GetStockReportAsync();

    Task<StockReportDto> GetSalesReportAsync(
        DateTime from,
        DateTime to,
        int limit = 10);

    Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(
        DateTime from,
        DateTime to,
        int limit = 10);
}
