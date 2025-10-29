package com.banking.banking_management.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_limits")
public class DailyLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalWithdrawals = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalTransfers = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal withdrawalLimit = new BigDecimal("5000.00");

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal transferLimit = new BigDecimal("10000.00");

    // Constructors
    public DailyLimit() {}

    public DailyLimit(Account account, LocalDate date) {
        this.account = account;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public BigDecimal getTotalWithdrawals() { return totalWithdrawals; }
    public void setTotalWithdrawals(BigDecimal totalWithdrawals) { this.totalWithdrawals = totalWithdrawals; }

    public BigDecimal getTotalTransfers() { return totalTransfers; }
    public void setTotalTransfers(BigDecimal totalTransfers) { this.totalTransfers = totalTransfers; }

    public BigDecimal getWithdrawalLimit() { return withdrawalLimit; }
    public void setWithdrawalLimit(BigDecimal withdrawalLimit) { this.withdrawalLimit = withdrawalLimit; }

    public BigDecimal getTransferLimit() { return transferLimit; }
    public void setTransferLimit(BigDecimal transferLimit) { this.transferLimit = transferLimit; }
}