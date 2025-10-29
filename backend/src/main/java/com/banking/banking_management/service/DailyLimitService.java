package com.banking.banking_management.service;

import com.banking.banking_management.dto.DailyLimitDTO;
import com.banking.banking_management.entity.Account;
import com.banking.banking_management.entity.DailyLimit;
import com.banking.banking_management.exception.DailyLimitExceededException;
import com.banking.banking_management.exception.ResourceNotFoundException;
import com.banking.banking_management.repository.AccountRepository;
import com.banking.banking_management.repository.DailyLimitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DailyLimitService {

    @Autowired
    private DailyLimitRepository dailyLimitRepository;

    @Autowired
    private AccountRepository accountRepository;

    private static final BigDecimal DEFAULT_WITHDRAWAL_LIMIT = new BigDecimal("5000.00");
    private static final BigDecimal DEFAULT_TRANSFER_LIMIT = new BigDecimal("10000.00");

    public DailyLimitDTO getDailyLimit(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        DailyLimit dailyLimit = getOrCreateDailyLimit(account);

        return new DailyLimitDTO(
                dailyLimit.getWithdrawalLimit(),
                dailyLimit.getTotalWithdrawals(),
                dailyLimit.getTransferLimit(),
                dailyLimit.getTotalTransfers()
        );
    }

    @Transactional
    public void checkWithdrawalLimit(Account account, BigDecimal amount) {
        DailyLimit dailyLimit = getOrCreateDailyLimit(account);

        BigDecimal newTotal = dailyLimit.getTotalWithdrawals().add(amount);

        if (newTotal.compareTo(dailyLimit.getWithdrawalLimit()) > 0) {
            BigDecimal remaining = dailyLimit.getWithdrawalLimit().subtract(dailyLimit.getTotalWithdrawals());
            throw new DailyLimitExceededException(
                    String.format("Daily withdrawal limit exceeded. Remaining limit: $%.2f", remaining)
            );
        }
    }

    @Transactional
    public void checkTransferLimit(Account account, BigDecimal amount) {
        DailyLimit dailyLimit = getOrCreateDailyLimit(account);

        BigDecimal newTotal = dailyLimit.getTotalTransfers().add(amount);

        if (newTotal.compareTo(dailyLimit.getTransferLimit()) > 0) {
            BigDecimal remaining = dailyLimit.getTransferLimit().subtract(dailyLimit.getTotalTransfers());
            throw new DailyLimitExceededException(
                    String.format("Daily transfer limit exceeded. Remaining limit: $%.2f", remaining)
            );
        }
    }

    @Transactional
    public void updateWithdrawalLimit(Account account, BigDecimal amount) {
        DailyLimit dailyLimit = getOrCreateDailyLimit(account);
        dailyLimit.setTotalWithdrawals(dailyLimit.getTotalWithdrawals().add(amount));
        dailyLimitRepository.save(dailyLimit);
    }

    @Transactional
    public void updateTransferLimit(Account account, BigDecimal amount) {
        DailyLimit dailyLimit = getOrCreateDailyLimit(account);
        dailyLimit.setTotalTransfers(dailyLimit.getTotalTransfers().add(amount));
        dailyLimitRepository.save(dailyLimit);
    }

    private DailyLimit getOrCreateDailyLimit(Account account) {
        LocalDate today = LocalDate.now();

        return dailyLimitRepository.findByAccountAndDate(account, today)
                .orElseGet(() -> {
                    DailyLimit newLimit = new DailyLimit();
                    newLimit.setAccount(account);
                    newLimit.setDate(today);
                    newLimit.setTotalWithdrawals(BigDecimal.ZERO);
                    newLimit.setTotalTransfers(BigDecimal.ZERO);
                    newLimit.setWithdrawalLimit(DEFAULT_WITHDRAWAL_LIMIT);
                    newLimit.setTransferLimit(DEFAULT_TRANSFER_LIMIT);
                    return dailyLimitRepository.save(newLimit);
                });
    }

    // Scheduled job to reset limits at midnight
    @Scheduled(cron = "0 0 0 * * ?") // Runs at midnight every day
    @Transactional
    public void resetDailyLimits() {
        // The limits will auto-reset when getOrCreateDailyLimit is called
        // on a new day, so this is mainly for cleanup of old records if needed
        System.out.println("Daily limits will be reset automatically on next transaction");
    }
}