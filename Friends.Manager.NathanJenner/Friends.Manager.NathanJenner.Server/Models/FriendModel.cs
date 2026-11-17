using System.Text.Json.Serialization;

namespace Friends.Manager.NathanJenner.Server.Models;

public class FriendModel
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public DateOnly LastContactDate { get; set; }
    public string LastContactType { get; set; } = "Unknown";
    public int DesiredContactFrequencyDays { get; set; }
    public int CategoryId { get; set; }

    [JsonIgnore]
    public CategoryModel Category { get; set; } = null!;
}


