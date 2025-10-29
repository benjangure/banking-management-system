package com.banking.banking_management.dto;

import jakarta.validation.constraints.NotBlank;

public class BeneficiaryDTO {
    private Long id;

    @NotBlank(message = "Account number is required")
    private String beneficiaryAccountNumber;

    @NotBlank(message = "Nickname is required")
    private String nickname;

    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    // Constructors
    public BeneficiaryDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBeneficiaryAccountNumber() { return beneficiaryAccountNumber; }
    public void setBeneficiaryAccountNumber(String beneficiaryAccountNumber) {
        this.beneficiaryAccountNumber = beneficiaryAccountNumber;
    }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
}