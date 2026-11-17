using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Friends.Manager.NathanJenner.Server.Migrations
{
    /// <inheritdoc />
    public partial class CompleteFriendships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friends_Categories_CategoryId",
                table: "Friends");

            migrationBuilder.AddColumn<string>(
                name: "LastContactType",
                table: "Friends",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Unknown");

            migrationBuilder.AddColumn<int>(
                name: "DesiredContactFrequencyDays",
                table: "Friends",
                type: "int",
                nullable: false,
                defaultValue: 30);

            migrationBuilder.Sql("""
                IF EXISTS (
                    SELECT 1 FROM Friends
                    WHERE LOWER(LTRIM(RTRIM(ContactFrequency)))
                        NOT IN ('daily', 'weekly', 'monthly', 'yearly', '0', '1', '2', '3')
                )
                BEGIN
                    THROW 50001, 'Unrecognized ContactFrequency. Map legacy values before migrating.', 1;
                END;

                UPDATE Friends
                SET DesiredContactFrequencyDays =
                    CASE LOWER(LTRIM(RTRIM(ContactFrequency)))
                        WHEN 'daily' THEN 1 WHEN '0' THEN 1
                        WHEN 'weekly' THEN 7 WHEN '1' THEN 7
                        WHEN 'monthly' THEN 30 WHEN '2' THEN 30
                        WHEN 'yearly' THEN 365 WHEN '3' THEN 365
                    END;
                """);

            migrationBuilder.DropColumn(name: "ContactFrequency", table: "Friends");

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_Categories_CategoryId",
                table: "Friends",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friends_Categories_CategoryId",
                table: "Friends");

            migrationBuilder.AddColumn<string>(
                name: "ContactFrequency",
                table: "Friends",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE Friends
                SET ContactFrequency =
                    CASE DesiredContactFrequencyDays
                        WHEN 1 THEN 'Daily'
                        WHEN 7 THEN 'Weekly'
                        WHEN 30 THEN 'Monthly'
                        WHEN 365 THEN 'Yearly'
                        ELSE CONVERT(nvarchar(20), DesiredContactFrequencyDays)
                    END;
                """);

            migrationBuilder.DropColumn(name: "DesiredContactFrequencyDays", table: "Friends");
            migrationBuilder.DropColumn(name: "LastContactType", table: "Friends");

            migrationBuilder.AddForeignKey(
                name: "FK_Friends_Categories_CategoryId",
                table: "Friends",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
