package com.banking.banking_management.dto;

import java.math.BigDecimal;

public class MonthlySummaryDTO {
    private BigDecimal totalDeposits;
    private BigDecimal totalWithdrawals;
    private BigDecimal totalTransfers;
    private Integer transactionCount;
    private Integer month;
    private Integer year;
    private BigDecimal depositChange;
    private BigDecimal withdrawalChange;
    private BigDecimal transferChange;
    private Integer transactionChange;

    // Constructors
    public MonthlySummaryDTO() {
        this.totalDeposits = BigDecimal.ZERO;
        this.totalWithdrawals = BigDecimal.ZERO;
        this.totalTransfers = BigDecimal.ZERO;
        this.transactionCount = 0;
        this.depositChange = BigDecimal.ZERO;
        this.withdrawalChange = BigDecimal.ZERO;
        this.transferChange = BigDecimal.ZERO;
        this.transactionChange = 0;
    }

    public MonthlySummaryDTO(BigDecimal totalDeposits, BigDecimal totalWithdrawals,
                             BigDecimal totalTransfers, Integer transactionCount,
                             Integer month, Integer year) {
        this.totalDeposits = totalDeposits != null ? totalDeposits : BigDecimal.ZERO;
        this.totalWithdrawals = totalWithdrawals != null ? totalWithdrawals : BigDecimal.ZERO;
        this.totalTransfers = totalTransfers != null ? totalTransfers : BigDecimal.ZERO;
        this.transactionCount = transactionCount != null ? transactionCount : 0;
        this.month = month;
        this.year = year;
        this.depositChange = BigDecimal.ZERO;
        this.withdrawalChange = BigDecimal.ZERO;
        this.transferChange = BigDecimal.ZERO;
        this.transactionChange = 0;
    }

    // Getters and Setters
    public BigDecimal getTotalDeposits() {
        return totalDeposits;
    }

    public void setTotalDeposits(BigDecimal totalDeposits) {
        this.totalDeposits = totalDeposits;
    }

    public BigDecimal getTotalWithdrawals() {
        return totalWithdrawals;
    }

    public void setTotalWithdrawals(BigDecimal totalWithdrawals) {
        this.totalWithdrawals = totalWithdrawals;
    }

    public BigDecimal getTotalTransfers() {
        return totalTransfers;
    }

    public void setTotalTransfers(BigDecimal totalTransfers) {
        this.totalTransfers = totalTransfers;
    }

    public Integer getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(Integer transactionCount) {
        this.transactionCount = transactionCount;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getDepositChange() {
        return depositChange;
    }

    public void setDepositChange(BigDecimal depositChange) {
        this.depositChange = depositChange;
    }

    public BigDecimal getWithdrawalChange() {
        return withdrawalChange;
    }

    public void setWithdrawalChange(BigDecimal withdrawalChange) {
        this.withdrawalChange = withdrawalChange;
    }

    public BigDecimal getTransferChange() {
        return transferChange;
    }

    public void setTransferChange(BigDecimal transferChange) {
        this.transferChange = transferChange;
    }

    public Integer getTransactionChange() {
        return transactionChange;
    }

    public void setTransactionChange(Integer transactionChange) {
        this.transactionChange = transactionChange;
    }
}