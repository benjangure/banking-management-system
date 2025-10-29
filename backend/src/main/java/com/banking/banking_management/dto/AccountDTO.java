package com.banking.banking_management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountDTO {
    private Long id;
    private String accountNumber;
    private BigDecimal balance;
    private String accountType;
    private Double interestRate;
    private String status;
    private LocalDateTime createdDate;

    // Constructors
    public AccountDTO() {}

    public AccountDTO(Long id, String accountNumber, BigDecimal balance, String accountType,
                      Double interestRate, String status, LocalDateTime createdDate) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.accountType = accountType;
        this.interestRate = interestRate;
        this.status = status;
        this.createdDate = createdDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}