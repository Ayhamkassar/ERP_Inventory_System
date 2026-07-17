using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class TransferConfiguration : IEntityTypeConfiguration<Transfer>
{
    public void Configure(EntityTypeBuilder<Transfer> builder)
    {
        builder.ToTable("Transfers");

        builder.HasKey(x => x.Id);


        builder.Property(x => x.TransferNumber)
               .HasMaxLength(50)
               .IsRequired();


        builder.HasIndex(x => x.TransferNumber)
               .IsUnique();


        builder.HasIndex(x => x.FromWarehouseId);

        builder.HasIndex(x => x.ToWarehouseId);


        builder.HasOne(x => x.FromWarehouse)
               .WithMany()
               .HasForeignKey(x => x.FromWarehouseId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.HasOne(x => x.ToWarehouse)
               .WithMany()
               .HasForeignKey(x => x.ToWarehouseId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.Property(x => x.Status)
               .HasConversion<int>();


        builder.HasIndex(x => x.Status);


        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}