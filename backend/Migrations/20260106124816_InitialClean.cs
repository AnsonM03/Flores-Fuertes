using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FloresFuertes.Migrations
{
    /// <inheritdoc />
    public partial class InitialClean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Gebruikers",
                columns: table => new
                {
                    Gebruiker_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Voornaam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Achternaam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Adres = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefoonnr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Woonplaats = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Wachtwoord = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    LockoutEndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GebruikerType = table.Column<string>(type: "nvarchar(21)", maxLength: 21, nullable: false),
                    Saldo = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gebruikers", x => x.Gebruiker_Id);
                });

            migrationBuilder.CreateTable(
                name: "Producten",
                columns: table => new
                {
                    Product_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Foto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Naam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ArtikelKenmerken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Hoeveelheid = table.Column<int>(type: "int", nullable: false),
                    StartPrijs = table.Column<float>(type: "real", nullable: false),
                    Aanvoerder_Id = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producten", x => x.Product_Id);
                });

            migrationBuilder.CreateTable(
                name: "Veilingen",
                columns: table => new
                {
                    Veiling_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    VeilingPrijs = table.Column<float>(type: "real", nullable: false),
                    VeilingDatum = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTijd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EindTijd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Kloklocatie = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Veilingmeester_Id = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Veilingen", x => x.Veiling_Id);
                    table.ForeignKey(
                        name: "FK_Veilingen_Gebruikers_Veilingmeester_Id",
                        column: x => x.Veilingmeester_Id,
                        principalTable: "Gebruikers",
                        principalColumn: "Gebruiker_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Biedingen",
                columns: table => new
                {
                    Bieding_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Bedrag = table.Column<float>(type: "real", nullable: false),
                    Tijdstip = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Klant_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Product_Id = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Biedingen", x => x.Bieding_Id);
                    table.ForeignKey(
                        name: "FK_Biedingen_Gebruikers_Klant_Id",
                        column: x => x.Klant_Id,
                        principalTable: "Gebruikers",
                        principalColumn: "Gebruiker_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Biedingen_Producten_Product_Id",
                        column: x => x.Product_Id,
                        principalTable: "Producten",
                        principalColumn: "Product_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VeilingProducten",
                columns: table => new
                {
                    VeilingProduct_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Veiling_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Product_Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Hoeveelheid = table.Column<int>(type: "int", nullable: false),
                    Prijs = table.Column<float>(type: "real", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                        name: "FK_VeilingProducten_Veilingen_Veiling_Id",
                        column: x => x.Veiling_Id,
                        principalTable: "Veilingen",
                        principalColumn: "Veiling_Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Biedingen_Klant_Id",
                table: "Biedingen",
                column: "Klant_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Biedingen_Product_Id",
                table: "Biedingen",
                column: "Product_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Veilingen_Veilingmeester_Id",
                table: "Veilingen",
                column: "Veilingmeester_Id");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Product_Id",
                table: "VeilingProducten",
                column: "Product_Id");

            migrationBuilder.CreateIndex(
                name: "IX_VeilingProducten_Veiling_Id",
                table: "VeilingProducten",
                column: "Veiling_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Biedingen");

            migrationBuilder.DropTable(
                name: "VeilingProducten");

            migrationBuilder.DropTable(
                name: "Producten");

            migrationBuilder.DropTable(
                name: "Veilingen");

            migrationBuilder.DropTable(
                name: "Gebruikers");
        }
    }
}
