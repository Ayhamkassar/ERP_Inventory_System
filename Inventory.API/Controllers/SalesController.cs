using Inventory.Application.DTOs.Sales;
using Inventory.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(
        ISaleService saleService)
    {
        _saleService = saleService;
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateSaleRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var saleId =
                await _saleService.CreateSaleAsync(
                    request,
                    cancellationToken);


            return Ok(new
            {
                message = "Sale created successfully",
                saleId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }
}