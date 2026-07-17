using Inventory.Application.Interfaces.Services;
using Inventory.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Inventory.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {

        services.AddScoped<IPurchaseService, PurchaseService>();
        services.AddScoped<ISaleService, SaleService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<ITransferService, TransferService>();

        return services;
    }
}