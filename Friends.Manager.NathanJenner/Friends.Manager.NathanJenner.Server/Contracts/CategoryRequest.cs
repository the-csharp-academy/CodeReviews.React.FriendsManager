using System.ComponentModel.DataAnnotations;

namespace Friends.Manager.NathanJenner.Server.Contracts;

public sealed class CategoryRequest
{
    [Required, StringLength(80)]
    public string Name { get; set; } = "";
}
