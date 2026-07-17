namespace Inventory.Application.DTOs.Reports;

public class StockReportDto
{
    public Guid ProductId { get; set; }

    public string? ProductName { get; set; }

    public string? WarehouseName { get; set; }

    public int Quantity { get; set; }

    public int AvailableQuantity { get; set; }

    public DateTime From { get; set; }

    public DateTime To { get; set; }

    public int TotalInvoices { get; set; }

    public int TotalItemsSold { get; set; }

    public decimal TotalRevenue { get; set; }
}
