using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class PurchaseItemConfiguration : IEntityTypeConfiguration<PurchaseItem>
{
    public void Configure(EntityTypeBuilder<PurchaseItem> builder)
    {
        builder.ToTable("PurchaseItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnitCost)
               .HasPrecision(18,2);

        builder.HasIndex(x => x.ProductId);

        builder.HasIndex(x => x.PurchaseId);

        builder.HasOne(x => x.Purchase)
               .WithMany(x => x.Items)
               .HasForeignKey(x => x.PurchaseId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Product)
               .WithMany()
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}