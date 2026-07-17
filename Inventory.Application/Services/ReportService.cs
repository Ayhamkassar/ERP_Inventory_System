using Inventory.Application.DTOs.Reports;
using Inventory.Application.Interfaces.Services;
using Inventory.Application.Interfaces.Repositories;

namespace Inventory.Application.Services;

public class ReportService : IReportService
{
    private readonly IStockReportRepository _stockReportRepository;

    public ReportService(
        IStockReportRepository stockReportRepository)
    {
        _stockReportRepository = stockReportRepository;
    }

    public async Task<List<StockReportDto>> GetStockReportAsync()
    {
        return await _stockReportRepository.GetStockReportAsync();
    }

    public async Task<StockReportDto> GetSalesReportAsync(
        DateTime from,
        DateTime to,
        int limit = 10)
    {
        return await _stockReportRepository.GetSalesReportAsync(from, to);
    }

    public async Task<List<TopSellingProductDto>> GetTopSellingProductsAsync(
        DateTime from,
        DateTime to,
        int limit = 10)
    {
        return await _stockReportRepository.GetTopSellingProductsAsync(from, to, limit);
    }
}