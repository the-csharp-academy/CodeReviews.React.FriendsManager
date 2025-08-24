using CoffeeApi.Data;
using CoffeeApi.Models;
using CoffeeApi.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CoffeeApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoffeeController : ControllerBase
    {
        private readonly ICoffeeService  _coffeeService;

        public CoffeeController(ICoffeeService coffeeService)
        {
            _coffeeService = coffeeService;
        }
        [HttpGet]
        public async Task<IEnumerable<CoffeeConsumption>> 
            GetPaginatedResult([FromQuery] int page, [FromQuery] int size)
        {
            var paginatedResult= await 
                _coffeeService.GetPaginatedList(page, size);
            return paginatedResult;
        }

        [HttpPost]
        public async Task Create([FromBody] CoffeeConsumption coffeeConsumption)
        {
            await _coffeeService.Add(coffeeConsumption);
        }

        [HttpPut]
        public async Task Update( [FromBody] CoffeeConsumption coffeeConsumption)
        {
            await _coffeeService.Update(coffeeConsumption);
        }

        [HttpDelete]
        public async Task Delete( [FromBody] CoffeeConsumption coffeeConsumption )
        {
            await _coffeeService.Delete(coffeeConsumption);
        }
    }
}
