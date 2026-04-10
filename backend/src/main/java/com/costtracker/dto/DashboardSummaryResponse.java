package com.costtracker.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryResponse(
        BigDecimal totalAllTime,
        BigDecimal totalThisMonth,
        List<CategoryTotal> byCategory
) {
    public record CategoryTotal(
            String category,
            String displayName,
            BigDecimal total,
            long count
    ) {}
}
