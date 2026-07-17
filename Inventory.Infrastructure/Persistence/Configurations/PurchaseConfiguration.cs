using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class PurchaseConfiguration : IEntityTypeConfiguration<Purchase>
{
    public void Configure(EntityTypeBuilder<Purchase> builder)
    {
        builder.ToTable("Purchases");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.SupplierId);

        builder.HasIndex(x => x.PurchaseDate);

        builder.HasOne(x => x.Supplier)
               .WithMany(x => x.Purchases)
               .HasForeignKey(x => x.SupplierId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}