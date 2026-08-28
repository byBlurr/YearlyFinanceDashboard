using System;
using System.Threading.Tasks;
using Xunit;
using YearlyFinances.Core.Repositories;
using Microsoft.Extensions.Configuration;

namespace YearlyFinances.Tests.Repositories
{
    public class FinanceRepositoryTests
    {
        private readonly string _connectionString;

        public FinanceRepositoryTests()
        {
            var configuration = new ConfigurationBuilder()
                .AddUserSecrets<FinanceRepositoryTests>()
                .Build();

            _connectionString = configuration.GetConnectionString("MariaDbConnection");

            if (string.IsNullOrWhiteSpace(_connectionString))
            {
                throw new InvalidOperationException(
                    "Database connection string was not found in User Secrets. " +
                    "Please run: dotnet user-secrets set \"ConnectionStrings:MariaDbConnection\" \"your_connection_string\" --project YearlyFinances.Tests"
                );
            }
        }

        [Fact]
        public async Task GetForecastSummaryAsync_ShouldReturnValidModel_EvenIfEmpty()
        {
            var repository = new FinanceRepository(_connectionString);
            var forecast = await repository.GetForecastSummaryAsync();
            Assert.NotNull(forecast);
            Assert.True(forecast.ThisYearSoFar >= 0.00m);
            Assert.True(forecast.RemainingProjected >= 0.00m);
            Assert.True(forecast.ForecastedYearlyTotal >= 0.00m);
        }
    }
}
