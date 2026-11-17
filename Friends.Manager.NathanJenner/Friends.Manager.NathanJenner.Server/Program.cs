using Friends.Manager.NathanJenner.Server.Data;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("DefaultConnection is not configured.")));

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DatabaseInitializer.InitializeAsync(db, app.Lifetime.ApplicationStopping);
}

app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>()
        .CreateLogger("ApiErrors");
    logger.LogError(exception, "Request failed: {Path}", context.Request.Path);

    var conflict = exception is DbUpdateConcurrencyException ||
        exception is DbUpdateException
        {
            InnerException: SqlException { Number: 547 or 2601 or 2627 }
        };

    await Results.Problem(
        statusCode: conflict ? 409 : 500,
        title: conflict ? "The data conflicts with another record." : "Server error",
        detail: conflict
            ? "Refresh the page, check the category, and try again."
            : "The request could not be completed. Please try again later.")
        .ExecuteAsync(context);
}));

app.UseStatusCodePages();
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.MapControllers();
app.MapFallback("/api/{**path}", () => Results.NotFound());
app.MapFallbackToFile("/index.html");

app.Run();

public partial class Program;



