using Friends.Manager.NathanJenner.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace Friends.Manager.NathanJenner.Server.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        var databaseCreator = db.GetService<IRelationalDatabaseCreator>();
        if (await databaseCreator.ExistsAsync(cancellationToken))
            return;

        await db.Database.MigrateAsync(cancellationToken);

        CategoryModel[] categories =
        [
            new() { Name = "Family" },
            new() { Name = "School friends" },
            new() { Name = "Work friends" },
            new() { Name = "Neighbors" },
            new() { Name = "Hobbies" },
        ];
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        FriendModel CreateFriend(string name, int categoryIndex, int daysSinceContact, string contactType, int frequencyDays) => new()
        {
            Name = name,
            Category = categories[categoryIndex],
            LastContactDate = today.AddDays(-daysSinceContact),
            LastContactType = contactType,
            DesiredContactFrequencyDays = frequencyDays,
        };

        db.Categories.AddRange(categories);
        db.Friends.AddRange(
            CreateFriend("Alex Morgan", 0, 10, "Phone", 7),
            CreateFriend("Jamie Taylor", 0, 2, "Text", 7),
            CreateFriend("Jordan Lee", 1, 40, "Video", 30),
            CreateFriend("Casey Parker", 1, 7, "Text", 7),
            CreateFriend("Riley Bennett", 2, 14, "Email", 7),
            CreateFriend("Sam Rivera", 2, 1, "InPerson", 14),
            CreateFriend("Taylor Brooks", 3, 21, "InPerson", 14),
            CreateFriend("Avery Collins", 3, 0, "Text", 30),
            CreateFriend("Quinn Hayes", 4, 5, "Phone", 14));

        await db.SaveChangesAsync(cancellationToken);
    }
}
