using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("Suppliers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
               .HasMaxLength(200)
               .IsRequired();

        builder.Property(x => x.Phone)
               .HasMaxLength(30);

        builder.Property(x => x.Email)
               .HasMaxLength(200);

        builder.HasIndex(x => x.Name);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}