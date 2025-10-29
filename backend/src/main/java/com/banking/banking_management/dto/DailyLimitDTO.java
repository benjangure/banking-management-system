package com.banking.banking_management.dto;

import java.math.BigDecimal;

public class DailyLimitDTO {
    private BigDecimal withdrawalLimit;
    private BigDecimal withdrawalUsed;
    private BigDecimal withdrawalRemaining;
    private BigDecimal transferLimit;
    private BigDecimal transferUsed;
    private BigDecimal transferRemaining;

    // Constructors
    public DailyLimitDTO() {}

    public DailyLimitDTO(BigDecimal withdrawalLimit, BigDecimal withdrawalUsed,
                         BigDecimal transferLimit, BigDecimal transferUsed) {
        this.withdrawalLimit = withdrawalLimit;
        this.withdrawalUsed = withdrawalUsed;
        this.withdrawalRemaining = withdrawalLimit.subtract(withdrawalUsed);
        this.transferLimit = transferLimit;
        this.transferUsed = transferUsed;
        this.transferRemaining = transferLimit.subtract(transferUsed);
    }

    // Getters and Setters
    public BigDecimal getWithdrawalLimit() { return withdrawalLimit; }
    public void setWithdrawalLimit(BigDecimal withdrawalLimit) { this.withdrawalLimit = withdrawalLimit; }

    public BigDecimal getWithdrawalUsed() { return withdrawalUsed; }
    public void setWithdrawalUsed(BigDecimal withdrawalUsed) { this.withdrawalUsed = withdrawalUsed; }

    public BigDecimal getWithdrawalRemaining() { return withdrawalRemaining; }
    public void setWithdrawalRemaining(BigDecimal withdrawalRemaining) { this.withdrawalRemaining = withdrawalRemaining; }

    public BigDecimal getTransferLimit() { return transferLimit; }
    public void setTransferLimit(BigDecimal transferLimit) { this.transferLimit = transferLimit; }

    public BigDecimal getTransferUsed() { return transferUsed; }
    public void setTransferUsed(BigDecimal transferUsed) { this.transferUsed = transferUsed; }

    public BigDecimal getTransferRemaining() { return transferRemaining; }
    public void setTransferRemaining(BigDecimal transferRemaining) { this.transferRemaining = transferRemaining; }
}