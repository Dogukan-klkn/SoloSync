using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreelancerSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClientUserIdToCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClientUserId",
                table: "Customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_ClientUserId",
                table: "Customers",
                column: "ClientUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Users_ClientUserId",
                table: "Customers",
                column: "ClientUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Users_ClientUserId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_ClientUserId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "ClientUserId",
                table: "Customers");
        }
    }
}
