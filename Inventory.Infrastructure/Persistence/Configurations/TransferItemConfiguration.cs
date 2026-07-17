using Inventory.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Inventory.Infrastructure.Persistence.Configurations;

public class TransferItemConfiguration : IEntityTypeConfiguration<TransferItem>
{
    public void Configure(EntityTypeBuilder<TransferItem> builder)
    {
        builder.ToTable("TransferItems");

        builder.HasKey(x => x.Id);


        builder.HasIndex(x => x.TransferId);

        builder.HasIndex(x => x.ProductId);

        builder.HasOne(x => x.Transfer)
               .WithMany(x => x.Items)
               .HasForeignKey(x => x.TransferId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.HasOne(x => x.Product)
               .WithMany()
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}