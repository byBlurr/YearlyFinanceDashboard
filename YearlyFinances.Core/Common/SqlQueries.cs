namespace YearlyFinances.Core.Common
{
    public static class SqlQueries
    {
        public const string GetForecastSummary = """
            SELECT 
                this_year_so_far AS ThisYearSoFar, 
                remaining_projected AS RemainingProjected, 
                forecasted_yearly_total AS ForecastedYearlyTotal 
            FROM view_forecasted_finance_summary;
            """;

        public const string GetPaymentsByYear = """
            SELECT 
                p.id AS PaymentId,
                p.payment_date AS PaymentDate,
                p.amount AS Amount,
                i.name AS ItemName,
                c.name AS CategoryName,
                COALESCE(g.name, 'Unassigned') AS GroupName
            FROM payments p
            INNER JOIN items i ON p.item_id = i.id
            INNER JOIN categories c ON i.category_id = c.id
            LEFT JOIN groups g ON i.group_id = g.id
            WHERE YEAR(p.payment_date) = @Year
            ORDER BY p.payment_date DESC;
            """;

        public const string GetYtdVariance = """
            SELECT 
                last_year_ytd_total AS LastYearYtdTotal,
                this_year_ytd_total AS ThisYearYtdTotal,
                ytd_variance AS YtdVariance,
                percentage_change AS PercentageChange
            FROM (
                SELECT 
                    last_year_ytd_total,
                    this_year_ytd_total,
                    ytd_variance,
                    COALESCE(ROUND((ytd_variance / NULLIF(last_year_ytd_total, 0)) * 100, 2), 0.00) AS percentage_change
                FROM (
                    SELECT 
                        SUM(CASE WHEN YEAR(payment_date) = YEAR(CURRENT_DATE) - 1 THEN amount ELSE 0 END) AS last_year_ytd_total,
                        SUM(CASE WHEN YEAR(payment_date) = YEAR(CURRENT_DATE) THEN amount ELSE 0 END) AS this_year_ytd_total,
                        SUM(CASE WHEN YEAR(payment_date) = YEAR(CURRENT_DATE) THEN amount ELSE 0 END) -
                        SUM(CASE WHEN YEAR(payment_date) = YEAR(CURRENT_DATE) - 1 THEN amount ELSE 0 END) AS ytd_variance
                    FROM payments
                    WHERE DAYOFYEAR(payment_date) <= DAYOFYEAR(CURRENT_DATE)
                ) AS ytd_totals
            ) AS final_variance;
            """;
        public const string AddPayment = """
            INSERT INTO payments (item_id, amount, payment_date)
            VALUES (@ItemId, @Amount, @PaymentDate);
            SELECT LAST_INSERT_ID();
            """;

        public const string GetCategoryItems = """
            SELECT 
                i.id AS Id, 
                i.category_id AS CategoryId, 
                i.name AS Name, 
                i.description AS Description,
                i.counts_toward_savings AS CountsTowardSavings
            FROM items i
            INNER JOIN categories c ON i.category_id = c.id
            WHERE c.id = @CategoryId;
            """;

        public const string AddCategory = """
            INSERT INTO categories (name) VALUES (@Name);
            SELECT LAST_INSERT_ID();
            """;

        public const string AddItem = """
            INSERT INTO items (category_id, group_id, name, description, counts_toward_savings) 
            VALUES (@CategoryId, @GroupId, @Name, @Description, @CountsTowardSavings);
            SELECT LAST_INSERT_ID();
            """;

        public const string GetAllCategories = """
            SELECT id AS Id, name AS Name FROM categories ORDER BY name ASC;
            """;

        public const string GetPaymentsForItem = """
            SELECT 
                p.id AS PaymentId,
                p.payment_date AS PaymentDate,
                p.amount AS Amount,
                i.name AS ItemName,
                c.name AS CategoryName,
                COALESCE(g.name, 'Unassigned') AS GroupName
            FROM payments p
            INNER JOIN items i ON p.item_id = i.id
            INNER JOIN categories c ON i.category_id = c.id
            LEFT JOIN groups g ON i.group_id = g.id
            WHERE p.item_id = @ItemId
            ORDER BY p.payment_date DESC;
            """;

        public const string GetAllGroups = """
            SELECT id AS Id, name AS Name, category_id AS CategoryId FROM groups ORDER BY name ASC;
            """;

        public const string AddGroup = """
            INSERT INTO groups (name, category_id) VALUES (@Name, @CategoryId);
            SELECT LAST_INSERT_ID();
            """;

        public const string GetGroupPaymentsSummary = """
            SELECT 
                p.id AS PaymentId,
                p.payment_date AS PaymentDate,
                p.amount AS Amount,
                i.name AS ItemName,
                c.name AS CategoryName,
                g.name AS GroupName
            FROM payments p
            INNER JOIN items i ON p.item_id = i.id
            INNER JOIN categories c ON i.category_id = c.id
            INNER JOIN groups g ON i.group_id = g.id
            WHERE g.id = @GroupId
            ORDER BY p.payment_date DESC;
            """;

        public const string GetUpcomingBills = """
            SELECT 
                i.name AS ItemName,
                c.name AS CategoryName,
                DATE_ADD(MAX(p.payment_date), INTERVAL 1 YEAR) AS EstimatedDueDate,
                DATEDIFF(DATE_ADD(MAX(p.payment_date), INTERVAL 1 YEAR), CURRENT_DATE) AS DaysRemaining,
                MAX(p.amount) AS EstimatedAmount
            FROM items i
            INNER JOIN payments p ON i.id = p.item_id
            INNER JOIN categories c ON i.category_id = c.id
            GROUP BY i.id, i.name, c.name
            HAVING DaysRemaining BETWEEN 0 AND 90
            ORDER BY DaysRemaining ASC;
            """;

        public const string DatabasePing = "SELECT 1;";
    }
}
