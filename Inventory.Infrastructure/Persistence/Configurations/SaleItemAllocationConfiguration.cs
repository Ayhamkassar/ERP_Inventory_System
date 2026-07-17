using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class SaleItemAllocationConfiguration : IEntityTypeConfiguration<SaleItemAllocation>
{
    public void Configure(EntityTypeBuilder<SaleItemAllocation> builder)
    {
        builder.ToTable("SaleItemAllocations");

        builder.HasKey(x => x.Id);


        builder.Property(x => x.Quantity)
               .IsRequired();


        builder.HasIndex(x => x.SaleItemId);

        builder.HasIndex(x => x.StockBatchId);


        builder.HasOne(x => x.SaleItem)
               .WithMany(x => x.Allocations)
               .HasForeignKey(x => x.SaleItemId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.HasOne(x => x.StockBatch)
               .WithMany()
               .HasForeignKey(x => x.StockBatchId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}