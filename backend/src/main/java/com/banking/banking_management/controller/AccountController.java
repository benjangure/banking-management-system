package com.banking.banking_management.controller;

import com.banking.banking_management.dto.AccountDTO;
import com.banking.banking_management.dto.ApiResponse;
import com.banking.banking_management.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAllUserAccounts(@PathVariable Long userId) {
        List<AccountDTO> accounts = accountService.getAllUserAccounts(userId);
        return ResponseEntity.ok(ApiResponse.success("Accounts retrieved successfully", accounts));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<ApiResponse<AccountDTO>> getAccountById(@PathVariable Long accountId) {
        AccountDTO account = accountService.getAccountById(accountId);
        return ResponseEntity.ok(ApiResponse.success("Account retrieved successfully", account));
    }
}