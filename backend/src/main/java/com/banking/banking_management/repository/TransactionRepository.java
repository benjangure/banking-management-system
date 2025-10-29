package com.banking.banking_management.repository;

import com.banking.banking_management.entity.Account;
import com.banking.banking_management.entity.Transaction;
import com.banking.banking_management.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find all transactions for an account (both sent and received)
    @Query("SELECT t FROM Transaction t WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountIdPaginated(@Param("accountId") Long accountId, Pageable pageable);

    // Find transactions by account and type
    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId) AND t.transactionType = :type ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountIdAndType(@Param("accountId") Long accountId, @Param("type") TransactionType type);

    // Find transactions by account and date range
    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId) AND t.timestamp BETWEEN :startDate AND :endDate ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountIdAndDateRange(
            @Param("accountId") Long accountId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Get mini statement (last N transactions)
    @Query("SELECT t FROM Transaction t WHERE t.fromAccount.id = :accountId OR t.toAccount.id = :accountId ORDER BY t.timestamp DESC")
    List<Transaction> findTopNByAccountId(@Param("accountId") Long accountId, Pageable pageable);

    // Find by transaction ID
    Optional<Transaction> findByTransactionId(String transactionId);
}