using CoffeeApi.Data;
using CoffeeApi.Models;
using CoffeeApi.Repository;
using Microsoft.EntityFrameworkCore;

namespace CoffeeApi.Service;

public class CoffeeService :ICoffeeService
{
    private readonly IRepository<CoffeeConsumption> _coffeeRepository;

    public CoffeeService(IRepository<CoffeeConsumption> coffeeConsumptionRepository)
    {
       _coffeeRepository = coffeeConsumptionRepository; 
    }
    public async Task Add(CoffeeConsumption coffeeConsumption)
    {
        try
        {
           await _coffeeRepository.Create(coffeeConsumption);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task Update(CoffeeConsumption coffeeConsumption)
    {
        try
        {
            await _coffeeRepository.Update(coffeeConsumption);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task Delete(CoffeeConsumption coffeeConsumption)
    {
        try
        {
            await _coffeeRepository.Delete(coffeeConsumption);
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<IEnumerable<CoffeeConsumption>> GetPaginatedList(int page, int size)
    {
        return await _coffeeRepository.GetAll()
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();
    }
}