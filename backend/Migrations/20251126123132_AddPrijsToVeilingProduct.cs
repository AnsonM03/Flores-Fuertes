using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FloresFuertes.Migrations
{
    /// <inheritdoc />
    public partial class AddPrijsToVeilingProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Hoeveelheid",
                table: "VeilingProducten",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<float>(
                name: "Prijs",
                table: "VeilingProducten",
                type: "real",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Hoeveelheid",
                table: "VeilingProducten");

            migrationBuilder.DropColumn(
                name: "Prijs",
                table: "VeilingProducten");
        }
    }
}
