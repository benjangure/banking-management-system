package com.banking.banking_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BankingManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(BankingManagementApplication.class, args);
    }
}