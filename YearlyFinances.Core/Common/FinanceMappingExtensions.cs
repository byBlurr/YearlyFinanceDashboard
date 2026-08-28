using System;
using System.Globalization;

namespace YearlyFinances.Core.Common
{
    public static class FinanceMappingExtensions
    {
        private static readonly CultureInfo UkCulture = new CultureInfo("en-GB");
        public static string ToUkCurrency(this decimal amount)
        {
            return amount.ToString("C", UkCulture);
        }

        public static string ToPercentageDisplay(this decimal percentage)
        {
            if (percentage > 0)
            {
                return $"+{percentage.ToString("F2", UkCulture)}%";
            }

            return $"{percentage.ToString("F2", UkCulture)}%";
        }
    }
}