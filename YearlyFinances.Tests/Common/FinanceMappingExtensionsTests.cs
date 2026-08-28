using Xunit;
using YearlyFinances.Core.Common;

namespace YearlyFinances.Tests.Common
{
    public class FinanceMappingExtensionsTests
    {
        [Fact]
        public void ToUkCurrency_ShouldFormatWithPoundSignAndTwoDecimals()
        {
            decimal amount = 1250.50m;
            string result = amount.ToUkCurrency();
            string cleanResult = result.Replace("\u00A0", " ").Trim();
            Assert.Contains("£1,250.50", cleanResult);
        }

        [Theory]
        [InlineData(12.55, "+12.55%")]
        [InlineData(-5.00, "-5.00%")]
        [InlineData(0.00, "0.00%")]
        public void ToPercentageDisplay_ShouldFormatWithCorrectSign(decimal input, string expected)
        {
            string result = input.ToPercentageDisplay();
            Assert.Equal(expected, result);
        }
    }
}
