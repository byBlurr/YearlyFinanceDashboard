using System;
using System.Collections.Generic;
using System.Text;

namespace YearlyFinances.Core.Models
{
    public record FinanceForecast(
        decimal ThisYearSoFar,
        decimal RemainingProjected,
        decimal ForecastedYearlyTotal,
        decimal LastYearGrandTotal = 0
    )

    {
        public FinanceForecast(decimal ThisYearSoFar, decimal RemainingProjected, decimal ForecastedYearlyTotal)
            : this(ThisYearSoFar, RemainingProjected, ForecastedYearlyTotal, 0)
        {
        }
    }

    public record PaymentItem(
        int PaymentId,
        DateTime PaymentDate,
        decimal Amount,
        string ItemName,
        string CategoryName,
        string GroupName
    );
    public record BudgetVariance(
        decimal LastYearYtdTotal,
        decimal ThisYearYtdTotal,
        decimal YtdVariance,
        decimal PercentageChange
    );
    public record TrackedItem(
        int Id,
        int CategoryId,
        string Name,
        string? Description,
        int CountsTowardSavings
    );

    public record AssetCategory(int Id, string Name);

    public record AssetGroup(int Id, string Name, int CategoryId);

    public record UpcomingBillAlert(
        string ItemName,
        string CategoryName,
        DateTime EstimatedDueDate,
        int DaysRemaining,
        decimal EstimatedAmount
    );
}
