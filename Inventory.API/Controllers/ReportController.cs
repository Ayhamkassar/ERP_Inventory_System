using Inventory.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;


    public ReportsController(
        IReportService reportService)
    {
        _reportService = reportService;
    }


    [HttpGet("stock")]
    public async Task<IActionResult> GetStock()
    {
        var result =
            await _reportService
            .GetStockReportAsync();

        return Ok(result);
    }

    [HttpGet("sales")]
public async Task<IActionResult> GetSales(
    [FromQuery] DateTime from,
    [FromQuery] DateTime to)
{
    var result =
        await _reportService
        .GetSalesReportAsync(from, to);


    return Ok(result);
}

[HttpGet("top-selling-products")]
public async Task<IActionResult> GetTopSellingProducts(
    [FromQuery] DateTime from,
    [FromQuery] DateTime to,
    [FromQuery] int limit = 10)
{
    var result =
        await _reportService
        .GetTopSellingProductsAsync(
            from,
            to,
            limit);

    return Ok(result);
}
}