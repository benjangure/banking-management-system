package com.banking.banking_management.repository;

import com.banking.banking_management.entity.Beneficiary;
import com.banking.banking_management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByUser(User user);
    List<Beneficiary> findByUserId(Long userId);
    Optional<Beneficiary> findByUserIdAndBeneficiaryAccountNumber(Long userId, String accountNumber);
    Boolean existsByUserIdAndBeneficiaryAccountNumber(Long userId, String accountNumber);
}