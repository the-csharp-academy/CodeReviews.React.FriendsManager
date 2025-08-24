using CoffeeApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CoffeeApi.Data;

public class CoffeeContext : DbContext
{
    public DbSet<CoffeeConsumption>  CoffeeConsumption { get; set; }

    public CoffeeContext(DbContextOptions<CoffeeContext> options) : base(options){}
    
}