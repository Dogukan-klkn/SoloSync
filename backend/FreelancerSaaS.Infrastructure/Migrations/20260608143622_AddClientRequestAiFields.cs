using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreelancerSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClientRequestAiFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiMetadataJson",
                table: "ClientRequests",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClientPreview",
                table: "ClientRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuggestedPriority",
                table: "ClientRequests",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiMetadataJson",
                table: "ClientRequests");

            migrationBuilder.DropColumn(
                name: "ClientPreview",
                table: "ClientRequests");

            migrationBuilder.DropColumn(
                name: "SuggestedPriority",
                table: "ClientRequests");
        }
    }
}
