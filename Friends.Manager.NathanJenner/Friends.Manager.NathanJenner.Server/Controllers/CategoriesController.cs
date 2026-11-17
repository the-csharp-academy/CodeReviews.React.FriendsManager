using Friends.Manager.NathanJenner.Server.Contracts;
using Friends.Manager.NathanJenner.Server.Data;
using Friends.Manager.NathanJenner.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Friends.Manager.NathanJenner.Server.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await db.Categories.AsNoTracking()
            .OrderBy(category => category.Name).ToListAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.AsNoTracking()
            .SingleOrDefaultAsync(category => category.Id == id, cancellationToken);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CategoryRequest request, CancellationToken cancellationToken)
    {
        var category = new CategoryModel { Name = request.Name.Trim() };
        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await db.Categories.SingleOrDefaultAsync(category => category.Id == id, cancellationToken);
        if (category is null)
            return NotFound();

        category.Name = request.Name.Trim();
        await db.SaveChangesAsync(cancellationToken);
        return Ok(category);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.SingleOrDefaultAsync(category => category.Id == id, cancellationToken);
        if (category is null)
            return NotFound();

        if (await db.Friends.AnyAsync(friend => friend.CategoryId == id, cancellationToken))
        {
            return Problem(statusCode: StatusCodes.Status409Conflict,
                title: "Category is in use",
                detail: "Reassign or delete its friends before deleting this category.");
        }

        db.Categories.Remove(category);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
