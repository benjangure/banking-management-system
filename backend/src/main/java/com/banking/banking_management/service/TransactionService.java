package com.banking.banking_management.service;

import com.banking.banking_management.dto.TransactionDTO;
import com.banking.banking_management.dto.TransactionRequest;
import com.banking.banking_management.entity.*;
import com.banking.banking_management.exception.DailyLimitExceededException;
import com.banking.banking_management.exception.InsufficientBalanceException;
import com.banking.banking_management.exception.ResourceNotFoundException;
import com.banking.banking_management.repository.AccountRepository;
import com.banking.banking_management.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.banking.banking_management.dto.MonthlySummaryDTO;
import java.time.YearMonth;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private DailyLimitService dailyLimitService;

    @Transactional
    public TransactionDTO deposit(TransactionRequest request) {
        // Get account
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // Validate amount
        if (request.getAmount().compareTo(BigDecimal.ONE) < 0) {
            throw new IllegalArgumentException("Minimum deposit amount is 1.00");
        }

        // Update balance
        BigDecimal newBalance = account.getBalance().add(request.getAmount());
        account.setBalance(newBalance);
        accountRepository.save(account);

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setAmount(request.getAmount());
        transaction.setFromAccount(account);
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Deposit");
        transaction.setBalanceAfter(newBalance);
        transaction.setStatus(TransactionStatus.COMPLETED);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return convertToDTO(savedTransaction);
    }

    @Transactional
    public TransactionDTO withdraw(TransactionRequest request) {
        // Get account
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // Validate amount
        if (request.getAmount().compareTo(BigDecimal.ONE) < 0) {
            throw new IllegalArgumentException("Minimum withdrawal amount is 1.00");
        }

        // Check sufficient balance
        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for withdrawal");
        }

        // Check daily limit
        dailyLimitService.checkWithdrawalLimit(account, request.getAmount());

        // Update balance
        BigDecimal newBalance = account.getBalance().subtract(request.getAmount());
        account.setBalance(newBalance);
        accountRepository.save(account);

        // Update daily limit
        dailyLimitService.updateWithdrawalLimit(account, request.getAmount());

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setTransactionType(TransactionType.WITHDRAWAL);
        transaction.setAmount(request.getAmount());
        transaction.setFromAccount(account);
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Withdrawal");
        transaction.setBalanceAfter(newBalance);
        transaction.setStatus(TransactionStatus.COMPLETED);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return convertToDTO(savedTransaction);
    }

    @Transactional
    public TransactionDTO transfer(TransactionRequest request) {
        // Get sender account
        Account fromAccount = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

        // Get recipient account by account number
        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient account not found"));

        // Validate amount
        if (request.getAmount().compareTo(BigDecimal.ONE) < 0) {
            throw new IllegalArgumentException("Minimum transfer amount is 1.00");
        }

        // Check if trying to transfer to same account
        if (fromAccount.getId().equals(toAccount.getId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        // Check sufficient balance
        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for transfer");
        }

        // Check daily limit
        dailyLimitService.checkTransferLimit(fromAccount, request.getAmount());

        // Update balances
        BigDecimal newFromBalance = fromAccount.getBalance().subtract(request.getAmount());
        BigDecimal newToBalance = toAccount.getBalance().add(request.getAmount());

        fromAccount.setBalance(newFromBalance);
        toAccount.setBalance(newToBalance);

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // Update daily limit
        dailyLimitService.updateTransferLimit(fromAccount, request.getAmount());

        // Create transaction record for sender
        Transaction transaction = new Transaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setTransactionType(TransactionType.TRANSFER);
        transaction.setAmount(request.getAmount());
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(toAccount);
        transaction.setToAccountNumber(toAccount.getAccountNumber());
        transaction.setRecipientName(toAccount.getUser().getFullName());
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Transfer");
        transaction.setBalanceAfter(newFromBalance);
        transaction.setStatus(TransactionStatus.COMPLETED);

        Transaction savedTransaction = transactionRepository.save(transaction);

        return convertToDTO(savedTransaction);
    }

    public List<TransactionDTO> getTransactionHistory(Long accountId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactionPage = transactionRepository.findByAccountIdPaginated(accountId, pageable);

        return transactionPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> getMiniStatement(Long accountId) {
        Pageable pageable = PageRequest.of(0, 10);
        List<Transaction> transactions = transactionRepository.findTopNByAccountId(accountId, pageable);

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TransactionDTO getTransactionById(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return convertToDTO(transaction);
    }

    public List<TransactionDTO> filterTransactions(Long accountId, String type,
                                                   LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions;

        if (type != null && !type.isEmpty()) {
            TransactionType transactionType = TransactionType.valueOf(type.toUpperCase());
            transactions = transactionRepository.findByAccountIdAndType(accountId, transactionType);
        } else if (startDate != null && endDate != null) {
            transactions = transactionRepository.findByAccountIdAndDateRange(accountId, startDate, endDate);
        } else {
            transactions = transactionRepository.findByAccountId(accountId);
        }

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setTransactionId(transaction.getTransactionId());
        dto.setTransactionType(transaction.getTransactionType().name());
        dto.setAmount(transaction.getAmount());
        dto.setFromAccountNumber(transaction.getFromAccount().getAccountNumber());

        if (transaction.getToAccount() != null) {
            dto.setToAccountNumber(transaction.getToAccount().getAccountNumber());
        } else if (transaction.getToAccountNumber() != null) {
            dto.setToAccountNumber(transaction.getToAccountNumber());
        }

        dto.setDescription(transaction.getDescription());
        dto.setTimestamp(transaction.getTimestamp());
        dto.setBalanceAfter(transaction.getBalanceAfter());
        dto.setStatus(transaction.getStatus().name());
        dto.setRecipientName(transaction.getRecipientName());

        return dto;
    }
    public MonthlySummaryDTO getMonthlySummary(Long accountId, int month, int year) {
        // Validate account exists
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // Calculate date range for the month
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get all transactions for the account in the date range
        List<Transaction> transactions = transactionRepository.findByAccountIdAndDateRange(
                accountId, startDate, endDate);

        // Calculate totals
        BigDecimal totalDeposits = BigDecimal.ZERO;
        BigDecimal totalWithdrawals = BigDecimal.ZERO;
        BigDecimal totalTransfers = BigDecimal.ZERO;
        int transactionCount = transactions.size();

        for (Transaction txn : transactions) {
            switch (txn.getTransactionType()) {
                case DEPOSIT:
                    totalDeposits = totalDeposits.add(txn.getAmount());
                    break;
                case WITHDRAWAL:
                    totalWithdrawals = totalWithdrawals.add(txn.getAmount());
                    break;
                case TRANSFER:
                    // Only count transfers OUT from this account
                    if (txn.getFromAccount().getId().equals(accountId)) {
                        totalTransfers = totalTransfers.add(txn.getAmount());
                    }
                    // If it's a transfer IN to this account, count as deposit
                    else if (txn.getToAccount() != null && txn.getToAccount().getId().equals(accountId)) {
                        totalDeposits = totalDeposits.add(txn.getAmount());
                    }
                    break;
            }
        }

        MonthlySummaryDTO summary = new MonthlySummaryDTO();
        summary.setTotalDeposits(totalDeposits);
        summary.setTotalWithdrawals(totalWithdrawals);
        summary.setTotalTransfers(totalTransfers);
        summary.setTransactionCount(transactionCount);
        summary.setMonth(month);
        summary.setYear(year);
        summary.setDepositChange(BigDecimal.ZERO);
        summary.setWithdrawalChange(BigDecimal.ZERO);
        summary.setTransferChange(BigDecimal.ZERO);
        summary.setTransactionChange(0);

        return summary;
    }
}