using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreelancerSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteUniqueIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Customers_UserId",
                table: "Customers");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserId_Email",
                table: "Customers",
                columns: new[] { "UserId", "Email" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserId_TaxNumber",
                table: "Customers",
                columns: new[] { "UserId", "TaxNumber" },
                unique: true,
                filter: "\"TaxNumber\" IS NOT NULL AND \"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Customers_UserId_Email",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Customers_UserId_TaxNumber",
                table: "Customers");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserId",
                table: "Customers",
                column: "UserId");
        }
    }
}
