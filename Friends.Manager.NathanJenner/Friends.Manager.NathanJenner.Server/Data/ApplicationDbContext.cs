using Friends.Manager.NathanJenner.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Friends.Manager.NathanJenner.Server.Data;

public class ApplicationDbContext: DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {

    }
    public DbSet<FriendModel> Friends { get; set; }
    public DbSet<CategoryModel> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FriendModel>()
            .HasOne(friend => friend.Category)
            .WithMany()
            .HasForeignKey(friend => friend.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
