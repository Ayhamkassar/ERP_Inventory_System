namespace Inventory.Application.DTOs.Reports;

public class TopSellingProductDto
{
    public Guid ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int SoldQuantity { get; set; }

    public decimal TotalRevenue { get; set; }
}