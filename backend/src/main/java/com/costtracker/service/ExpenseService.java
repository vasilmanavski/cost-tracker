package com.costtracker.service;

import com.costtracker.dto.CreateExpenseRequest;
import com.costtracker.dto.ExpenseResponse;
import com.costtracker.dto.UpdateExpenseRequest;
import com.costtracker.model.Expense;
import com.costtracker.model.User;
import com.costtracker.repository.CategoryRepository;
import com.costtracker.repository.ExpenseRepository;
import com.costtracker.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public Page<ExpenseResponse> listExpenses(Long userId, String category, LocalDate from, LocalDate to, Pageable pageable) {
        return expenseRepository.findFiltered(userId, category, from, to, pageable)
                .map(ExpenseResponse::from);
    }

    public ExpenseResponse getExpense(Long userId, Long id) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found: " + id));
        return ExpenseResponse.from(expense);
    }

    public ExpenseResponse createExpense(Long userId, CreateExpenseRequest request) {
        validateCategory(request.category());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setMerchant(request.merchant());
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setCurrency(request.currency());
        expense.setCategory(request.category());
        expense.setExpenseDate(LocalDate.parse(request.expenseDate()));
        expense.setSourceType(request.sourceType());
        expense.setReceiptImagePath(request.receiptImagePath());
        expense.setLineItemsJson(request.lineItemsJson());
        expense.setExtractionConfidence(request.extractionConfidence());
        expense.setNeedsReview(request.needsReview() != null && request.needsReview());
        expense.setNotes(request.notes());

        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(Long userId, Long id, UpdateExpenseRequest request) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found: " + id));

        validateCategory(request.category());

        expense.setMerchant(request.merchant());
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setCurrency(request.currency());
        expense.setCategory(request.category());
        expense.setExpenseDate(LocalDate.parse(request.expenseDate()));
        expense.setNotes(request.notes());

        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(Long userId, Long id) {
        if (!expenseRepository.existsByIdAndUserId(id, userId)) {
            throw new IllegalArgumentException("Expense not found: " + id);
        }
        expenseRepository.deleteByIdAndUserId(id, userId);
    }

    private void validateCategory(String categoryName) {
        if (!categoryRepository.existsByName(categoryName)) {
            throw new IllegalArgumentException("Invalid category: " + categoryName);
        }
    }
}
