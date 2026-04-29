package com.costtracker.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryResponse(
        List<CurrencyTotal> totalAllTime,
        List<CurrencyTotal> totalThisMonth,
        List<CategoryTotal> byCategory
) {
    public record CurrencyTotal(
            String currency,
            BigDecimal amount
    ) {}

    public record CategoryTotal(
            String category,
            String displayName,
            String currency,
            BigDecimal total,
            long count
    ) {}
}
