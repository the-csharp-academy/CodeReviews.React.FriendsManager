using System.ComponentModel.DataAnnotations;

namespace Friends.Manager.NathanJenner.Server.Contracts;

public sealed class FriendRequest : IValidatableObject
{
    [Required, StringLength(100)]
    public string Name { get; set; } = "";

    public DateOnly LastContactDate { get; set; }

    [Required]
    [RegularExpression("^(Unknown|Text|Phone|Video|InPerson|Email|Other)$")]
    public string LastContactType { get; set; } = "";

    [Range(1, 3650)]
    public int DesiredContactFrequencyDays { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (LastContactDate == default || LastContactDate > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            yield return new ValidationResult(
                "Last contact date is required and cannot be in the future.",
                [nameof(LastContactDate)]);
        }
    }
}
