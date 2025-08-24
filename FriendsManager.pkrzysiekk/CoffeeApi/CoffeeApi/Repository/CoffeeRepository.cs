using CoffeeApi.Data;
using CoffeeApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CoffeeApi.Repository;

public class CoffeeRepository :IRepository<CoffeeConsumption>
{
    private readonly CoffeeContext _context;
    public CoffeeRepository(CoffeeContext context)
    {
       _context = context; 
    }
    public async Task Create(CoffeeConsumption item)
    {
        try
        {
            await _context.CoffeeConsumption.AddAsync(item);
        }
        catch (Exception ex)
        {
            throw;
        }
        await SaveChanges();
    }

    public async Task Update(CoffeeConsumption item)
    {
        var itemToUpdate=await GetById(item.Id);
        if (itemToUpdate == null)
            return;
        itemToUpdate.TypeOfCoffee=item.TypeOfCoffee;
        itemToUpdate.Caffeine=item.Caffeine;
        itemToUpdate.ConsumedAt=item.ConsumedAt;
        try
        {
             _context.CoffeeConsumption.Update(itemToUpdate);
        }
        catch (Exception ex)
        {
            throw;
        }

        await SaveChanges();
    }

    public async Task Delete(CoffeeConsumption item)
    {
       var itemToDelete = 
           await _context.CoffeeConsumption.FindAsync(item.Id);
       if(itemToDelete == null)
           return;
       try
       {
           _context.CoffeeConsumption.Remove(itemToDelete);
       }
       catch (Exception ex)
       {
           throw;
       }

       await SaveChanges();

    }

    public async Task<CoffeeConsumption?> GetById(int id)
    {
        return await _context.CoffeeConsumption.FindAsync(id);
    }

    public IQueryable<CoffeeConsumption> GetAll()
    {
        return _context.CoffeeConsumption.AsQueryable();
    }

    public async Task SaveChanges()
    {
        await _context.SaveChangesAsync();
    }
}