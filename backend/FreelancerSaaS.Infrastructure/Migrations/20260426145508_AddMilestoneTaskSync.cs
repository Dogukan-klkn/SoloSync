using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreelancerSaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMilestoneTaskSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MilestoneId",
                table: "ProjectTasks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTasks_MilestoneId",
                table: "ProjectTasks",
                column: "MilestoneId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectTasks_Milestones_MilestoneId",
                table: "ProjectTasks",
                column: "MilestoneId",
                principalTable: "Milestones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectTasks_Milestones_MilestoneId",
                table: "ProjectTasks");

            migrationBuilder.DropIndex(
                name: "IX_ProjectTasks_MilestoneId",
                table: "ProjectTasks");

            migrationBuilder.DropColumn(
                name: "MilestoneId",
                table: "ProjectTasks");
        }
    }
}
