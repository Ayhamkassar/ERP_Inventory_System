using Inventory.Application.Interfaces;
using Inventory.Application.Interfaces.Repositories;
using Inventory.Application.Interfaces.Services;
using Inventory.Application.Services;
using Inventory.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Inventory.Infrastructure.Persistence;

namespace Inventory.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"));
        });


        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        services.AddScoped<IPurchaseRepository, PurchaseRepository>();

        services.AddScoped<IStockRepository, StockRepository>();

        services.AddScoped<IStockBatchRepository, StockBatchRepository>();

        services.AddScoped<ISaleRepository, SaleRepository>();

        services.AddScoped<IStockMovementRepository, StockMovementRepository>();

        services.AddScoped<IStockReportRepository, StockReportRepository>();

        services.AddScoped<ITransferRepository, TransferRepository>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();


        return services;
    }
}