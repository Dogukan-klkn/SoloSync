using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreelancerSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddClientInvitationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "InvitationSentAt",
                table: "Customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvitationToken",
                table: "Customers",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsInvitationAccepted",
                table: "Customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InvitationSentAt",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "InvitationToken",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "IsInvitationAccepted",
                table: "Customers");
        }
    }
}
