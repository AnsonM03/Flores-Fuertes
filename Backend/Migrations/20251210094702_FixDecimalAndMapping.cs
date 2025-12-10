using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FloresFuertes.Migrations
{
    /// <inheritdoc />
    public partial class FixDecimalAndMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Veilingen_Producten_Product_Id1",
                table: "Veilingen");

            migrationBuilder.DropIndex(
                name: "IX_Veilingen_Product_Id1",
                table: "Veilingen");

            migrationBuilder.DropColumn(
                name: "Product_Id1",
                table: "Veilingen");

            migrationBuilder.AlterColumn<decimal>(
                name: "Prijs",
                table: "VeilingProducten",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(float),
                oldType: "real",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "VeilingPrijs",
                table: "Veilingen",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.AlterColumn<string>(
                name: "Product_Id",
                table: "Veilingen",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "StartPrijs",
                table: "Producten",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingen_Product_Id",
                table: "Veilingen",
                column: "Product_Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingen_Producten_Product_Id",
                table: "Veilingen",
                column: "Product_Id",
                principalTable: "Producten",
                principalColumn: "Product_Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Veilingen_Producten_Product_Id",
                table: "Veilingen");

            migrationBuilder.DropIndex(
                name: "IX_Veilingen_Product_Id",
                table: "Veilingen");

            migrationBuilder.AlterColumn<float>(
                name: "Prijs",
                table: "VeilingProducten",
                type: "real",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<float>(
                name: "VeilingPrijs",
                table: "Veilingen",
                type: "real",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Product_Id",
                table: "Veilingen",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Product_Id1",
                table: "Veilingen",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<float>(
                name: "StartPrijs",
                table: "Producten",
                type: "real",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingen_Product_Id1",
                table: "Veilingen",
                column: "Product_Id1");

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingen_Producten_Product_Id1",
                table: "Veilingen",
                column: "Product_Id1",
                principalTable: "Producten",
                principalColumn: "Product_Id");
        }
    }
}
