package com.banking.banking_management.service;

import com.banking.banking_management.dto.AccountDTO;
import com.banking.banking_management.dto.AuthResponse;
import com.banking.banking_management.dto.LoginRequest;
import com.banking.banking_management.dto.RegisterRequest;
import com.banking.banking_management.entity.Account;
import com.banking.banking_management.entity.AccountStatus;
import com.banking.banking_management.entity.AccountType;
import com.banking.banking_management.entity.User;
import com.banking.banking_management.repository.AccountRepository;
import com.banking.banking_management.repository.UserRepository;
import com.banking.banking_management.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        User savedUser = userRepository.save(user);

        // Create default accounts (Savings and Checking)
        List<Account> accounts = createDefaultAccounts(savedUser);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());

        // Convert accounts to DTOs
        List<AccountDTO> accountDTOs = accounts.stream()
                .map(this::convertToAccountDTO)
                .collect(Collectors.toList());

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                token,
                accountDTOs
        );
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by username or email
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Get user's accounts
        List<Account> accounts = accountRepository.findByUser(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        // Convert accounts to DTOs
        List<AccountDTO> accountDTOs = accounts.stream()
                .map(this::convertToAccountDTO)
                .collect(Collectors.toList());

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                token,
                accountDTOs
        );
    }

    private List<Account> createDefaultAccounts(User user) {
        List<Account> accounts = new ArrayList<>();

        // Create Savings Account with $0 initial balance
        Account savingsAccount = new Account();
        savingsAccount.setAccountNumber(generateAccountNumber());
        savingsAccount.setUser(user);
        savingsAccount.setAccountType(AccountType.SAVINGS);
        savingsAccount.setInterestRate(3.5);
        savingsAccount.setBalance(BigDecimal.ZERO);
        savingsAccount.setStatus(AccountStatus.ACTIVE);
        accounts.add(accountRepository.save(savingsAccount));

        // Create Checking Account with $0 initial balance
        Account checkingAccount = new Account();
        checkingAccount.setAccountNumber(generateAccountNumber());
        checkingAccount.setUser(user);
        checkingAccount.setAccountType(AccountType.CHECKING);
        checkingAccount.setInterestRate(0.5);
        checkingAccount.setBalance(BigDecimal.ZERO);
        checkingAccount.setStatus(AccountStatus.ACTIVE);
        accounts.add(accountRepository.save(checkingAccount));

        return accounts;
    }

    private String generateAccountNumber() {
        return "ACC" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    private AccountDTO convertToAccountDTO(Account account) {
        return new AccountDTO(
                account.getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getAccountType().name(),
                account.getInterestRate(),
                account.getStatus().name(),
                account.getCreatedDate()
        );
    }
}