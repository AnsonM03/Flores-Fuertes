using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FloresFuertes.Migrations
{
    /// <inheritdoc />
    public partial class FixVeilingRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VeilingProducten_Producten_Product_Id1",
                table: "VeilingProducten");

            migrationBuilder.DropIndex(
                name: "IX_VeilingProducten_Product_Id1",
                table: "VeilingProducten");

            migrationBuilder.DropColumn(
                name: "Product_Id1",
                table: "VeilingProducten");

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

            migrationBuilder.AddColumn<string>(
                name: "Product_Id1",
                table: "VeilingProducten",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Product_Id1",
                table: "VeilingProducten",
                column: "Product_Id1");

            migrationBuilder.AddForeignKey(
                name: "FK_VeilingProducten_Producten_Product_Id1",
                table: "VeilingProducten",
                column: "Product_Id1",
                principalTable: "Producten",
                principalColumn: "Product_Id");
        }
    }
}
