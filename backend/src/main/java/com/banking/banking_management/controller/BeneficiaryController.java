package com.banking.banking_management.controller;

import com.banking.banking_management.dto.ApiResponse;
import com.banking.banking_management.dto.BeneficiaryDTO;
import com.banking.banking_management.dto.TransactionDTO;
import com.banking.banking_management.dto.TransactionRequest;
import com.banking.banking_management.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@CrossOrigin(origins = "*")
public class BeneficiaryController {

    @Autowired
    private BeneficiaryService beneficiaryService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<BeneficiaryDTO>>> getUserBeneficiaries(@PathVariable Long userId) {
        List<BeneficiaryDTO> beneficiaries = beneficiaryService.getUserBeneficiaries(userId);
        return ResponseEntity.ok(ApiResponse.success("Beneficiaries retrieved successfully", beneficiaries));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<BeneficiaryDTO>> addBeneficiary(
            @PathVariable Long userId,
            @Valid @RequestBody BeneficiaryDTO beneficiaryDTO) {

        BeneficiaryDTO savedBeneficiary = beneficiaryService.addBeneficiary(userId, beneficiaryDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Beneficiary added successfully", savedBeneficiary));
    }

    @PutMapping("/{beneficiaryId}")
    public ResponseEntity<ApiResponse<BeneficiaryDTO>> updateBeneficiary(
            @PathVariable Long beneficiaryId,
            @Valid @RequestBody BeneficiaryDTO beneficiaryDTO) {

        BeneficiaryDTO updatedBeneficiary = beneficiaryService.updateBeneficiary(beneficiaryId, beneficiaryDTO);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary updated successfully", updatedBeneficiary));
    }

    @DeleteMapping("/{beneficiaryId}")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(@PathVariable Long beneficiaryId) {
        beneficiaryService.deleteBeneficiary(beneficiaryId);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary deleted successfully"));
    }

    @PostMapping("/{beneficiaryId}/transfer")
    public ResponseEntity<ApiResponse<TransactionDTO>> transferToBeneficiary(
            @PathVariable Long beneficiaryId,
            @Valid @RequestBody TransactionRequest request) {

        TransactionDTO transaction = beneficiaryService.transferToBeneficiary(beneficiaryId, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer to beneficiary successful", transaction));
    }
}