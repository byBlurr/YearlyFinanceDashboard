using System;
using System.Collections.Generic;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using Dapper;
using MySqlConnector;
using YearlyFinances.Core.Common;
using YearlyFinances.Core.Models;

namespace YearlyFinances.Core.Repositories
{
    public class FinanceRepository : IFinanceRepository
    {
        private readonly string _connectionString;

        public FinanceRepository(string connectionString)
        {
            _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        }

        private MySqlConnection CreateConnection()
        {
            return new MySqlConnection(_connectionString);
        }

        public async Task<FinanceForecast> GetForecastSummaryAsync(CancellationToken ct = default)
        {
            using var db = CreateConnection();

            const string forecastQuery = "SELECT this_year_so_far AS ThisYearSoFar, remaining_projected AS RemainingProjected, forecasted_yearly_total AS ForecastedYearlyTotal FROM view_forecasted_finance_summary LIMIT 1;";
            var liveData = await db.QueryFirstOrDefaultAsync<FinanceForecast>(new CommandDefinition(forecastQuery, cancellationToken: ct))
                           ?? new FinanceForecast(0, 0, 0, 0);

            const string historicalQuery = "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE YEAR(payment_date) = YEAR(CURRENT_DATE) - 1;";
            var lastYearTotal = await db.ExecuteScalarAsync<decimal>(new CommandDefinition(historicalQuery, cancellationToken: ct));

            return liveData with { LastYearGrandTotal = lastYearTotal };
        }

        public async Task<IEnumerable<PaymentItem>> GetPaymentsByYearAsync(int year, CancellationToken ct = default)
        {
            using var db = CreateConnection();

            return await db.QueryAsync<PaymentItem>(
                new CommandDefinition(SqlQueries.GetPaymentsByYear, new { Year = year }, cancellationToken: ct)
            );
        }

        public async Task<BudgetVariance> GetYtdVarianceAsync(CancellationToken ct = default)
        {
            using var db = CreateConnection();

            var result = await db.QueryFirstOrDefaultAsync<BudgetVariance>(
                new CommandDefinition(SqlQueries.GetYtdVariance, cancellationToken: ct)
            );

            return result ?? new BudgetVariance(0.00m, 0.00m, 0.00m, 0.00m);
        }

        public async Task<int> AddPaymentAsync(int itemId, decimal amount, DateTime paymentDate, CancellationToken ct = default)
        {
            using var db = CreateConnection();

            var parameters = new { ItemId = itemId, Amount = amount, PaymentDate = paymentDate };

            return await db.ExecuteScalarAsync<int>(
                new CommandDefinition(SqlQueries.AddPayment, parameters, cancellationToken: ct)
            );
        }

        public async Task<IEnumerable<TrackedItem>> GetCategoryItemsAsync(int categoryId, CancellationToken ct = default)
        {
            using var db = CreateConnection();

            return await db.QueryAsync<TrackedItem>(
                new CommandDefinition(SqlQueries.GetCategoryItems, new { CategoryId = categoryId }, cancellationToken: ct)
            );
        }

        public async Task<int> AddCategoryAsync(string name, CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.ExecuteScalarAsync<int>(new CommandDefinition(SqlQueries.AddCategory, new { Name = name }, cancellationToken: ct));
        }

        public async Task<int> AddItemAsync(int categoryId, int? groupId, string name, string description, CancellationToken ct = default)
        {
            using var db = CreateConnection();
            var parameters = new { CategoryId = categoryId, GroupId = groupId, Name = name, Description = description };
            return await db.ExecuteScalarAsync<int>(new CommandDefinition(SqlQueries.AddItem, parameters, cancellationToken: ct));
        }


        public async Task<IEnumerable<AssetCategory>> GetAllCategoriesAsync(CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.QueryAsync<AssetCategory>(new CommandDefinition(SqlQueries.GetAllCategories, cancellationToken: ct));
        }
        public async Task<IEnumerable<PaymentItem>> GetPaymentsForItemAsync(int itemId, CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.QueryAsync<PaymentItem>(new CommandDefinition(SqlQueries.GetPaymentsForItem, new { ItemId = itemId }, cancellationToken: ct));
        }

        public async Task<IEnumerable<AssetGroup>> GetAllGroupsAsync(CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.QueryAsync<AssetGroup>(new CommandDefinition(SqlQueries.GetAllGroups, cancellationToken: ct));
        }

        public async Task<IEnumerable<PaymentItem>> GetGroupPaymentsSummaryAsync(int groupId, CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.QueryAsync<PaymentItem>(new CommandDefinition(SqlQueries.GetGroupPaymentsSummary, new { GroupId = groupId }, cancellationToken: ct));
        }

        public async Task<int> AddGroupAsync(string name, int categoryId, CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.ExecuteScalarAsync<int>(new CommandDefinition(SqlQueries.AddGroup, new { Name = name, CategoryId = categoryId }, cancellationToken: ct));
        }
        public async Task<IEnumerable<UpcomingBillAlert>> GetUpcomingBillsAsync(CancellationToken ct = default)
        {
            using var db = CreateConnection();
            return await db.QueryAsync<UpcomingBillAlert>(new CommandDefinition(SqlQueries.GetUpcomingBills, cancellationToken: ct));
        }

        public async Task<bool> PingDatabaseAsync(CancellationToken ct = default)
        {
            try
            {
                using var db = CreateConnection();
                await db.ExecuteScalarAsync<int>(new CommandDefinition(SqlQueries.DatabasePing, cancellationToken: ct));
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
