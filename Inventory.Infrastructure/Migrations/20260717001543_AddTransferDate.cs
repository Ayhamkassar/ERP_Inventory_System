using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Inventory.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransferDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransferItems_StockBatches_StockBatchId",
                table: "TransferItems");

            migrationBuilder.DropIndex(
                name: "IX_TransferItems_StockBatchId",
                table: "TransferItems");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Transfers");

            migrationBuilder.DropColumn(
                name: "StockBatchId",
                table: "TransferItems");

            migrationBuilder.AddColumn<DateTime>(
                name: "TransferDate",
                table: "Transfers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TransferDate",
                table: "Transfers");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Transfers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StockBatchId",
                table: "TransferItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransferItems_StockBatchId",
                table: "TransferItems",
                column: "StockBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_TransferItems_StockBatches_StockBatchId",
                table: "TransferItems",
                column: "StockBatchId",
                principalTable: "StockBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
