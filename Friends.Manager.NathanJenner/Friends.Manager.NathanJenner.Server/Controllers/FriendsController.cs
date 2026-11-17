using Friends.Manager.NathanJenner.Server.Contracts;
using Friends.Manager.NathanJenner.Server.Data;
using Friends.Manager.NathanJenner.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Friends.Manager.NathanJenner.Server.Controllers;

[ApiController]
[Route("api/friends")]
public sealed class FriendsController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await db.Friends.AsNoTracking()
            .OrderBy(friend => friend.Name).ToListAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var friend = await db.Friends.AsNoTracking()
            .SingleOrDefaultAsync(friend => friend.Id == id, cancellationToken);
        return friend is null ? NotFound() : Ok(friend);
    }

    [HttpPost]
    public async Task<IActionResult> Create(FriendRequest request, CancellationToken cancellationToken)
    {
        if (!await db.Categories.AnyAsync(category => category.Id == request.CategoryId, cancellationToken))
        {
            ModelState.AddModelError(nameof(request.CategoryId), "Select an existing category.");
            return ValidationProblem(ModelState);
        }

        var friend = new FriendModel();
        Apply(request, friend);
        db.Friends.Add(friend);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = friend.Id }, friend);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, FriendRequest request, CancellationToken cancellationToken)
    {
        var friend = await db.Friends.SingleOrDefaultAsync(friend => friend.Id == id, cancellationToken);
        if (friend is null)
            return NotFound();

        if (!await db.Categories.AnyAsync(category => category.Id == request.CategoryId, cancellationToken))
        {
            ModelState.AddModelError(nameof(request.CategoryId), "Select an existing category.");
            return ValidationProblem(ModelState);
        }

        Apply(request, friend);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(friend);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var friend = await db.Friends.SingleOrDefaultAsync(friend => friend.Id == id, cancellationToken);
        if (friend is null)
            return NotFound();

        db.Friends.Remove(friend);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static void Apply(FriendRequest request, FriendModel friend)
    {
        friend.Name = request.Name.Trim();
        friend.LastContactDate = request.LastContactDate;
        friend.LastContactType = request.LastContactType;
        friend.DesiredContactFrequencyDays = request.DesiredContactFrequencyDays;
        friend.CategoryId = request.CategoryId;
    }
}
