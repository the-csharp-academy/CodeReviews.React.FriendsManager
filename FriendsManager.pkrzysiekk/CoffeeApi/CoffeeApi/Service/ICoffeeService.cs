using CoffeeApi.Models;

namespace CoffeeApi.Service;

public interface ICoffeeService
{
    public Task Add(CoffeeConsumption coffeeConsumption);
    public Task Update(CoffeeConsumption coffeeConsumption);
    public Task Delete(CoffeeConsumption coffeeConsumption);
    public Task<IEnumerable<CoffeeConsumption>> GetPaginatedList(int page, int size);
    
}