namespace CoffeeApi.Models;

public class CoffeeConsumption
{
    public int Id { get; set; }
    public required string  TypeOfCoffee { get; set; }
    public DateTime ConsumedAt { get; set; }
    public int Caffeine { get; set; }
}