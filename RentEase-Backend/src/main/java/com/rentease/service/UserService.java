package com.rentease.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rentease.dto.ChangePasswordRequest;
import com.rentease.dto.LoginRequest;
import com.rentease.dto.ResetPasswordRequest;
import com.rentease.dto.VerifyOtpRequest;
import com.rentease.entity.PasswordResetOtp;
import com.rentease.entity.User;
import com.rentease.repository.PasswordResetOtpRepository;
import com.rentease.repository.UserRepository;
import com.rentease.security.JwtService;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private EmailService emailService;

	@Autowired
	private PasswordResetOtpRepository passwordResetOtpRepository;

	public Map<String, Object> register(User user) {

		Map<String, Object> response = new LinkedHashMap<>();

		// validation for name
		if (user.getName() == null) {
			response.put("Error", "Name is required.");
			return response;
		} else if (user.getName().isBlank()) {
			response.put("Error", "Name cannot be blank.");
			return response;
		}

		// validation for email
		if (user.getEmail() == null || user.getEmail().isBlank()) {
			response.put("Error", "Email is required.");
			return response;

		} else if (!isValidEmail(user.getEmail())) {
			response.put("Error", "Please enter a valid email address.");
			return response;

		} else if (userRepository.existsByEmail(user.getEmail())) {
			response.put("Error", "Email is already registered.");
			return response;
		}

		// validation for password
		if (user.getPassword() == null || user.getPassword().isBlank()) {
			response.put("Error", "Password is required.");
			return response;

		} else if (!isValidPassword(user.getPassword())) {
			response.put("Error", "Password must be at least 8 characters long.");
			return response;
		}

		// validation for phone
		if (user.getPhone() == null || user.getPhone().isBlank()) {
			response.put("Error", "Phone number is required.");
			return response;

		} else if (!isValidMobile(user.getPhone())) {
			response.put("Error", "Phone number must contain exactly 10 digits.");
			return response;

		} else if (userRepository.existsByPhone(user.getPhone())) {
			response.put("Error", "Phone number is already registered.");
			return response;
		}

		// validation for role
		if (user.getRole() == null || user.getRole().isBlank()) {
			response.put("Error", "Role is required.");
			return response;

		} else if (!user.getRole().equalsIgnoreCase("TENANT") && !user.getRole().equalsIgnoreCase("OWNER")) {
			response.put("Error", "Invalid role. Allowed roles are TENANT and OWNER.");
			return response;
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));

		userRepository.save(user);
		response.put("Success", "Registration successful.");
		return response;
	}

	private boolean isValidEmail(String email) {
		return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

	}

	private boolean isValidMobile(String mobile) {
		return mobile.matches("[0-9]{10}");

	}

	private boolean isValidPassword(String password) {
		return password.matches(".{8,}");
	}

	public Map<String, Object> login(LoginRequest loginRequest) {

		Map<String, Object> response = new LinkedHashMap<>();

		// validation for email
		if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()) {
			response.put("Error", "Email is required.");
			return response;

		} else if (!isValidEmail(loginRequest.getEmail())) {
			response.put("Error", "Please enter a valid email address.");
			return response;

		}

		Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

		if (userOptional.isEmpty()) {
			response.put("Error", "Invalid email or password.");
			return response;
		}

		User user = userOptional.get();

		// validation for password
		if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
			response.put("Error", "Password is required.");
			return response;

		} else if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
			response.put("Error", "Invalid email or password.");
			return response;
		}

		String token = jwtService.generateToken(user.getEmail());

		response.put("Success", "Login successful.");
		response.put("Token", token);
		response.put("Role", user.getRole());

		return response;
	}

	public User getProfile(String email) {

		Optional<User> userOptional = userRepository.findByEmail(email);
		if (userOptional.isEmpty()) {
			return null;
		}

		User user = userOptional.get();
		user.setPassword(null);
		return user;
	}

	public Map<String, Object> updateProfile(String email, User user) {

		Map<String, Object> response = new LinkedHashMap<>();

		Optional<User> userFind = userRepository.findByEmail(email);

		if (userFind.isEmpty()) {
			response.put("Error", "Invalid email user not found.");
			return response;

		}

		// validation for name
		if (user.getName() == null) {
			response.put("Error", "Name is required.");
			return response;

		} else if (user.getName().isBlank()) {
			response.put("Error", "Name cannot be blank.");
			return response;

		}

		// validation for phone
		if (user.getPhone() == null || user.getPhone().isBlank()) {
			response.put("Error", "Phone number is required.");
			return response;

		} else if (!isValidMobile(user.getPhone())) {
			response.put("Error", "Phone number must contain exactly 10 digits.");
			return response;

		}

		User existingUser = userFind.get();

		Optional<User> phoneFind = userRepository.findByPhone(user.getPhone());

		if (phoneFind.isPresent() && phoneFind.get().getId() != existingUser.getId()) {
			response.put("Error", "Phone number is already registered.");
			return response;

		}

		existingUser.setName(user.getName());
		existingUser.setPhone(user.getPhone());
		userRepository.save(existingUser);

		response.put("Success", "Profile updated successfully.");
		return response;

	}

	public Map<String, Object> changePassword(String email, ChangePasswordRequest request) {

		Map<String, Object> response = new LinkedHashMap<>();

		Optional<User> userFind = userRepository.findByEmail(email);

		if (userFind.isEmpty()) {
			response.put("Error", "Invalid email user not found.");
			return response;

		}

		User existingUser = userFind.get();

		if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {

			response.put("Error", "Current password is required.");
			return response;
		}

		if (!passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword())) {

			response.put("Error", "Current password is incorrect.");
			return response;
		}

		if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {

			response.put("Error", "New password is required.");
			return response;
		}

		if (request.getNewPassword().length() < 8) {

			response.put("Error", "New password must contain at least 8 characters.");
			return response;
		}

		if (request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {

			response.put("Error", "Confirm password is required.");
			return response;
		}

		if (!request.getNewPassword().equals(request.getConfirmPassword())) {

			response.put("Error", "New password and confirm password do not match.");
			return response;
		}

		if (passwordEncoder.matches(request.getNewPassword(), existingUser.getPassword())) {

			response.put("Error", "New password must be different from current password.");
			return response;
		}

		existingUser.setPassword(passwordEncoder.encode(request.getNewPassword()));

		userRepository.save(existingUser);

		response.put("Success", "Password changed successfully.");
		return response;

	}

	@Transactional
	public Map<String, Object> forgotPassword(String email) {

		Map<String, Object> response = new LinkedHashMap<>();

		Optional<User> userFind = userRepository.findByEmail(email);

		if (userFind.isEmpty()) {
			response.put("Error", "Email address not found.");
			return response;
		}

		String otp = String.valueOf((int) (Math.random() * 900000) + 100000);

		PasswordResetOtp passwordResetOtp = new PasswordResetOtp();

		passwordResetOtp.setEmail(email);
		passwordResetOtp.setOtp(otp);
		passwordResetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));

		passwordResetOtpRepository.deleteByEmail(email);

		passwordResetOtpRepository.save(passwordResetOtp);

		emailService.sendEmail(email, "RentEase Password Reset OTP", "Your password reset OTP is: " + otp);

		response.put("Success", "OTP sent successfully.");
		return response;
	}

	public Map<String, Object> verifyOtp(VerifyOtpRequest request) {

		Map<String, Object> response = new LinkedHashMap<>();

		Optional<PasswordResetOtp> otpFind = passwordResetOtpRepository.findTopByEmailOrderByIdDesc(request.getEmail());

		if (otpFind.isEmpty()) {
			response.put("Error", "OTP not found.");
			return response;
		}

		PasswordResetOtp resetOtp = otpFind.get();

		if (request.getOtp() == null || request.getOtp().isBlank()) {
			response.put("Error", "OTP is required.");
			return response;
		}

		if (!resetOtp.getOtp().equals(request.getOtp())) {
			response.put("Error", "Invalid OTP.");
			return response;
		}

		if (LocalDateTime.now().isAfter(resetOtp.getExpiryTime())) {
			response.put("Error", "OTP has expired.");
			return response;
		}

		String resetToken = UUID.randomUUID().toString();

		resetOtp.setResetToken(resetToken);
		passwordResetOtpRepository.save(resetOtp);

		response.put("Success", "OTP verified successfully.");
		response.put("ResetToken", resetToken);

		return response;
	}

	public Map<String, Object> resetPassword(ResetPasswordRequest request) {

		Map<String, Object> response = new LinkedHashMap<>();

		Optional<PasswordResetOtp> otpFind = passwordResetOtpRepository.findTopByEmailOrderByIdDesc(request.getEmail());

		if (otpFind.isEmpty()) {
			response.put("Error", "Invalid reset request.");
			return response;
		}

		PasswordResetOtp resetOtp = otpFind.get();

		if (request.getResetToken() == null || request.getResetToken().isBlank()) {
			response.put("Error", "Reset token is required.");
			return response;
		}

		if (!resetOtp.getResetToken().equals(request.getResetToken())) {
			response.put("Error", "Invalid reset token.");
			return response;
		}

		if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
			response.put("Error", "New password is required.");
			return response;
		}

		if (request.getNewPassword().length() < 8) {
			response.put("Error", "New password must contain at least 8 characters.");
			return response;
		}

		if (request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {
			response.put("Error", "Confirm password is required.");
			return response;
		}

		if (!request.getNewPassword().equals(request.getConfirmPassword())) {
			response.put("Error", "Passwords do not match.");
			return response;
		}

		Optional<User> userFind = userRepository.findByEmail(request.getEmail());

		if (userFind.isEmpty()) {
			response.put("Error", "Invalid reset request.");
			return response;
		}

		User user = userFind.get();

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));

		userRepository.save(user);

		resetOtp.setResetToken(null);
		passwordResetOtpRepository.save(resetOtp);

		response.put("Success", "Password reset successfully.");

		return response;
	}

}
