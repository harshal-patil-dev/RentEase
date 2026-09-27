package com.rentease.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.rentease.entity.PasswordResetOtp;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Integer> {

    Optional<PasswordResetOtp> findTopByEmailOrderByIdDesc(String email);

    void deleteByEmail(String email);
    
}