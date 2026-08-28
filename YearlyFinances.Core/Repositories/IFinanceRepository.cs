using YearlyFinances.Core.Models;

namespace YearlyFinances.Core.Repositories
{
    public interface IFinanceRepository
    {
        Task<FinanceForecast> GetForecastSummaryAsync(CancellationToken ct = default);
        Task<IEnumerable<PaymentItem>> GetPaymentsByYearAsync(int year, CancellationToken ct = default);
        Task<BudgetVariance> GetYtdVarianceAsync(CancellationToken ct = default);
        Task<int> AddPaymentAsync(int itemId, decimal amount, DateTime paymentDate, CancellationToken ct = default);
        Task<IEnumerable<TrackedItem>> GetCategoryItemsAsync(int categoryId, CancellationToken ct = default);
        Task<int> AddCategoryAsync(string name, CancellationToken ct = default);
        Task<int> AddItemAsync(int categoryId, int? groupId, string name, string description, CancellationToken ct = default);
        Task<IEnumerable<AssetCategory>> GetAllCategoriesAsync(CancellationToken ct = default);
        Task<IEnumerable<PaymentItem>> GetPaymentsForItemAsync(int itemId, CancellationToken ct = default);
        Task<IEnumerable<AssetGroup>> GetAllGroupsAsync(CancellationToken ct = default);
        Task<IEnumerable<PaymentItem>> GetGroupPaymentsSummaryAsync(int groupId, CancellationToken ct = default);
        Task<int> AddGroupAsync(string name, int categoryId, CancellationToken ct = default);
        Task<IEnumerable<UpcomingBillAlert>> GetUpcomingBillsAsync(CancellationToken ct = default);
    }
}
