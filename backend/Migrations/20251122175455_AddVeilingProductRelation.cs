using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FloresFuertes.Migrations
{
    /// <inheritdoc />
    public partial class AddVeilingProductRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Veilingen_Producten_Product_Id",
                table: "Veilingen");

            migrationBuilder.DropIndex(
                name: "IX_Veilingen_Product_Id",
                table: "Veilingen");

            migrationBuilder.AlterColumn<string>(
                name: "Product_Id",
                table: "Veilingen",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "Product_Id1",
                table: "Veilingen",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "VeilingProducten",
                columns: table => new
                {
                    VeilingProduct_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Veiling_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Product_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Product_Id1 = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Veiling_Id1 = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VeilingProducten", x => x.VeilingProduct_Id);
                    table.ForeignKey(
                        name: "FK_VeilingProducten_Producten_Product_Id",
                        column: x => x.Product_Id,
                        principalTable: "Producten",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VeilingProducten_Producten_Product_Id1",
                        column: x => x.Product_Id1,
                        principalTable: "Producten",
                        principalColumn: "Product_Id");
                    table.ForeignKey(
                        name: "FK_VeilingProducten_Veilingen_Veiling_Id",
                        column: x => x.Veiling_Id,
                        principalTable: "Veilingen",
                        principalColumn: "Veiling_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VeilingProducten_Veilingen_Veiling_Id1",
                        column: x => x.Veiling_Id1,
                        principalTable: "Veilingen",
                        principalColumn: "Veiling_Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Veilingen_Product_Id1",
                table: "Veilingen",
                column: "Product_Id1");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Product_Id",
                table: "VeilingProducten",
                column: "Product_Id");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Product_Id1",
                table: "VeilingProducten",
                column: "Product_Id1");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Veiling_Id",
                table: "VeilingProducten",
                column: "Veiling_Id");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Veiling_Id1",
                table: "VeilingProducten",
                column: "Veiling_Id1");

            migrationBuilder.AddForeignKey(
                name: "FK_Veilingen_Producten_Product_Id1",
                table: "Veilingen",
                column: "Product_Id1",
                principalTable: "Producten",
                principalColumn: "Product_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Veilingen_Producten_Product_Id1",
                table: "Veilingen");

            migrationBuilder.DropTable(
                name: "VeilingProducten");

            migrationBuilder.DropIndex(
                name: "IX_Veilingen_Product_Id1",
                table: "Veilingen");

            migrationBuilder.DropColumn(
                name: "Product_Id1",
                table: "Veilingen");

            migrationBuilder.AlterColumn<string>(
                name: "Product_Id",
                table: "Veilingen",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

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
                onDelete: ReferentialAction.Cascade);
        }
    }
}
