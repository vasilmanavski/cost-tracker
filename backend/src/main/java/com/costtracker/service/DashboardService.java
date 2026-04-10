package com.costtracker.service;

import com.costtracker.dto.DashboardSummaryResponse;
import com.costtracker.dto.DashboardSummaryResponse.CategoryTotal;
import com.costtracker.model.Category;
import com.costtracker.repository.CategoryRepository;
import com.costtracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public DashboardService(ExpenseRepository expenseRepository, CategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
    }

    public DashboardSummaryResponse getSummary(Long userId, YearMonth month) {
        LocalDate monthStart = month.atDay(1);
        LocalDate monthEnd = month.atEndOfMonth();

        BigDecimal totalAllTime = expenseRepository.sumAllExpenses(userId);
        BigDecimal totalThisMonth = expenseRepository.sumExpensesInRange(userId, monthStart, monthEnd);

        Map<String, String> categoryDisplayNames = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getName, Category::getDisplayName));

        List<Object[]> rawCategories = expenseRepository.sumByCategoryInRange(userId, monthStart, monthEnd);

        List<CategoryTotal> byCategory = rawCategories.stream()
                .map(row -> new CategoryTotal(
                        (String) row[0],
                        categoryDisplayNames.getOrDefault((String) row[0], (String) row[0]),
                        (BigDecimal) row[1],
                        (Long) row[2]
                ))
                .toList();

        return new DashboardSummaryResponse(totalAllTime, totalThisMonth, byCategory);
    }
}
