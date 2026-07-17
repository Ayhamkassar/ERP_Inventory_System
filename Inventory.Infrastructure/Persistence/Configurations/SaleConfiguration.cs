using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.ToTable("Sales");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.InvoiceNumber)
               .HasMaxLength(100)
               .IsRequired();

        builder.HasIndex(x => x.InvoiceNumber)
               .IsUnique();

        builder.HasIndex(x => x.SaleDate);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}