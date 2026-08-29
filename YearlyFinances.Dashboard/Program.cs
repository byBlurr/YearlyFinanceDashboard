using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using YearlyFinances.Core.Repositories;

namespace YearlyFinances.Dashboard
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("MariaDbConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("The 'MariaDbConnection' configuration string is missing.");
            }

            builder.Services.AddScoped<IFinanceRepository>(_ => new FinanceRepository(connectionString));

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.MapGet("/api/dashboard/forecast", async (IFinanceRepository repo) =>
            {
                var summary = await repo.GetForecastSummaryAsync();
                return Results.Ok(summary);
            });

            app.MapGet("/api/dashboard/variance", async (IFinanceRepository repo) =>
            {
                var variance = await repo.GetYtdVarianceAsync();
                return Results.Ok(variance);
            });

            app.MapGet("/api/payments/{year:int}", async (int year, IFinanceRepository repo) =>
            {
                var payments = await repo.GetPaymentsByYearAsync(year);
                return Results.Ok(payments);
            });

            app.MapGet("/api/categories/{categoryId:int}/items", async (int categoryId, IFinanceRepository repo) =>
            {
                var items = await repo.GetCategoryItemsAsync(categoryId);
                return Results.Ok(items);
            });

            app.MapPost("/api/payments", async ([Required] AddPaymentRequest request, IFinanceRepository repo) =>
            {
                var createdId = await repo.AddPaymentAsync(request.ItemId, request.Amount, request.PaymentDate);
                return Results.Created($"/api/payments/{DateTime.Now.Year}", new { Id = createdId });
            });

            app.MapGet("/api/categories", async (IFinanceRepository repo) =>
                Results.Ok(await repo.GetAllCategoriesAsync()));

            app.MapPost("/api/categories", async ([Required] CreateCategoryRequest request, IFinanceRepository repo) =>
            {
                var createdId = await repo.AddCategoryAsync(request.Name);
                return Results.Created($"/api/categories", new { Id = createdId });
            });

            app.MapPost("/api/items", async ([Required] CreateItemRequest request, IFinanceRepository repo) =>
            {
                var createdId = await repo.AddItemAsync(request.CategoryId, request.GroupId, request.Name, request.Description ?? "", request.CountsTowardSavings);
                return Results.Created($"/api/categories/{request.CategoryId}/items", new { Id = createdId });
            });

            app.MapGet("/api/items/{itemId:int}/payments", async (int itemId, IFinanceRepository repo) =>
                Results.Ok(await repo.GetPaymentsForItemAsync(itemId)));

            app.MapGet("/api/groups", async (IFinanceRepository repo) =>
                Results.Ok(await repo.GetAllGroupsAsync()));

            app.MapGet("/api/groups/{groupId:int}/payments", async (int groupId, IFinanceRepository repo) =>
                Results.Ok(await repo.GetGroupPaymentsSummaryAsync(groupId)));

            app.MapPost("/api/groups", async ([Required] CreateGroupRequest request, IFinanceRepository repo) =>
            {
                var createdId = await repo.AddGroupAsync(request.Name, request.CategoryId);
                return Results.Created($"/api/groups", new { Id = createdId });
            });

            app.MapGet("/api/dashboard/alerts", async (IFinanceRepository repo) =>
                Results.Ok(await repo.GetUpcomingBillsAsync()));

            app.MapGet("/api/health/database", async (IFinanceRepository repo) =>
            {
                var watch = Stopwatch.StartNew();
                var isAlive = await repo.PingDatabaseAsync();
                watch.Stop();

                if (!isAlive)
                {
                    return Results.Json(new { status = "Disconnected", latencyMs = 0 }, statusCode: 503);
                }

                return Results.Ok(new { status = "Connected", latencyMs = watch.ElapsedMilliseconds });
            });

            app.Run();
        }
    }

    public record AddPaymentRequest(
        [Required] int ItemId,
        [Required] decimal Amount,
        [Required] DateTime PaymentDate
    );
    public record CreateCategoryRequest([Required] string Name);
    public record CreateItemRequest([Required] int CategoryId, int? GroupId, [Required] string Name, string? Description, [Required] int CountsTowardSavings);
    public record CreateGroupRequest([Required] string Name, [Required] int CategoryId);
}
