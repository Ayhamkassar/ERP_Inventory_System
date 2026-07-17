using Inventory.Application.DTOs.Purchases;
using Inventory.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly IPurchaseService _purchaseService;


    public PurchasesController(
        IPurchaseService purchaseService)
    {
        _purchaseService = purchaseService;
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        CreatePurchaseRequest request,
        CancellationToken cancellationToken)
    {
        var id = await _purchaseService
            .CreatePurchaseAsync(
                request,
                cancellationToken);


        return Ok(new
        {
            message = "Purchase created successfully",
            id
        });
    }
}