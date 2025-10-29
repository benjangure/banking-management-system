package com.banking.banking_management.dto;

import java.util.List;

public class AuthResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String token;
    private List<AccountDTO> accounts;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(Long userId, String username, String email, String fullName, String token, List<AccountDTO> accounts) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.token = token;
        this.accounts = accounts;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public List<AccountDTO> getAccounts() { return accounts; }
    public void setAccounts(List<AccountDTO> accounts) { this.accounts = accounts; }
}