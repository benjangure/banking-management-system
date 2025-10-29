package com.banking.banking_management.controller;

import com.banking.banking_management.dto.ApiResponse;
import com.banking.banking_management.dto.DailyLimitDTO;
import com.banking.banking_management.service.DailyLimitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/daily-limits")
@CrossOrigin(origins = "*")
public class DailyLimitController {

    @Autowired
    private DailyLimitService dailyLimitService;

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<DailyLimitDTO>> getDailyLimit(@PathVariable Long accountId) {
        DailyLimitDTO dailyLimit = dailyLimitService.getDailyLimit(accountId);
        return ResponseEntity.ok(ApiResponse.success("Daily limit retrieved successfully", dailyLimit));
    }
}