using Inventory.Application.DTOs.Transfers;
using Inventory.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Inventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransferController : ControllerBase
{
    private readonly ITransferService _transferService;

    public TransferController(
        ITransferService transferService)
    {
        _transferService = transferService;
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTransferRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var transferId =
                await _transferService.CreateTransferAsync(
                    request,
                    cancellationToken);


            return Ok(new
            {
                message = "Transfer created successfully",
                transferId
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