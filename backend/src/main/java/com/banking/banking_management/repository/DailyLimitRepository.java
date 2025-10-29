package com.banking.banking_management.repository;

import com.banking.banking_management.entity.Account;
import com.banking.banking_management.entity.DailyLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyLimitRepository extends JpaRepository<DailyLimit, Long> {
    Optional<DailyLimit> findByAccountAndDate(Account account, LocalDate date);
    Optional<DailyLimit> findByAccountIdAndDate(Long accountId, LocalDate date);
}