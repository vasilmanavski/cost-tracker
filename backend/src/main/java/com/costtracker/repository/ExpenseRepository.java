package com.costtracker.repository;

import com.costtracker.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:from IS NULL OR e.expenseDate >= :from) AND " +
           "(:to IS NULL OR e.expenseDate <= :to) " +
           "ORDER BY e.expenseDate DESC, e.createdAt DESC")
    Page<Expense> findFiltered(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumAllExpenses(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.expenseDate >= :monthStart AND e.expenseDate <= :monthEnd")
    BigDecimal sumExpensesInRange(
            @Param("userId") Long userId,
            @Param("monthStart") LocalDate monthStart,
            @Param("monthEnd") LocalDate monthEnd
    );

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0), COUNT(e) FROM Expense e " +
           "WHERE e.user.id = :userId AND e.expenseDate >= :monthStart AND e.expenseDate <= :monthEnd " +
           "GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> sumByCategoryInRange(
            @Param("userId") Long userId,
            @Param("monthStart") LocalDate monthStart,
            @Param("monthEnd") LocalDate monthEnd
    );

    void deleteByIdAndUserId(Long id, Long userId);
}
