package com.banking.banking_management.service;

import com.banking.banking_management.dto.BeneficiaryDTO;
import com.banking.banking_management.dto.TransactionRequest;
import com.banking.banking_management.dto.TransactionDTO;
import com.banking.banking_management.entity.Account;
import com.banking.banking_management.entity.Beneficiary;
import com.banking.banking_management.entity.User;
import com.banking.banking_management.exception.ResourceNotFoundException;
import com.banking.banking_management.repository.AccountRepository;
import com.banking.banking_management.repository.BeneficiaryRepository;
import com.banking.banking_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BeneficiaryService {

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionService transactionService;

    public List<BeneficiaryDTO> getUserBeneficiaries(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return beneficiaryRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryDTO addBeneficiary(Long userId, BeneficiaryDTO beneficiaryDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if beneficiary account exists
        Account beneficiaryAccount = accountRepository.findByAccountNumber(beneficiaryDTO.getBeneficiaryAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary account not found"));

        // Check if beneficiary already exists for this user
        if (beneficiaryRepository.existsByUserIdAndBeneficiaryAccountNumber(
                userId, beneficiaryDTO.getBeneficiaryAccountNumber())) {
            throw new IllegalArgumentException("Beneficiary already exists");
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setUser(user);
        beneficiary.setBeneficiaryAccountNumber(beneficiaryDTO.getBeneficiaryAccountNumber());
        beneficiary.setNickname(beneficiaryDTO.getNickname());
        beneficiary.setAccountName(beneficiaryDTO.getAccountName());
        beneficiary.setBankName(beneficiaryDTO.getBankName());

        Beneficiary savedBeneficiary = beneficiaryRepository.save(beneficiary);

        return convertToDTO(savedBeneficiary);
    }

    @Transactional
    public BeneficiaryDTO updateBeneficiary(Long beneficiaryId, BeneficiaryDTO beneficiaryDTO) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        beneficiary.setNickname(beneficiaryDTO.getNickname());
        beneficiary.setAccountName(beneficiaryDTO.getAccountName());
        beneficiary.setBankName(beneficiaryDTO.getBankName());

        Beneficiary updatedBeneficiary = beneficiaryRepository.save(beneficiary);

        return convertToDTO(updatedBeneficiary);
    }

    @Transactional
    public void deleteBeneficiary(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        beneficiaryRepository.delete(beneficiary);
    }

    @Transactional
    public TransactionDTO transferToBeneficiary(Long beneficiaryId, TransactionRequest request) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        // Set the beneficiary's account number in the request
        request.setToAccountNumber(beneficiary.getBeneficiaryAccountNumber());

        // Use the existing transfer service
        return transactionService.transfer(request);
    }

    private BeneficiaryDTO convertToDTO(Beneficiary beneficiary) {
        BeneficiaryDTO dto = new BeneficiaryDTO();
        dto.setId(beneficiary.getId());
        dto.setBeneficiaryAccountNumber(beneficiary.getBeneficiaryAccountNumber());
        dto.setNickname(beneficiary.getNickname());
        dto.setAccountName(beneficiary.getAccountName());
        dto.setBankName(beneficiary.getBankName());
        return dto;
    }
}